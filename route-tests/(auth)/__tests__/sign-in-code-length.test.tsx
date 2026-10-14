/**
 * Sign-in code screen follows the server's code length (admin setting otp_length, MONEY Part 6: 6 digits).
 * The length arrives as the `codeLength` route param from request-otp; without it the ruled default of 6 applies.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import SignInCodeScreen from '../../../app/(auth)/sign-in-code';

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
const params = (extra: Record<string, string> = {}) =>
  (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '+15551234567', expiresIn: '600', resendAfter: '0', ...extra });

describe('Sign In Code Screen — code length', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 't' } });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
  });

  it('uses the ruled default of 6 digits when the server did not say', async () => {
    params();
    await renderScreen();
    const input = screen.getByTestId('code-input');
    expect(input.props.maxLength).toBe(6);
    expect(input.props.placeholder).toBe('000000');
    await fireEvent.changeText(input, '123456');
    await fireEvent.press(screen.getByTestId('verify-button'));
    await waitFor(() => expect(api.auth.verifyOTP).toHaveBeenCalledWith('+15551234567', '123456', 'en-US'));
  });

  it('asks for as many digits as the server says, and does not submit a shorter code', async () => {
    params({ codeLength: '8' });
    await renderScreen();
    const input = screen.getByTestId('code-input');
    expect(input.props.maxLength).toBe(8);
    expect(input.props.placeholder).toBe('00000000');
    await fireEvent.changeText(input, '123456');
    await fireEvent.press(screen.getByTestId('verify-button'));
    expect(api.auth.verifyOTP).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByTestId('code-input'), '12345678');
    await fireEvent.press(screen.getByTestId('verify-button'));
    await waitFor(() => expect(api.auth.verifyOTP).toHaveBeenCalledWith('+15551234567', '12345678', 'en-US'));
  });
});
