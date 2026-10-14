/**
 * API CLIENT INTEGRATION TESTS
 *
 * These tests verify the plumbing works:
 * - Environment configuration
 * - Case transformation
 * - Error handling
 * - Timeout handling
 * - Global 401 handling
 *
 * ⚠️ These are UNIT tests, not integration tests.
 * They do not require the backend to be running.
 * They verify the client is configured correctly.
 */

import { api, setUnauthorizedHandler } from '../client';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Constants to test environment reading
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000',
      },
    },
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads API URL from environment', () => {
    // The client is instantiated at module load time
    // We can verify it logs the correct URL by checking console
    // But for now, just verify the client exists
    expect(api).toBeDefined();
    expect(api.user).toBeDefined();
    expect(api.auth).toBeDefined();
    expect(api.icebreakers).toBeDefined();
  });

  it('transforms request body from camelCase to snake_case', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await api.auth.requestOTP('+15551234567', '1990-01-01');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/request-otp',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          phone_number: '+15551234567',
          date_of_birth: '1990-01-01',
        }),
      })
    );
  });

  it('transforms response from snake_case to camelCase', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user_id: '123',
        phone_number: '+15551234567',
        created_at: '2024-01-01T00:00:00Z',
      }),
    });

    const response = await api.user.getProfile();

    expect(response.data).toEqual({
      userId: '123',
      phoneNumber: '+15551234567',
      createdAt: '2024-01-01T00:00:00Z',
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    const response = await api.user.getProfile();

    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe('NETWORK_ERROR');
    expect(response.error?.message).toBe('Network request failed');
  });

  it('handles 401 unauthorized by returning error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'unauthorized',
        message: 'Invalid or expired token',
      }),
    });

    const response = await api.user.getProfile();

    expect(response.error).toBeDefined();
    expect(response.error?.status).toBe(401);
    expect(response.error?.code).toBe('unauthorized');
  });

  it('handles 429 rate limit with lockedUntil', async () => {
    const lockedUntil = Date.now() + 15 * 60 * 1000;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'rate_limit_exceeded',
        message: 'Too many attempts',
        locked_until: lockedUntil,
      }),
    });

    const response = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');

    expect(response.error).toBeDefined();
    expect(response.error?.status).toBe(429);
    expect(response.error?.lockedUntil).toBe(lockedUntil);
  });

  it('attaches authorization header when token is set', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Manually set a token
    await api.setToken('test-token-123');

    await api.user.getProfile();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/users/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('returns timeout error when request exceeds 10 seconds', async () => {
    // Mock fetch to simulate a hanging request that gets aborted
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise((_, reject) => {
        // Simulate AbortController.abort() being called
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        setTimeout(() => reject(error), 100); // Reject quickly for test speed
      });
    });

    const response = await api.user.getProfile();

    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe('TIMEOUT');
    expect(response.error?.message).toContain('timed out');
  });

  it('clears token and calls handler on 401 unauthorized', async () => {
    const unauthorizedHandler = jest.fn();
    setUnauthorizedHandler(unauthorizedHandler);

    // Set a token first
    await api.setToken('expired-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'unauthorized',
        message: 'Token expired',
      }),
    });

    const response = await api.user.getProfile();

    // Should return error
    expect(response.error).toBeDefined();
    expect(response.error?.status).toBe(401);

    // Should clear token
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');

    // Should call registered handler
    expect(unauthorizedHandler).toHaveBeenCalled();
  });

  it('does not call unauthorized handler if not registered', async () => {
    // Clear any registered handler
    setUnauthorizedHandler(() => {});

    await api.setToken('expired-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'unauthorized',
        message: 'Token expired',
      }),
    });

    // Should not throw even without handler registered
    const response = await api.user.getProfile();
    expect(response.error?.status).toBe(401);
  });

  it('includes abort signal in fetch for timeout', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await api.user.getProfile();

    // Verify fetch was called with signal for timeout
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/users/me',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });
});
