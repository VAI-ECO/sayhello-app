/**
 * Sign-in success finishes a Hello Hangout claim link that was opened while signed out (lane02 pending-claim),
 * but only once the account is complete.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInCodeScreen from '../../../app/(auth)/sign-in-code';
import { hasPendingClaim, rememberPendingClaim, takePendingClaim } from '../../../src/lib/pending-claim';

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

describe('Sign In Code Screen — claim link resume', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    takePendingClaim();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '+15551234567', expiresIn: '600', resendAfter: '0' });
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 't' } });
  });

  it('opens the claim screen with the remembered token once the account is complete', async () => {
    rememberPendingClaim('claim-token-123456789');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/(hangout)/claim', params: { token: 'claim-token-123456789', resume: '1' } }));
    expect(hasPendingClaim()).toBe(false);
  });

  it('goes to Home as before when no claim is waiting', async () => {
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
  });

  it('sends an account that still owes the birthday step there first and keeps the claim token for later', async () => {
    rememberPendingClaim('claim-token-123456789');
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: false } });
    await signIn();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)/name'));
    expect(hasPendingClaim()).toBe(true);
  });
});
