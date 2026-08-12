/**
 * SAY HELLO API CLIENT
 *
 * Typed client against sayhello-api backend.
 * - Auth token storage in secure storage (never AsyncStorage)
 * - Automatic token attachment
 * - Single error shape
 *
 * ⚠️ NO BUSINESS FIGURES HARDCODED IN APP
 * Prices, points, commission, caps, radii, and clocks come from API or config.
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

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

  constructor(baseURL: string = 'http://localhost:54321') {
    this.baseURL = baseURL;
  }

  /**
   * Initialize client by loading stored token
   */
  async init(): Promise<void> {
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
  }

  /**
   * Store auth token securely
   */
  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  /**
   * Clear auth token
   */
  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  /**
   * Make authenticated request
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

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.message || 'An error occurred',
            code: data.error || data.code,
            status: response.status,
            lockedUntil: data.lockedUntil,
            attemptsRemaining: data.attemptsRemaining,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  /**
   * Auth endpoints
   */
  auth = {
    sendOTP: async (phone: string): Promise<APIResponse> => {
      return this.request('/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    verifyOTP: async (phone: string, code: string): Promise<APIResponse<{ token: string }>> => {
      const response = await this.request<{ token: string }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });

      if (response.data?.token) {
        await this.setToken(response.data.token);
      }

      return response;
    },

    signOut: async (): Promise<void> => {
      await this.clearToken();
    },
  };

  /**
   * User endpoints - placeholders for now
   */
  user = {
    getProfile: async (): Promise<APIResponse> => {
      return this.request('/user/profile');
    },

    updateProfile: async (data: Record<string, unknown>): Promise<APIResponse> => {
      return this.request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  };
}

// Export singleton instance
export const api = new APIClient();
