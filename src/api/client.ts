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

import * as SecureStore from 'expo-secure-store';
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

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    console.log(`[API Client] Base URL: ${this.baseURL}`);
  }

  /**
   * Initialize client by loading stored token
   */
  async init(): Promise<void> {
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (this.token) {
      console.log('[API Client] Token loaded from SecureStore');
    }
  }

  /**
   * Store auth token securely
   */
  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('[API Client] Token stored in SecureStore');
  }

  /**
   * Clear auth token
   */
  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
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

        if (!response.ok) {
          // Handle 401 Unauthorized globally
          if (response.status === 401) {
            console.log('[API Client] 401 Unauthorized - clearing token');
            await this.clearToken();
            if (onUnauthorizedCallback) {
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
      const response = await this.request<{ token: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code, locale }),
      });

      if (response.data?.token) {
        await this.setToken(response.data.token);
      }

      return response;
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
    /**
     * Get current user profile
     * Backend: GET /users/me
     */
    getProfile: async (): Promise<APIResponse> => {
      return this.request('/users/me');
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
