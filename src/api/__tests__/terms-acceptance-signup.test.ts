import { api } from '../client';
import { clearTermsAccepted, hasAcceptedTerms, markTermsAccepted } from '../../state/pending-terms-acceptance';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const bodyOf = () => JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string);

describe('Terms acceptance at sign-up (RULES 36.2, migration 303)', () => {
  beforeEach(async () => {
    await api.clearToken();
    clearTermsAccepted();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ sessionToken: 'tok' }) });
  });

  it('sends nothing extra when nothing was accepted on the phone screen', async () => {
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(bodyOf()).toEqual({ phone_number: '+15551234567', code: '123456', locale: 'en-US' });
  });

  it('sends the acceptance once with verify-otp, then forgets it', async () => {
    markTermsAccepted();
    await api.auth.verifyOTP('+15551234567', '123456', 'en-US');
    expect(bodyOf().terms_accepted).toBe(true);
    expect(hasAcceptedTerms()).toBe(false);
  });

  it('keeps it through a wrong code, so the retry still carries it', async () => {
    markTermsAccepted();
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'otp_invalid' }) });
    await api.auth.verifyOTP('+15551234567', '000000', 'en-US');
    expect(bodyOf().terms_accepted).toBe(true);
    expect(hasAcceptedTerms()).toBe(true);
  });
});
