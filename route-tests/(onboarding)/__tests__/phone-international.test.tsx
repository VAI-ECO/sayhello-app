/**
 * Onboarding phone — international acceptance (RULES §26.9 final ruling). The market picker is
 * display formatting only; a person whose dialling code is not listed types the full number
 * with its + and must get through. No market is ever inferred from SIM or locale.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { getPublicConfig } from '../../../src/api/account';
import { ThemeProvider } from '../../../src/theme';
import PhoneScreen from '../../../app/(onboarding)/phone';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { auth: { requestOTP: jest.fn() } } }));
jest.mock('../../../src/api/account', () => ({ getPublicConfig: jest.fn() }));
jest.mock('../../../src/lib/dialog', () => ({ showDialog: jest.fn() }));

const mockRouter = { push: jest.fn(), replace: jest.fn() };

describe('Onboarding phone — unlisted dialling codes parse generically and are accepted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (getPublicConfig as jest.Mock).mockResolvedValue({ data: { minimumAge: 18 } });
    (api.auth.requestOTP as jest.Mock).mockResolvedValue({
      data: { expiresIn: 600, resendAfter: 0, codeLength: 6 },
    });
  });

  it.each([
    ['+441234567890', 'United Kingdom +44'],
    ['+351912345678', 'Portugal +351'],
    ['+61412345678', 'Australia +61'],
  ])('typing the full number (%s, %s) with terms accepted sends the OTP and continues', async (fullNumber) => {
    await render(<ThemeProvider><PhoneScreen /></ThemeProvider>);
    await fireEvent.changeText(screen.getByPlaceholderText('(XXX) XXX-XXXX'), fullNumber);
    await fireEvent.press(screen.getByTestId('terms-accept'));
    await fireEvent.press(screen.getByText('Continue'));
    await waitFor(() => expect(api.auth.requestOTP).toHaveBeenCalledWith(fullNumber));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/(onboarding)/otp',
        params: expect.objectContaining({ phone: fullNumber }),
      }),
    );
  });

  it('a zero-leading prefix is not accepted: no OTP request, no navigation', async () => {
    await render(<ThemeProvider><PhoneScreen /></ThemeProvider>);
    await fireEvent.changeText(screen.getByPlaceholderText('(XXX) XXX-XXXX'), '+04412345678');
    await fireEvent.press(screen.getByTestId('terms-accept'));
    const button = screen.getByText('Continue').parent;
    expect(button?.props.accessibilityState.disabled).toBe(true);
    expect(api.auth.requestOTP).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
