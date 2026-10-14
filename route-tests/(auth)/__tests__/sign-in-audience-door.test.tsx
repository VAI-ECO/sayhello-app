/**
 * Sign-in success finishes a creator link's audience door (member/business/ambassador) for a
 * complete account — consumed once, after the shared age step, and never reattributing anything.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInCodeScreen from '../../../app/(auth)/sign-in-code';
import {
  clearAudienceContinuation,
  peekAudienceContinuation,
  rememberAudienceContinuation,
} from '../../../src/state/pending-audience-continuation';
import { rememberPendingClaim, takePendingClaim } from '../../../src/lib/pending-claim';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));
jest.mock('../../../src/api/client', () => ({
  api: {
    user: { getProfile: jest.fn() },
    auth: { requestOTP: jest.fn(), verifyOTP: jest.fn() },
  },
}));
jest.mock('../../../src/lib/phone', () => ({ ...jest.requireActual('../../../src/lib/phone'), deviceLocale: () => 'en-US' }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };
async function signIn() {
  await render(<ThemeProvider><SignInCodeScreen /></ThemeProvider>);
  await fireEvent.changeText(screen.getByTestId('code-input'), '123456');
  await fireEvent.press(screen.getByTestId('verify-button'));
}

describe('Sign In Code Screen — creator audience door', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAudienceContinuation();
    takePendingClaim();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '+15551234567', expiresIn: '600', resendAfter: '0' });
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 't' } });
  });

  it('opens the Hello Hangout signup door for a business-audience link on a complete account', async () => {
    rememberAudienceContinuation('business'); // what the OTP boundary writes for to=business
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(hangout)/signup'));
    expect(peekAudienceContinuation()).toBeNull(); // consumed: a later sign-in must not see it again
  });

  it('opens the Ambassador door for an ambassador-audience link', async () => {
    rememberAudienceContinuation('ambassador');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/ambassador'));
    expect(peekAudienceContinuation()).toBeNull();
  });

  it('member audience lands at Home exactly as before, no door consumed', async () => {
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
  });

  it('an account that still owes the birthday step goes there first and keeps the door for after onboarding', async () => {
    rememberAudienceContinuation('business');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: false } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)/name'));
    expect(peekAudienceContinuation()).toBe('business');
  });

  it('a failed profile reload defers to the saved-session entry with the door still pending', async () => {
    rememberAudienceContinuation('ambassador');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ error: { message: 'Network error', code: 'NETWORK_ERROR' } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/entry'));
    expect(peekAudienceContinuation()).toBe('ambassador');
  });

  it('a waiting claim link still wins over the audience door', async () => {
    rememberPendingClaim('claim-token-123456789');
    rememberAudienceContinuation('business');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/(hangout)/claim', params: { token: 'claim-token-123456789', resume: '1' } }));
    expect(peekAudienceContinuation()).toBe('business'); // not consumed by this path
  });
});
