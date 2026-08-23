/**
 * SIGN IN FLOW TESTS
 *
 * Tests the three-screen sign-in flow with rate limiting and security requirements.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInPhoneScreen from '../sign-in-phone';
import SignInCodeScreen from '../sign-in-code';
import SignInLockedScreen from '../sign-in-locked';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({
  api: {
    init: jest.fn(),
    auth: {
      requestOTP: jest.fn(),
      verifyOTP: jest.fn(),
    },
  },
}));

jest.mock('../../../src/lib/phone', () => {
  const actual = jest.requireActual('../../../src/lib/phone');
  return {
    ...actual,
    deviceLocale: () => 'en-US',
  };
});

describe('Sign In Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Helper to render with ThemeProvider
  const renderWithTheme = async (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  describe('Sign In Phone Screen', () => {
    it('renders welcome back title and subtitle', async () => {
      await renderWithTheme(<SignInPhoneScreen />);

      expect(screen.getByText('Welcome back.')).toBeOnTheScreen();
      expect(
        screen.getByText("Your number is your account. We'll text you six digits.")
      ).toBeOnTheScreen();
    });

    it('shows disclaimer about changed numbers', async () => {
      await renderWithTheme(<SignInPhoneScreen />);

      expect(
        screen.getByText(
          /Changed your number\? Sign in on the old one first if you still have it, or get in touch/
        )
      ).toBeOnTheScreen();
    });

    it('validates phone number before sending', async () => {
      await renderWithTheme(<SignInPhoneScreen />);

      const input = screen.getByTestId('phone-input');
      const button = screen.getByTestId('send-code-button');

      await fireEvent.changeText(input, '555');

      // Button should be disabled with invalid phone number
      expect(button).toBeDisabled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('sends OTP and navigates to code screen', async () => {
      (api.auth.requestOTP as jest.Mock).mockResolvedValue({ data: {} });

      await renderWithTheme(<SignInPhoneScreen />);

      const input = screen.getByTestId('phone-input');
      const button = screen.getByTestId('send-code-button');

      await fireEvent.changeText(input, '5551234567');
      await fireEvent.press(button);

      await waitFor(() => {
        expect(api.auth.requestOTP).toHaveBeenCalledWith('+15551234567', '1990-01-01');
      });

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/(auth)/sign-in-code',
        params: { phone: '+15551234567' },
      });
    });

    it('navigates to onboarding when "new here" is tapped', async () => {
      await renderWithTheme(<SignInPhoneScreen />);

      const newUserLink = screen.getByTestId('new-user-link');
      await fireEvent.press(newUserLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/(onboarding)/value-cards');
    });
  });

  describe('Sign In Code Screen — Security Copy', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '5551234567' });
    });

    it('never confirms or denies account existence', async () => {
      await renderWithTheme(<SignInCodeScreen />);

      // ⚠️ REQUIRED WORDING — must not vary based on account existence
      const accountNotice = screen.getByTestId('account-notice');
      expect(accountNotice).toHaveTextContent(
        "If there's an account on 5551234567, a code is on its way."
      );
    });

    it('shows code expiry note', async () => {
      await renderWithTheme(<SignInCodeScreen />);

      expect(
        screen.getByText('The code lasts ten minutes. After that, ask for a new one.')
      ).toBeOnTheScreen();
    });
  });

  describe('Sign In Code Screen — Rate Limiting', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '5551234567' });
    });

    it('locks out after 5 wrong codes', async () => {
      let attemptCount = 0;
      (api.auth.verifyOTP as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount >= 5) {
          // 5th attempt triggers lockout from server
          const lockedUntil = Date.now() + 15 * 60 * 1000;
          return Promise.resolve({
            error: {
              message: 'Too many failed attempts. Please try again later.',
              code: 'rate_limit_exceeded',
              status: 429,
              lockedUntil,
            },
          });
        }
        // First 4 attempts return invalid code
        return Promise.resolve({
          error: {
            message: 'Invalid code',
            code: 'otp_invalid',
            status: 400,
            attemptsRemaining: 5 - attemptCount,
          },
        });
      });

      await renderWithTheme(<SignInCodeScreen />);

      const input = screen.getByTestId('code-input');
      const button = screen.getByTestId('verify-button');

      // Attempt 5 wrong codes
      for (let i = 0; i < 5; i++) {
        await fireEvent.changeText(input, '000000');
        await fireEvent.press(button);

        await waitFor(() => {
          expect(api.auth.verifyOTP).toHaveBeenCalledTimes(i + 1);
        });
      }

      // Should navigate to locked screen on 5th attempt
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: '/(auth)/sign-in-locked',
            params: expect.objectContaining({
              phone: '5551234567',
              unlockTime: expect.any(String),
            }),
          })
        );
      });
    });

    it('resets attempt counter on successful resend', async () => {
      let attemptCount = 0;
      (api.auth.verifyOTP as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount >= 5) {
          // 5th attempt triggers lockout from server
          const lockedUntil = Date.now() + 15 * 60 * 1000;
          return Promise.resolve({
            error: {
              message: 'Too many failed attempts. Please try again later.',
              code: 'rate_limit_exceeded',
              status: 429,
              lockedUntil,
            },
          });
        }
        // First 4 attempts return invalid code
        return Promise.resolve({
          error: {
            message: 'Invalid code',
            code: 'otp_invalid',
            status: 400,
            attemptsRemaining: 5 - attemptCount,
          },
        });
      });

      (api.auth.requestOTP as jest.Mock).mockImplementation(() => {
        // Server resets attempt counter on successful OTP resend
        attemptCount = 0;
        return Promise.resolve({ data: {} });
      });

      await renderWithTheme(<SignInCodeScreen />);

      const input = screen.getByTestId('code-input');
      const verifyButton = screen.getByTestId('verify-button');

      // Make 2 failed attempts
      for (let i = 0; i < 2; i++) {
        await fireEvent.changeText(input, '000000');
        await fireEvent.press(verifyButton);
        await waitFor(() => expect(api.auth.verifyOTP).toHaveBeenCalledTimes(i + 1));
      }

      // Wait for resend cooldown - advance in smaller increments to let React flush
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }

      // Resend code
      const resendButton = screen.getByTestId('resend-button');
      await fireEvent.press(resendButton);

      await waitFor(() => {
        expect(api.auth.requestOTP).toHaveBeenCalled();
      });

      // Attempts should be reset — can make 5 more before lockout
      for (let i = 0; i < 5; i++) {
        await fireEvent.changeText(input, '111111');
        await fireEvent.press(verifyButton);
      }

      // Should lock out after these 5 new attempts
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled();
      });
    });
  });

  describe('Sign In Code Screen — Resend Cooldown', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '5551234567' });
    });

    it('starts with 60 second cooldown', async () => {
      await renderWithTheme(<SignInCodeScreen />);

      const resendButton = screen.getByTestId('resend-button');
      expect(resendButton).toBeDisabled();
      expect(resendButton).toHaveTextContent("Didn't arrive? Send another in 1:00");
    });

    it('counts down and enables resend after 60 seconds', async () => {
      await renderWithTheme(<SignInCodeScreen />);

      const resendButton = screen.getByTestId('resend-button');

      // Initially disabled
      expect(resendButton).toBeDisabled();

      // Advance 30 seconds - need to advance in 1-second increments for React to flush
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }

      await waitFor(() => {
        expect(resendButton).toHaveTextContent("Didn't arrive? Send another in 0:30");
      });

      // Advance to end of cooldown
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }

      await waitFor(() => {
        expect(resendButton).toBeEnabled();
        expect(resendButton).toHaveTextContent("Didn't arrive? Send another");
      });
    });
  });

  describe('Sign In Locked Screen', () => {
    beforeEach(() => {
      // Set unlock time to 15 minutes from now
      const unlockTime = Date.now() + 15 * 60 * 1000;
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        phone: '5551234567',
        unlockTime: unlockTime.toString(),
      });
    });

    it('displays lockout message', async () => {
      await renderWithTheme(<SignInLockedScreen />);

      expect(screen.getByText("Let's slow down a second.")).toBeOnTheScreen();
      expect(
        screen.getByText("That's five wrong codes. We'll open it back up in fifteen minutes.")
      ).toBeOnTheScreen();
    });

    it('shows clock time for unlock, not countdown', async () => {
      // Set current time to 9:00am
      const currentTime = new Date('2024-01-01T09:00:00').getTime();
      jest.setSystemTime(currentTime);

      // Set unlock time to 9:56am (56 minutes in the future)
      const unlockDate = new Date('2024-01-01T09:56:00');
      const unlockTime = unlockDate.getTime();

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        phone: '5551234567',
        unlockTime: unlockTime.toString(),
      });

      await renderWithTheme(<SignInLockedScreen />);

      const unlockTimeDisplay = screen.getByTestId('unlock-time');
      expect(unlockTimeDisplay).toHaveTextContent('Try again at 9:56');
    });

    it('shows reassurance message', async () => {
      await renderWithTheme(<SignInLockedScreen />);

      expect(screen.getByTestId('reassurance')).toHaveTextContent(
        "Nothing's wrong with your account"
      );
    });

    it('disables try again button while locked', async () => {
      await renderWithTheme(<SignInLockedScreen />);

      const button = screen.getByTestId('try-again-button');
      expect(button).toBeDisabled();
    });

    it('enables try again button after lockout expires', async () => {
      // Set unlock time to 1 second from now
      const unlockTime = Date.now() + 1000;
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        phone: '5551234567',
        unlockTime: unlockTime.toString(),
      });

      await renderWithTheme(<SignInLockedScreen />);

      const button = screen.getByTestId('try-again-button');

      // Initially disabled
      expect(button).toBeDisabled();

      // Advance past unlock time
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(button).toBeEnabled();
      });
    });

    it('navigates back to code screen when unlocked and button pressed', async () => {
      // Set unlock time in the past
      const unlockTime = Date.now() - 1000;
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        phone: '5551234567',
        unlockTime: unlockTime.toString(),
      });

      await renderWithTheme(<SignInLockedScreen />);

      const button = screen.getByTestId('try-again-button');

      await waitFor(() => {
        expect(button).toBeEnabled();
      });

      await fireEvent.press(button);

      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: '/(auth)/sign-in-code',
        params: { phone: '5551234567' },
      });
    });
  });

  describe('Sign In Code Screen — Success Path', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '5551234567' });
    });

    it('navigates to main app on successful verification', async () => {
      (api.auth.verifyOTP as jest.Mock).mockResolvedValue({
        data: { token: 'valid_token' },
      });

      await renderWithTheme(<SignInCodeScreen />);

      const input = screen.getByTestId('code-input');
      const button = screen.getByTestId('verify-button');

      await fireEvent.changeText(input, '123456');
      await fireEvent.press(button);

      await waitFor(() => {
        expect(api.auth.verifyOTP).toHaveBeenCalledWith('5551234567', '123456', 'en-US');
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
