/**
 * Onboarding OTP — server lockout recovery. A sign-up user who hits the server's lockout
 * (429 + lockedUntil on verify) goes to the SAME clock-time locked screen as sign-in, with
 * the flow origin and the server's own timing figures, so "Try again" returns to THIS screen.
 * Wrong code, a cooldown-only 429 and a network failure stay on-screen as before.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { showDialog } from '../../../src/lib/dialog';
import { ThemeProvider } from '../../../src/theme';
import OTPScreen from '../../../app/(onboarding)/otp';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));
jest.mock('../../../src/api/client', () => ({
  api: { auth: { requestOTP: jest.fn(), verifyOTP: jest.fn() } },
}));
jest.mock('../../../src/lib/dialog', () => ({ showDialog: jest.fn() }));
jest.mock('../../../src/lib/phone', () => ({ ...jest.requireActual('../../../src/lib/phone'), deviceLocale: () => 'en-US' }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const PHONE = '+15551234567';

async function enterCodeAndVerify(code = '123456') {
  await fireEvent.changeText(screen.getByPlaceholderText('000000'), code);
  await fireEvent.press(screen.getByText('Verify'));
}

describe('Onboarding OTP — lockout recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      phone: PHONE, expiresIn: '600', resendAfter: '0', codeLength: '6',
    });
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 't' } });
  });

  it('a server lockout (429 + lockedUntil) routes to the clock-time locked screen with origin and server timing', async () => {
    const lockedUntil = Date.now() + 15 * 60_000;
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
      error: { code: 'rate_limit_exceeded', status: 429, message: 'Too many failed attempts. Please try again later.', lockedUntil },
    });
    await render(<ThemeProvider><OTPScreen /></ThemeProvider>);
    await enterCodeAndVerify();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledTimes(1));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(auth)/sign-in-locked',
      params: {
        phone: PHONE,
        unlockTime: String(lockedUntil),
        origin: 'onboarding',
        expiresIn: '600',
        resendAfter: '0',
        codeLength: '6',
      },
    });
    expect(showDialog).not.toHaveBeenCalled();
  });

  it('a wrong code stays on this screen with the error shown', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
      error: { code: 'otp_invalid', status: 400, message: 'Invalid OTP code' },
    });
    await render(<ThemeProvider><OTPScreen /></ThemeProvider>);
    await enterCodeAndVerify();
    await screen.findByText('Invalid code. Try again.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('a cooldown-only 429 (no lockedUntil) is not a lockout: stays on this screen with the server message', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
      error: { code: 'rate_limit_exceeded', status: 429, message: 'Too many attempts. Please try again later.', body: { retryAfterSeconds: 120 } },
    });
    await render(<ThemeProvider><OTPScreen /></ThemeProvider>);
    await enterCodeAndVerify();
    await waitFor(() => expect(showDialog).toHaveBeenCalledWith('Invalid code. Try again.', 'Too many attempts. Please try again later.'));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('a network failure stays on this screen too', async () => {
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
      error: { code: 'NETWORK_ERROR', message: 'Network error' },
    });
    await render(<ThemeProvider><OTPScreen /></ThemeProvider>);
    await enterCodeAndVerify();
    await waitFor(() => expect(showDialog).toHaveBeenCalled());
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
