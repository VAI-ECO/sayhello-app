/**
 * SAY HELLO API CLIENT
 *
 * Typed client against sayhello-api backend.
 * - Auth token storage in secure storage (never AsyncStorage)
 * - Automatic token attachment
 * - Case transformation (snake_case ↔ camelCase)
 * - Single error shape
 *
 * ⚠️ NO BUSINESS FIGURES HARDCODED IN APP
 * Prices, points, commission, caps, radii, and clocks come from API or config.
 */

import * as TokenStore from './token-store';
import Constants from 'expo-constants';
import { keysToCamel, keysToSnake } from '../lib/case-transform';

const TOKEN_KEY = 'auth_token';

// Request timeout in milliseconds
// 10 seconds: short enough to fail fast on bad signal, long enough for reasonable requests
// Users are in bars with spotty WiFi — this is the common case, not the edge case
const REQUEST_TIMEOUT_MS = 10000;

// Read API URL from environment, with sane default
// iOS Simulator: localhost works
// Android Emulator: use 10.0.2.2
// Physical Device: set API_URL in .env to your machine's LAN IP
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Global 401 handler - registered by app root
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Register a handler to be called when a 401 response is received
 * Should navigate to sign-in screen
 * Call this once from app root (_layout.tsx)
 */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedCallback = handler;
}

interface APIError {
  message: string;
  code?: string;
  status?: number;
  lockedUntil?: number;
  attemptsRemaining?: number;
}

interface APIResponse<T = unknown> {
  data?: T;
  error?: APIError;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;
  private sessionRevision = 0;
  private storageWrites: Promise<void> = Promise.resolve();

