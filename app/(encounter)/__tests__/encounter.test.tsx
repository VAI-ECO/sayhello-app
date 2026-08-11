/**
 * ENCOUNTER SCREENS TESTS
 *
 * Tests for frames 1a-1d: nudge, accepted, arrow, scan
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import NudgeScreen from '../nudge';
import AcceptedScreen from '../accepted';
import ArrowScreen from '../arrow';
import ScanScreen from '../scan';
import { ThemeProvider } from '../../../src/theme';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Encounter Flow', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  describe('1a - Nudge Screen', () => {
    it('renders nudge screen with correct copy', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/It's time to/)).toBeTruthy();
      expect(screen.getByText(/Say Hello/)).toBeTruthy();
      expect(screen.getByText(/Go ahead, it's just one word/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Accept' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Not right now' })).toBeTruthy();
    });

    it('navigates to accepted screen when accept is tapped', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      const acceptButton = screen.getByRole('button', { name: 'Accept' });
      await fireEvent.press(acceptButton);

      expect(mockPush).toHaveBeenCalledWith('/(encounter)/accepted');
    });

    it('navigates back when decline is tapped', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      const declineButton = screen.getByRole('button', { name: 'Not right now' });
      await fireEvent.press(declineButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('never states a distance', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      // Should not contain distance-related text
      expect(screen.queryByText(/feet/i)).toBeNull();
      expect(screen.queryByText(/yards/i)).toBeNull();
      expect(screen.queryByText(/meters/i)).toBeNull();
      expect(screen.queryByText(/metres/i)).toBeNull();
      expect(screen.queryByText(/close/i)).toBeNull();
      expect(screen.queryByText(/near/i)).toBeNull();
    });
  });

  describe('1b - Accepted Screen', () => {
    it('renders accepted screen with points', async () => {
      await render(
        <ThemeProvider>
          <AcceptedScreen />
        </ThemeProvider>
      );

      expect(screen.getByText('+25')).toBeTruthy();
      expect(screen.getByText('points')).toBeTruthy();
      expect(screen.getByText(/Waverly will point you at them/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Show me' })).toBeTruthy();
    });

    it('navigates to arrow screen when continue is tapped', async () => {
      await render(
        <ThemeProvider>
          <AcceptedScreen />
        </ThemeProvider>
      );

      const continueButton = screen.getByRole('button', { name: 'Show me' });
      await fireEvent.press(continueButton);

      expect(mockPush).toHaveBeenCalledWith('/(encounter)/arrow');
    });
  });

  describe('1c - Arrow Screen', () => {
    it('renders arrow screen with correct copy', async () => {
      await render(
        <ThemeProvider>
          <ArrowScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Waverly's pointing/)).toBeTruthy();
      expect(screen.getByText(/Say Hello/)).toBeTruthy();
    });

    it('never states a distance (RULES 8.12)', async () => {
      await render(
        <ThemeProvider>
          <ArrowScreen />
        </ThemeProvider>
      );

      // Should NOT show distance per RULES 8.12
      expect(screen.queryByText(/feet/i)).toBeNull();
      expect(screen.queryByText(/yards/i)).toBeNull();
      expect(screen.queryByText(/meters/i)).toBeNull();
      expect(screen.queryByText(/metres/i)).toBeNull();
      expect(screen.queryByText(/ahead/i)).toBeNull();
      expect(screen.queryByText(/away/i)).toBeNull();
    });
  });

  describe('1d - Scan Screen', () => {
    it('renders scan screen with correct copy', async () => {
      await render(
        <ThemeProvider>
          <ScanScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Scan the QR code/)).toBeTruthy();
      expect(screen.getByText(/Say Hello/)).toBeTruthy();
      expect(screen.getByText(/Hold their code in the frame/)).toBeTruthy();
    });
  });
});
