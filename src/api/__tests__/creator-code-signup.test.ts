import { api } from '../client';
import { setPendingCreatorCode, peekPendingCreatorCode } from '../../state/pending-creator-code';

const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    removeItem: jest.fn(async (k: string) => { delete store[k]; }),
  },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const bodyOf = () => JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string);

describe('Creator code at sign-up', () => {
  beforeEach(async () => {
    await api.clearToken();
    for (const k of Object.keys(store)) delete store[k];
    setPendingCreatorCode(null);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ sessionToken: 'tok' }) });
  });

  it('sends nothing extra when no code is pending', async () => {
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(bodyOf()).toEqual({ phone_number: '+15551234567', code: '123456', locale: 'en-US' });
  });

  it('sends the pending code once with verify-otp, then forgets it', async () => {
    setPendingCreatorCode('JoesJobs', 'member');
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(bodyOf().creator_code).toBe('JoesJobs');
    expect(peekPendingCreatorCode()).toBeNull();
    expect(store['sayhello.creator-code.v1']).toBeUndefined();
  });

  it('survives an app restart (memory empty, storage kept) and is cleared only on success', async () => {
    // cold start: memory empty, the saved copy is what the earlier link tap left
    store['sayhello.creator-code.v1'] = JSON.stringify({ code: 'JoesJobs', to: 'member', at: Date.now() });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'otp_invalid' }) });
    await api.auth.verifyOTP('+15551234567', '000000', 'en-US');
    expect(bodyOf().creator_code).toBe('JoesJobs');
    expect(store['sayhello.creator-code.v1']).toBeDefined(); // wrong OTP keeps it
  });

  it('drops a saved code older than 14 days', async () => {
    store['sayhello.creator-code.v1'] = JSON.stringify({ code: 'OldCode', to: 'member', at: Date.now() - 15 * 86_400_000 });
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(bodyOf().creator_code).toBeUndefined();
  });
});