  private persistSession(write: () => Promise<void>): Promise<void> {
    const pending = this.storageWrites.then(write);
    // Preserve ordering even when a prior Keychain write failed.
    this.storageWrites = pending.catch(() => {});
    return pending;
  }

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    console.log(`[API Client] Base URL: ${this.baseURL}`);
  }

  /**
   * Initialize client by loading stored token
   */
  async init(): Promise<void> {
    await this.storageWrites;
    const revision = this.sessionRevision;
    const stored = await TokenStore.getToken(TOKEN_KEY);
    if (revision !== this.sessionRevision) return;
    if (stored !== this.token) this.sessionRevision++;
    this.token = stored;
    if (this.token) {
      console.log('[API Client] Token loaded from SecureStore');
    }
  }

  /** Presence only; the token itself never leaves secure client storage. */
  hasSession(): boolean {
    return Boolean(this.token);
  }

  /**
   * Store auth token securely
   */
  async setToken(token: string): Promise<void> {
    const revision = ++this.sessionRevision;
    this.token = token;
    try {
      await this.persistSession(() => TokenStore.setToken(TOKEN_KEY, token));
    } catch (error) {
      if (revision === this.sessionRevision) {
        this.token = null;
        this.sessionRevision++;
      }
      throw error;
    }
    console.log('[API Client] Token stored in SecureStore');
  }

  /**
   * Clear auth token
   */
  async clearToken(): Promise<void> {
    this.sessionRevision++;
    this.token = null;
    await this.persistSession(() => TokenStore.deleteToken(TOKEN_KEY));
    console.log('[API Client] Token cleared from SecureStore');
  }

  /**
   * Make authenticated request with case transformation and timeout
   *
   * Request bodies: camelCase → snake_case
   * Response bodies: snake_case → camelCase
   * Timeout: 10 seconds (fail fast on bad signal)
   * 401 handling: Clears token and calls registered handler
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const requestRevision = this.sessionRevision;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      // Transform request body from camelCase to snake_case
      let body = options.body;
      if (body && typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          const transformed = keysToSnake(parsed);
          body = JSON.stringify(transformed);
        } catch {
          // If body isn't valid JSON, leave it as-is
        }
      }

      const url = `${this.baseURL}${endpoint}`;
      console.log(`[API Client] ${options.method || 'GET'} ${url}`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const rawData = await response.json();

        // Never deliver old-account data or expire a newer sign-in.
        if (requestRevision !== this.sessionRevision) {
          return { error: { code: 'SESSION_CHANGED', message: 'Your sign-in changed. Please try again.' } };
        }

        if (!response.ok) {
          // Handle 401 Unauthorized globally
          if (response.status === 401) {
            console.log('[API Client] 401 Unauthorized - clearing token');
            await this.clearToken();
            if (onUnauthorizedCallback && this.sessionRevision === requestRevision + 1) {
              onUnauthorizedCallback();
            }
          }

          // Transform error response to camelCase
          const errorData = keysToCamel<any>(rawData);
          return {
            error: {
              message: errorData.message || 'An error occurred',
              code: errorData.error || errorData.code,
              status: response.status,
              lockedUntil: errorData.lockedUntil,
              attemptsRemaining: errorData.attemptsRemaining,
            },
          };
        }

        // Transform success response to camelCase
        const data = keysToCamel<T>(rawData);
        return { data };
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Check if error was caused by timeout
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('[API Client] Request timed out');
          return {
            error: {
              message: 'Request timed out. Please check your connection and try again.',
              code: 'TIMEOUT',
            },
          };
        }

        throw fetchError;
      }
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  /**
   * Generic GET request
   */
  async get<T = unknown>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Generic POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Generic DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Auth endpoints
   */
  auth = {
    /**
     * Request OTP code
     * Backend: POST /auth/request-otp
     */
    requestOTP: async (phoneNumber: string, dateOfBirth: string): Promise<APIResponse> => {
      return this.request('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, dateOfBirth }),
      });
    },

    /**
     * Verify OTP code and get token
     * Backend: POST /auth/verify-otp
     */
    verifyOTP: async (
      phoneNumber: string,
      code: string,
      locale: string
    ): Promise<APIResponse<{ token: string }>> => {
      const response = await this.request<{ sessionToken?: unknown; token?: unknown }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code, locale }),
      });

      if (response.error) return { error: response.error };

      // Current backend returns sessionToken; keep compatibility with older token responses.
      const token = response.data?.sessionToken ?? response.data?.token;
      if (typeof token !== 'string' || token.trim().length === 0) {
        return { error: { code: 'INVALID_AUTH_RESPONSE', message: 'Could not complete sign-in. Please try again.' } };
      }

      try {
        await this.setToken(token);
      } catch {
        // setToken clears only its own failed attempt, never a newer sign-in.
        return { error: { code: 'SESSION_STORAGE_ERROR', message: 'Could not save your sign-in securely. Please try again.' } };
      }

      return { data: { token } };
    },

    /**
     * Sign out (client-side only - clears token)
     * No backend endpoint for this
     */
    signOut: async (): Promise<void> => {
      await this.clearToken();
    },
  };

  /**
   * User endpoints
   */
  user = {
    /** Send image bytes, never a device-local file URI. */
    uploadProfilePhoto: async (bytes: ArrayBuffer, contentType: string): Promise<APIResponse<{ profilePhotoUrl: string }>> => {
      return this.request('/users/me/photo', {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: bytes,
      });
    },

    /**
     * Get current user profile
     * Backend: GET /users/me
     */
    getProfile: async (): Promise<APIResponse> => {
      const response = await this.request<{ user?: Record<string, unknown> }>('/users/me');
      // The server wraps the profile in { user }; screens consume the profile itself.
      // Retain compatibility with flat responses from older servers.
      if (response.data?.user && typeof response.data.user === 'object') {
        return { ...response, data: response.data.user };
      }
      return response;
    },

    /**
     * Update user profile
     * Backend: PATCH /users/me
     */
    updateProfile: async (data: Record<string, unknown>): Promise<APIResponse> => {
      return this.request('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  };

  /**
   * Icebreakers endpoints
   */
  icebreakers = {
    /**
     * Get all icebreaker questions
     * Backend: GET /icebreakers/questions
     */
    getQuestions: async (): Promise<APIResponse> => {
      return this.request('/icebreakers/questions');
    },

    /**
     * Get user's icebreaker answers
     * Backend: GET /icebreakers/my-answers
     */
    getMyAnswers: async (): Promise<APIResponse> => {
      return this.request('/icebreakers/my-answers');
    },

    /**
     * Save or update an answer
     * Backend: POST /icebreakers/answers
     * Supports text, multiple choice, and slider answers
     */
    saveAnswer: async (
      questionId: string,
      answer: {
        selectedOptionIds?: string[];
        freeTextAnswer?: string;
        sliderValue?: number;
        contentLanguage?: string;
      }
    ): Promise<APIResponse> => {
      return this.request('/icebreakers/answers', {
        method: 'POST',
        body: JSON.stringify({ questionId, ...answer }),
      });
    },
  };
}

// Export singleton instance
export const api = new APIClient();
