/**
 * PRIVATE CHAT — bottom safe area. The message composer (input + Send) and the action sheet are pinned to the bottom of a
 * screen with no SafeAreaView bottom edge, and the Android build draws edge-to-edge (edgeToEdgeEnabled=true), so a fixed
 * 30pt padding could put Send under a 48dp navigation bar. The padding is the design value as a floor, grown to the real
 * inset. (Mock setup mirrors chat.test.tsx; that file is not edited.)
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ChatScreen from '../../../app/(encounter)/chat';
import { ThemeProvider } from '../../../src/theme';
import * as hellosApi from '../../../src/api/hellos';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const R = require('react');
    R.useEffect(cb, [cb]);
  },
}));
jest.mock('../../../src/api/hellos', () => ({
  ...jest.requireActual('../../../src/api/hellos'),
  getHelloChat: jest.fn(),
}));
jest.mock('../../../src/api/client', () => ({ api: {}, addSessionChangeListener: () => () => undefined }));

const api = hellosApi as jest.Mocked<typeof hellosApi>;
const chat = {
  helloId: 'h1',
  canSend: true,
  person: { userId: 'u2', displayName: 'Mara', identityColor: '#8E24AA', profilePhotoUrl: null },
  messages: [{ id: 'm1', body: 'Round two soon?', mine: false, createdAt: '2026-09-25T10:00:00.000Z' }],
};
const inside = (bottom: number) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom } }}>
    <ThemeProvider><ChatScreen /></ThemeProvider>
  </SafeAreaProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({ helloId: 'h1' });
  api.getHelloChat.mockResolvedValue({ data: { chat } } as never);
});

describe('Private chat composer', () => {
  it('clears a 48dp Android navigation bar and keeps Send reachable', async () => {
    await render(inside(48));
    expect(await screen.findByTestId('chat-composer')).toHaveStyle({ paddingBottom: 48 });
    expect(screen.getByRole('button', { name: 'Send' })).toBeOnTheScreen();
  });
  it('keeps the designed 30pt where there is no inset', async () => {
    await render(inside(0));
    expect(await screen.findByTestId('chat-composer')).toHaveStyle({ paddingBottom: 30 });
  });
});
