/**
 * OTP boundary (api client): the creator code is spent at verify-otp, but the audience door it
 * opened (`to`) is navigation state and must survive that. Written only on success — an OTP error
 * or a token-storage failure keeps both the code and any continuation untouched for the retry.
 */

import { api } from '../client';
import { setPendingCreatorCode, peekPendingCreatorCode } from '../../state/pending-creator-code';
import { peekAudienceContinuation, restoreAudienceContinuation, clearAudienceContinuation } from '../../state/pending-audience-continuation';
import * as TokenStore from '../token-store';

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
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const audienceStore = () => store['sayhello.audience-continuation.v1'];

describe('Audience continuation at the OTP boundary', () => {
  beforeEach(async () => {
    await api.clearToken();
    for (const k of Object.keys(store)) delete store[k];
    setPendingCreatorCode(null);
    clearAudienceContinuation();
    (require('expo-secure-store').getItemAsync as jest.Mock).mockResolvedValue(null);
    (require('expo-secure-store').setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (require('expo-secure-store').deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ sessionToken: 'tok' }) });
  });

  it('preserves the door when the code is spent: business survives the clear', async () => {
    setPendingCreatorCode('JoesJobs', 'business');
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekPendingCreatorCode()).toBeNull();
    expect(store['sayhello.creator-code.v1']).toBeUndefined();
    expect(peekAudienceContinuation()).toBe('business');
    expect(await restoreAudienceContinuation()).toBe('business');
  });

  it('ambassador door survives too; member stores no continuation', async () => {
    setPendingCreatorCode('JoesJobs', 'ambassador');
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekAudienceContinuation()).toBe('ambassador');

    setPendingCreatorCode('JoesJobs', 'member');
    await api.auth.verifyOTP('+15551234567', '654321', 'en-US');
    expect(peekAudienceContinuation()).toBeNull();
    expect(audienceStore()).toBeUndefined();
  });

  it('an unsupported `to` falls back to member (no continuation, code still spent once)', async () => {
    setPendingCreatorCode('JoesJobs', 'not-a-door');
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekAudienceContinuation()).toBeNull();
    expect(audienceStore()).toBeUndefined();
    expect(peekPendingCreatorCode()).toBeNull();
  });

  it('a wrong OTP keeps the code and writes no continuation, so the retry preserves the attempt', async () => {
    setPendingCreatorCode('JoesJobs', 'business');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'otp_invalid' }) });
    const result = await api.auth.verifyOTP('+15551234567', '000000', 'en-US');
    expect(result.error).toBeDefined();
    expect(peekAudienceContinuation()).toBeNull();
    expect(audienceStore()).toBeUndefined();
    expect(store['sayhello.creator-code.v1']).toBeDefined();

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ sessionToken: 'tok' }) });
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekAudienceContinuation()).toBe('business');
  });

  it('a token-storage failure reports the error and preserves both code and continuation state', async () => {
    setPendingCreatorCode('JoesJobs', 'business');
    (require('expo-secure-store').setItemAsync as jest.Mock).mockRejectedValue(new Error('keychain locked'));
    const result = await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(result.error?.code).toBe('SESSION_STORAGE_ERROR');
    expect(peekAudienceContinuation()).toBeNull();
    expect(store['sayhello.creator-code.v1']).toBeDefined();

    (require('expo-secure-store').setItemAsync as jest.Mock).mockResolvedValue(undefined);
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekAudienceContinuation()).toBe('business');
    expect(peekPendingCreatorCode()).toBeNull();
  });

  it('sign-in without any pending code stores no continuation', async () => {
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(peekAudienceContinuation()).toBeNull();
    expect(audienceStore()).toBeUndefined();
  });

  it('TokenStore import stays intact (secure storage, never AsyncStorage)', () => {
    expect(typeof TokenStore.getToken).toBe('function');
  });
});
