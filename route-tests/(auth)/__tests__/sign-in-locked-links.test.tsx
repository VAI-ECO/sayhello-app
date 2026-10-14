/**
 * Sign in — locked out: "Why this happens" shows the text drawn on CANON-RL-01-SN-55, and "Get help instead" opens
 * the contact RULES §36.4 publishes (info@sayhello.world) and writes it out in case no mail app is set up.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SignInLockedScreen from '../../../app/(auth)/sign-in-locked';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));

const renderScreen = async () => render(<ThemeProvider><SignInLockedScreen /></ThemeProvider>);

describe('Sign in locked — links', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ phone: '+15551234567', unlockTime: String(Date.now() + 15 * 60_000) });
  });

  it('"Why this happens" reveals the drawn explanation', async () => {
    await renderScreen();
    expect(screen.queryByTestId('why-note')).toBeNull();
    await fireEvent.press(screen.getByTestId('why-link'));
    expect(screen.getByTestId('why-note').props.children).toBe(
      "Somebody guessing at codes would get in eventually if we let them keep going. The wait is short and it isn't a punishment.",
    );
  });

  it('"Get help instead" opens the published contact and writes the address out', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    await renderScreen();
    await fireEvent.press(screen.getByTestId('help-link'));
    expect(open).toHaveBeenCalledWith('mailto:info@sayhello.world');
    expect(screen.getByTestId('help-note').props.children).toContain('info@sayhello.world');
  });

  it('still shows the address when no mail app can open it', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
    await renderScreen();
    await fireEvent.press(screen.getByTestId('help-link'));
    expect(screen.getByTestId('help-note').props.children).toContain('info@sayhello.world');
  });
});
