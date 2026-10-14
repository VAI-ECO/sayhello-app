/**
 * Sign-in code screen: where a signed-in person lands (the birthday step if age was never verified), and the
 * difference between a wrong code and a failure that is not the person's mistake.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInCodeScreen from '../../../app/(auth)/sign-in-code';
import { destinationAfterSignIn } from '../../../src/lib/session-entry';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));
jest.mock('../../../src/api/client', () => ({
  api: {
    user: { getProfile: jest.fn() },
    auth: { requestOTP: jest.fn(), verifyOTP: jest.fn() },
  },
}));
jest.mock('../../../src/lib/phone', () => ({ ...jest.requireActual('../../../src/lib/phone'), deviceLocale: () => 'en-US' }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const renderScreen = async () => render(<ThemeProvider><SignInCodeScreen /></ThemeProvider>);
async function enterCodeAndVerify() {
  await fireEvent.changeText(screen.getByTestId('code-input'), '123456');
  await fireEvent.press(screen.getByTestId('verify-button'));
}

describe('destinationAfterSignIn', () => {
  it('sends someone whose age was never verified back to the birthday step', () => {
    expect(destinationAfterSignIn({ id: 'u', ageVerified: false })).toBe('/(onboarding)/name');
  });
  it('lets a verified account into the app', () => {
    expect(destinationAfterSignIn({ id: 'u', ageVerified: true })).toBe('/(tabs)/home');
  });
  it('never gates on a field the server did not send, or on junk', () => {
    expect(destinationAfterSignIn({ id: 'u' })).toBe('/(tabs)/home');
    expect(destinationAfterSignIn({ ageVerified: 'false' })).toBe('/(tabs)/home');
    expect(destinationAfterSignIn(null)).toBe('/(tabs)/home');
    expect(destinationAfterSignIn(undefined)).toBe('/(tabs)/home');
  });
});

describe('Sign In Code Screen — states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '+15551234567', expiresIn: '600', resendAfter: '0' });
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 't' } });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
  });

  it('resumes at the birthday step when the account never finished it', async () => {
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: false } });
    await renderScreen();
    await enterCodeAndVerify();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)/name'));
    expect(mockRouter.replace).not.toHaveBeenCalledWith('/(tabs)/home');
  });

  it('a wrong code says so and clears the field', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ error: { code: 'otp_invalid', status: 400, message: 'Invalid OTP code' } });
    await renderScreen();
    await enterCodeAndVerify();
    expect(await screen.findByTestId('error-message')).toBeTruthy();
    expect(screen.getByTestId('code-input').props.value).toBe('');
    expect(screen.queryByTestId('verify-notice')).toBeNull();
  });

  it('a dropped connection is not "wrong code", and the typed code is kept', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ error: { code: 'NETWORK_ERROR', message: 'Network error' } });
    await renderScreen();
    await enterCodeAndVerify();
    expect(await screen.findByTestId('verify-notice')).toBeTruthy();
    expect(screen.queryByTestId('error-message')).toBeNull();
    expect(screen.getByTestId('code-input').props.value).toBe('123456');
  });

  it('a rate-limit window (429 without a lockout time) says to wait, with the wait when the server gave one', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
      error: { code: 'rate_limit_exceeded', status: 429, message: 'Too many attempts.', body: { retryAfterSeconds: 120 } },
    });
    await renderScreen();
    await enterCodeAndVerify();
    const notice = await screen.findByTestId('verify-notice');
    expect(notice.props.children).toContain('2 min');
    expect(screen.queryByTestId('error-message')).toBeNull();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
