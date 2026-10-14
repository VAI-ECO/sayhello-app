import { api } from '../client';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('OTP session contract', () => {
  beforeEach(async () => {
    await api.clearToken();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('stores the actual backend sessionToken and authenticates the following request', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'user-1' }, sessionToken: 'signed-session' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'user-1' } }) });
    const response = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(response).toEqual({ data: { token: 'signed-session' } });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'signed-session');
    expect(api.hasSession()).toBe(true);
    await api.user.getProfile();
    expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/users/me'), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer signed-session' }),
    }));
  });

  it.each([
    { session_token: 'snake-session' },
    { token: 'legacy-session' },
  ])('accepts the supported wire shape %j', async (body) => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => body });
    const response = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(response.data?.token).toBe(Object.values(body)[0]);
    expect(api.hasSession()).toBe(true);
  });

  it.each([{}, { sessionToken: '' }, { sessionToken: ' ' }, { sessionToken: 12 }, { sessionToken: {} }])(
    'does not claim successful sign-in without a usable token: %j', async (body) => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => body });
      const response = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
      expect(response.error?.code).toBe('INVALID_AUTH_RESPONSE');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(api.hasSession()).toBe(false);
    }
  );

  it('reports secure-storage failure and leaves no memory-only session', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Keychain unavailable'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ sessionToken: 'signed-session' }) });
    const response = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(response.error?.code).toBe('SESSION_STORAGE_ERROR');
    expect(api.hasSession()).toBe(false);
  });
});
