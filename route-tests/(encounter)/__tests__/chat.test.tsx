/**
 * VERTICAL-BUILD-05 — private chat (§10.16) and Connections · points earned (SN-51).
 * Every value comes from a mocked server response; the server enforces membership
 * (sayhello-api 056, rolled-back SQL test). These check what the screens do with it.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ChatScreen from '../../../app/(encounter)/chat';
import ConnectionsPointsScreen from '../../../app/(tabs)/hellos/points';
import { ThemeProvider } from '../../../src/theme';
import * as hellosApi from '../../../src/api/hellos';
import * as pointsApi from '../../../src/api/points';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));

jest.mock('../../../src/api/hellos', () => ({
  ...jest.requireActual('../../../src/api/hellos'),
  getHelloChat: jest.fn(),
  sendChatMessage: jest.fn(),
  hideChatMessage: jest.fn(),
  leaveChat: jest.fn(),
  reportChatMessage: jest.fn(),
}));

jest.mock('../../../src/api/points', () => ({
  getConnectionsPoints: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({ api: {}, addSessionChangeListener: () => () => undefined }));

const api = hellosApi as jest.Mocked<typeof hellosApi>;
const points = pointsApi as jest.Mocked<typeof pointsApi>;

const chat = (overrides: Record<string, unknown> = {}) => ({
  helloId: 'h1',
  canSend: true,
  person: { userId: 'u2', displayName: 'Mara', identityColor: '#8E24AA', profilePhotoUrl: null },
  messages: [
    { id: 'm1', body: 'Round two soon?', mine: false, createdAt: '2026-09-25T10:00:00.000Z' },
    { id: 'm2', body: 'On my way over', mine: true, createdAt: '2026-09-25T10:01:00.000Z' },
  ],
  ...overrides,
});

let mockPush: jest.Mock;
let mockBack: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockPush = jest.fn();
  mockBack = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack, replace: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({ helloId: 'h1' });
  api.getHelloChat.mockResolvedValue({ data: { chat: chat() } } as never);
});

const renderChat = () => render(<ThemeProvider><ChatScreen /></ThemeProvider>);

describe('Private chat', () => {
  it('shows the other person’s name and both sides of the conversation', async () => {
    await renderChat();
    expect(await screen.findByText('Mara')).toBeOnTheScreen();
    expect(screen.getByText('Round two soon?')).toBeOnTheScreen();
    expect(screen.getByText('On my way over')).toBeOnTheScreen();
    expect(api.getHelloChat).toHaveBeenCalledWith('h1');
  });

  it('sends a message, clears the field and shows it', async () => {
    const m3 = { id: 'm3', body: 'See you', mine: true, createdAt: 'x' };
    api.sendChatMessage.mockResolvedValue({ data: { message: m3 } } as never);
    await renderChat();
    const input = await screen.findByLabelText('Message Mara');
    // The screen re-reads the server after sending; the server now has it too.
    api.getHelloChat.mockResolvedValue({ data: { chat: chat({ messages: [...chat().messages, m3] }) } } as never);
    await fireEvent.changeText(input, '  See you  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(api.sendChatMessage).toHaveBeenCalledWith('h1', 'See you');
    expect(screen.getByText('See you')).toBeOnTheScreen();
    expect(screen.getByLabelText('Message Mara')).toHaveDisplayValue('');
  });

  it('keeps the draft and says so when a send fails', async () => {
    api.sendChatMessage.mockResolvedValue({ error: { message: 'offline', status: 0 } } as never);
    await renderChat();
    await fireEvent.changeText(await screen.findByLabelText('Message Mara'), 'hello?');
    await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText("That didn't send. Try again.")).toBeOnTheScreen();
    expect(screen.getByLabelText('Message Mara')).toHaveDisplayValue('hello?');
  });

  it('opens the delivered three-action sheet on the other person’s message, never on your own', async () => {
    await renderChat();
    await fireEvent(await screen.findByTestId('chat-message-m2'), 'longPress');
    expect(screen.queryByTestId('chat-sheet')).not.toBeOnTheScreen();
    await fireEvent(screen.getByTestId('chat-message-m1'), 'longPress');
    expect(screen.getByText('This message')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Report it' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Hide it for me' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Block this person' })).toBeOnTheScreen();
    expect(screen.getByText('Blocking is silent. They are not told, and nothing on their side changes.')).toBeOnTheScreen();
  });

  it('reports one message with a §35.19 reason and optional context, then shows a receipt without an outcome', async () => {
    api.reportChatMessage.mockResolvedValue({ data: { report: { id: 'r1' } } } as never);
    await renderChat();
    await fireEvent(await screen.findByTestId('chat-message-m1'), 'longPress');
    await fireEvent.press(screen.getByRole('button', { name: 'Report it' }));
    expect(screen.getByText('"Round two soon?"')).toBeOnTheScreen();
    const send = screen.getByRole('button', { name: 'Send it' });
    expect(send).toBeDisabled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Harassment or abuse' }));
    await fireEvent.changeText(screen.getByLabelText('Anything we should know'), ' kept going ');
    await fireEvent.press(screen.getByRole('button', { name: 'Send it' }));
    expect(api.reportChatMessage).toHaveBeenCalledWith({ helloId: 'h1', messageId: 'm1', reason: 'harassment', details: 'kept going' });
    expect(screen.getByText("Sent. We'll look at it.")).toBeOnTheScreen();
    expect(screen.getByText("You won't hear the outcome. That's their business, not yours.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Back to the chat' }));
    expect(screen.getByText('Round two soon?')).toBeOnTheScreen();
  });

  it('hides a message on this account only', async () => {
    api.hideChatMessage.mockResolvedValue({ data: { hidden: true } } as never);
    await renderChat();
    await fireEvent(await screen.findByTestId('chat-message-m1'), 'longPress');
    await fireEvent.press(screen.getByRole('button', { name: 'Hide it for me' }));
    expect(api.hideChatMessage).toHaveBeenCalledWith('h1', 'm1');
    expect(screen.queryByText('Round two soon?')).not.toBeOnTheScreen();
  });

  it('blocks through the delivered block confirmation', async () => {
    await renderChat();
    await fireEvent(await screen.findByTestId('chat-message-m1'), 'longPress');
    await fireEvent.press(screen.getByRole('button', { name: 'Block this person' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/block', params: { userId: 'u2', name: 'Mara' } });
  });

  it('lets the person who blocked read but not send', async () => {
    api.getHelloChat.mockResolvedValue({ data: { chat: chat({ canSend: false }) } } as never);
    await renderChat();
    expect(await screen.findByText('Round two soon?')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Message Mara')).not.toBeOnTheScreen();
    expect(screen.getByText("You blocked them, so you can't send here. Earlier messages stay.")).toBeOnTheScreen();
  });

  it('leaves the chat after confirming', async () => {
    api.leaveChat.mockResolvedValue({ data: { left: true } } as never);
    await renderChat();
    await fireEvent.press(await screen.findByRole('button', { name: 'Leave chat' }));
    expect(api.leaveChat).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Leave' }));
    expect(api.leaveChat).toHaveBeenCalledWith('h1');
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows a chat that is not open, or that you left, without any messages', async () => {
    api.getHelloChat.mockResolvedValue({ error: { code: 'chat_not_open', status: 409, message: 'x' } } as never);
    await renderChat();
    expect(await screen.findByText("This chat isn't open.")).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Message/)).not.toBeOnTheScreen();
  });

  it('leaves quietly when the server says this person is not a participant', async () => {
    api.getHelloChat.mockResolvedValue({ error: { code: 'forbidden', status: 403, message: 'x' } } as never);
    await renderChat();
    await screen.findByLabelText('Back');
    expect(mockBack).toHaveBeenCalled();
  });

  it('offers a retry when the chat fails to load', async () => {
    api.getHelloChat
      .mockResolvedValueOnce({ error: { message: 'offline', status: 0 } } as never)
      .mockResolvedValueOnce({ data: { chat: chat() } } as never);
    await renderChat();
    await fireEvent.press(await screen.findByText(/The chat didn't load/));
    expect(await screen.findByText('Round two soon?')).toBeOnTheScreen();
  });
});

describe('Connections · points earned (SN-51)', () => {
  const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  it('lists only server ledger lines, naming the person and place only after reveal', async () => {
    points.getConnectionsPoints.mockResolvedValue({
      data: {
        entries: [
          { id: 'l1', kind: 'accept', points: 25, createdAt: recent, helloId: 'h1', revealed: true, displayName: 'Mara', identityColor: '#8E24AA', locationName: 'Otero Coffee', chatOpen: true },
          { id: 'l2', kind: 'continue', points: 50, createdAt: recent, helloId: 'h1', revealed: true, displayName: 'Mara', identityColor: null, locationName: 'Otero Coffee', chatOpen: true },
          { id: 'l3', kind: 'accept', points: 25, createdAt: recent, helloId: 'h2', revealed: false, displayName: null, identityColor: null, locationName: null, chatOpen: false },
        ],
      },
    } as never);
    await render(<ThemeProvider><ConnectionsPointsScreen /></ThemeProvider>);
    expect(await screen.findByText('Connections')).toBeOnTheScreen();
    const day = new Date(recent).toLocaleDateString(undefined, { weekday: 'long' });
    expect(screen.getByText('Mara')).toBeOnTheScreen();
    expect(screen.getByText(`Otero Coffee · ${day}`)).toBeOnTheScreen();
    expect(screen.getByText('Kept a conversation going')).toBeOnTheScreen();
    expect(screen.getByText('Said Hello')).toBeOnTheScreen();
    expect(screen.getAllByText('+25')).toHaveLength(2);
    expect(screen.getByText('+50')).toBeOnTheScreen();
    // The continue line carries no name (Icebreakers design note).
    expect(screen.getAllByText('Mara')).toHaveLength(1);

    await fireEvent.press(screen.getByText('Mara'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(encounter)/chat', params: { helloId: 'h1' } });
  });

  it('shows an empty line and an error with retry, never invented awards', async () => {
    points.getConnectionsPoints.mockResolvedValueOnce({ error: { message: 'offline' } } as never)
      .mockResolvedValueOnce({ data: { entries: [] } } as never);
    await render(<ThemeProvider><ConnectionsPointsScreen /></ThemeProvider>);
    await fireEvent.press(await screen.findByText(/Your points didn't load/));
    expect(await screen.findByText('Points from your Hellos show up here.')).toBeOnTheScreen();
    expect(screen.queryByText(/^\+/)).not.toBeOnTheScreen();
  });
});
