/**
 * Locked-out recovery — the round trip. The clock-time locked screen is shared by sign-in and
 * sign-up; "Try again" must return to the screen the lockout came FROM:
 *   sign-up (origin 'onboarding') → back to the onboarding OTP screen, with the server's own
 *     timing figures passed straight through (code length / resend rules preserved);
 *   sign-in (no origin)           → back to the sign-in code screen, unchanged.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import SignInLockedScreen from '../../../app/(auth)/sign-in-locked';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const PHONE = '+15551234567';

const renderScreen = async (params: Record<string, string>) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);
  await render(<ThemeProvider><SignInLockedScreen /></ThemeProvider>);
};

describe('Sign in locked — origin-aware round trip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('a sign-up lockout returns to the ONBOARDING OTP screen with the phone and server timing preserved', async () => {
    await renderScreen({
      phone: PHONE,
      unlockTime: String(Date.now() - 1000), // already expired: Try again is live
      origin: 'onboarding',
      expiresIn: '600',
      resendAfter: '0',
      codeLength: '6',
    });
    await fireEvent.press(screen.getByTestId('try-again-button'));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(onboarding)/otp',
      params: { phone: PHONE, expiresIn: '600', resendAfter: '0', codeLength: '6' },
    });
    expect(mockRouter.replace).not.toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(auth)/sign-in-code' }),
    );
  });

  it('a sign-up lockout without timing params returns with just the phone', async () => {
    await renderScreen({ phone: PHONE, unlockTime: String(Date.now() - 1000), origin: 'onboarding' });
    await fireEvent.press(screen.getByTestId('try-again-button'));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(onboarding)/otp',
      params: { phone: PHONE },
    });
  });

  it('a sign-in lockout (no origin) still returns to the sign-in code screen', async () => {
    await renderScreen({ phone: PHONE, unlockTime: String(Date.now() - 1000) });
    await fireEvent.press(screen.getByTestId('try-again-button'));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(auth)/sign-in-code',
      params: { phone: PHONE },
    });
  });

  it('an unrelated origin value is treated like sign-in (never invents a sign-up route)', async () => {
    await renderScreen({ phone: PHONE, unlockTime: String(Date.now() - 1000), origin: 'something-else' });
    await fireEvent.press(screen.getByTestId('try-again-button'));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(auth)/sign-in-code',
      params: { phone: PHONE },
    });
  });

  it('while the lockout clock is still running, Try again stays disabled and goes nowhere', async () => {
    await renderScreen({
      phone: PHONE,
      unlockTime: String(Date.now() + 15 * 60_000),
      origin: 'onboarding',
    });
    expect(screen.getByTestId('try-again-button').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('try-again-button'));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
