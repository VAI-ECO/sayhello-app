/**
 * Strikes on your account: the person's own count (RULES §35.16) and where the newest one was issued. A strike for a
 * Hootza group-chat message is a Hootza room, not a private chat.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StrikesScreen from '../../../../app/(tabs)/profile/strikes';
import { ThemeProvider } from '../../../../src/theme';
import { getMyStrikes } from '../../../../src/api/account';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
jest.mock('../../../../src/api/account', () => ({ ...jest.requireActual('../../../../src/api/account'), getMyStrikes: jest.fn() }));

const renderScreen = async () => render(<ThemeProvider><StrikesScreen /></ThemeProvider>);
const reply = (active: number, surface?: 'chat' | 'hootza_comment' | 'hootza_chat') => ({
  data: { active, threshold: 5, expiryMonths: 12, latest: surface ? { surface, issuedAt: '2026-08-14T10:00:00Z' } : null },
});

describe('Strikes screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the count from the server and the none line at zero', async () => {
    (getMyStrikes as jest.Mock).mockResolvedValue(reply(0));
    await renderScreen();
    expect((await screen.findByTestId('strikes-count')).props.children).toBe(0);
  });

  it('describes a private-chat strike as a private chat', async () => {
    (getMyStrikes as jest.Mock).mockResolvedValue(reply(1, 'chat'));
    await renderScreen();
    expect(await screen.findByText(/a message in a private chat/)).toBeTruthy();
  });

  it.each(['hootza_comment', 'hootza_chat'] as const)('describes a %s strike as a Hootza room', async surface => {
    (getMyStrikes as jest.Mock).mockResolvedValue(reply(2, surface));
    await renderScreen();
    expect(await screen.findByText(/a message in a Hootza room/)).toBeTruthy();
    expect(screen.queryByText(/a message in a private chat/)).toBeNull();
  });
});
