/**
 * Sign-in phone — international acceptance (RULES §26.9 final ruling): a returning user whose
 * dialling code is not in the launch table types the full number with its + and must get
 * through to the code screen. Never a confirm/deny of account existence.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInPhoneScreen from '../../../app/(auth)/sign-in-phone';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { auth: { requestOTP: jest.fn() } } }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };

describe('Sign in phone — unlisted dialling codes parse generically and are accepted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.auth.requestOTP as jest.Mock).mockResolvedValue({
      data: { expiresIn: 600, resendAfter: 0, codeLength: 6 },
    });
  });

  it.each([
    ['+441234567890', 'United Kingdom +44'],
    ['+351912345678', 'Portugal +351'],
    ['+61412345678', 'Australia +61'],
  ])('typing the full number (%s, %s) sends the OTP and proceeds like any other', async (fullNumber) => {
    await render(<ThemeProvider><SignInPhoneScreen /></ThemeProvider>);
    await fireEvent.changeText(screen.getByTestId('phone-input'), fullNumber);
    await fireEvent.press(screen.getByTestId('send-code-button'));
    await waitFor(() => expect(api.auth.requestOTP).toHaveBeenCalledWith(fullNumber));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/(auth)/sign-in-code',
        params: expect.objectContaining({ phone: fullNumber }),
      }),
    );
  });

  it('a zero-leading prefix keeps the button disabled: no OTP request, no navigation', async () => {
    await render(<ThemeProvider><SignInPhoneScreen /></ThemeProvider>);
    await fireEvent.changeText(screen.getByTestId('phone-input'), '+04412345678');
    expect(screen.getByTestId('send-code-button').props.accessibilityState.disabled).toBe(true);
    expect(api.auth.requestOTP).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
