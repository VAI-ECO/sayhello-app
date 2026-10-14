/**
 * Sign in — phone: "get in touch" is a real link (drawn underlined on CANON-RL-01-SN-53) to the contact RULES §36.4
 * publishes, and the sentence around it is unchanged.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import SignInPhoneScreen from '../../../app/(auth)/sign-in-phone';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { auth: { requestOTP: jest.fn() } } }));

describe('Sign in phone — get in touch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it('keeps the drawn sentence whole', async () => {
    await render(<ThemeProvider><SignInPhoneScreen /></ThemeProvider>);
    expect(screen.getByText('Changed your number? Sign in on the old one first if you still have it, or get in touch — a person will help.')).toBeOnTheScreen();
  });

  it('opens the published contact when "get in touch" is pressed', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    await render(<ThemeProvider><SignInPhoneScreen /></ThemeProvider>);
    await fireEvent.press(screen.getByTestId('get-in-touch-link'));
    expect(open).toHaveBeenCalledWith('mailto:info@sayhello.world');
  });
});
