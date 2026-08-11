/**
 * ENCOUNTER SCREENS TESTS
 *
 * Tests for frames 1a-1i: nudge, accepted, arrow, scan, selfie, pin-drop, countdown, reveal, missed-connection
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import NudgeScreen from '../nudge';
import AcceptedScreen from '../accepted';
import ArrowScreen from '../arrow';
import ScanScreen from '../scan';
import SelfiePromptScreen from '../selfie-prompt';
import SelfieReviewScreen from '../selfie-review';
import PinDropScreen from '../pin-drop';
import CountdownScreen from '../countdown';
import RevealScreen from '../reveal';
import MissedConnectionScreen from '../missed-connection';
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

  describe('1e - Selfie Prompt Screen', () => {
    it('renders selfie prompt with legally load-bearing disclosure', async () => {
      await render(
        <ThemeProvider>
          <SelfiePromptScreen />
        </ThemeProvider>
      );

      // RULES 10.34: Disclosure MUST be present BEFORE camera opens
      expect(screen.getByText(/Waverly wants to remember this one/)).toBeTruthy();
      expect(screen.getByText(/Take one together/)).toBeTruthy();
      expect(screen.getByText(/The first one counts/)).toBeTruthy();
      expect(screen.getByText(/You can always take a better one/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Take the selfie' })).toBeTruthy();
    });

    it('navigates to selfie review when take selfie is tapped', async () => {
      await render(
        <ThemeProvider>
          <SelfiePromptScreen />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: 'Take the selfie' });
      await fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });
  });

  describe('1e - Selfie Review Screen', () => {
    it('renders selfie review with retake disclaimer', async () => {
      await render(
        <ThemeProvider>
          <SelfieReviewScreen />
        </ThemeProvider>
      );

      expect(screen.getByText('Saved.')).toBeTruthy();
      expect(screen.getByText(/Take another if you want/)).toBeTruthy();
      expect(screen.getByText(/We'll keep the best one/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Looks good' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Retake' })).toBeTruthy();
    });

    it('has NO delete, NO discard, NO cancel buttons (RULES 10.31)', async () => {
      await render(
        <ThemeProvider>
          <SelfieReviewScreen />
        </ThemeProvider>
      );

      expect(screen.queryByText(/delete/i)).toBeNull();
      expect(screen.queryByText(/discard/i)).toBeNull();
      expect(screen.queryByText(/cancel/i)).toBeNull();
    });

    it('navigates to pin drop when looks good is tapped', async () => {
      await render(
        <ThemeProvider>
          <SelfieReviewScreen />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: 'Looks good' });
      await fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledWith('/(encounter)/pin-drop');
    });

    it('goes back when retake is tapped (RULES 10.30)', async () => {
      await render(
        <ThemeProvider>
          <SelfieReviewScreen />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: 'Retake' });
      await fireEvent.press(button);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('1f - Pin Drop Screen', () => {
    it('renders pin drop with permanence message', async () => {
      await render(
        <ThemeProvider>
          <PinDropScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Waverly just dropped a pin/)).toBeTruthy();
      expect(screen.getByText(/Right where you're standing/)).toBeTruthy();
      expect(screen.getByText(/It stays/)).toBeTruthy();
    });
  });

  describe('1g - Countdown Screen', () => {
    it('renders countdown with hours and minutes only (RULES 10.14)', async () => {
      await render(
        <ThemeProvider>
          <CountdownScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Waverly's holding something/)).toBeTruthy();
      expect(screen.getByText(/2h 47m/)).toBeTruthy();
      expect(screen.getByText(/until Waverly hands it over/)).toBeTruthy();
    });

    it('shows NO seconds in countdown (RULES 10.14)', async () => {
      await render(
        <ThemeProvider>
          <CountdownScreen />
        </ThemeProvider>
      );

      // Should NOT contain seconds indicator
      expect(screen.queryByText(/s$/)).toBeNull();
      expect(screen.queryByText(/sec/i)).toBeNull();
    });
  });

  describe('1h - Reveal Screen', () => {
    it('renders reveal with minimal decoration', async () => {
      await render(
        <ThemeProvider>
          <RevealScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Waverly's back/)).toBeTruthy();
      expect(screen.getByText(/Here's what she wrote/)).toBeTruthy();
      expect(screen.getByText(/Seven more of hers below/)).toBeTruthy();
    });
  });

  describe('1i - Missed Connection Screen', () => {
    it('renders missed connection without rejection framing (RULES 10.21)', async () => {
      await render(
        <ThemeProvider>
          <MissedConnectionScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/who you missed today/)).toBeTruthy();
      expect(screen.getByText(/The 25 points stand/)).toBeTruthy();
    });

    it('never explains non-acceptance (RULES 10.21)', async () => {
      await render(
        <ThemeProvider>
          <MissedConnectionScreen />
        </ThemeProvider>
      );

      // Should NOT contain rejection language
      expect(screen.queryByText(/reject/i)).toBeNull();
      expect(screen.queryByText(/declined/i)).toBeNull();
      expect(screen.queryByText(/not interested/i)).toBeNull();
      expect(screen.queryByText(/unfortunately/i)).toBeNull();
    });
  });
});
