/**
 * ENCOUNTER SCREENS TESTS
 *
 * Tests for frames 1a-1i: nudge, accepted, arrow, scan, selfie, pin-drop, countdown, reveal, missed-connection
 *
 * VERTICAL-BUILD-03: the screens now run on a real server hello (GET/POST
 * /hellos/:id…), so each frame is rendered with a mocked server response.
 * Assertions that pinned sample data (a fixed "+25", "2h 47m" as a constant,
 * "Mara", gendered "she/his" copy, "The 25 points stand", "We'll keep the best
 * one", "Waverly's pointing") are replaced by assertions on what the server
 * returns; every copy, silence, distance and no-discard check is kept.
 *
 * VERTICAL-BUILD-05 replacements (for coordinator review), each stronger than before:
 *  - Accepted "no points while waiting" encoded the dead 2026-08-22 rule (half-accept
 *    pays nothing). RULES §4.2 / MONEY Part 4 pay the accept on your own accept, so the
 *    waiting state now shows exactly the server ledger's award: none when the ledger
 *    has none (kept), +25 when it has 25 (added).
 *  - Scan "shows this phone's code" asserted the SHARED hello code. §10.18 "entered by
 *    the other person": the phone now shows its OWN proof code, and the test also
 *    asserts the shared code is not what is shown.
 *  - Scan "sends the typed code" now also asserts the method ('code').
 *  - Reveal "chat unavailable when both continue" → the chat now exists (§10.16):
 *    asserts the delivered "You've got a chat." line and that it opens the chat.
 */

import React from 'react';
import { AppState } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContext } from 'expo-router/react-navigation';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import NudgeScreen from '../../../app/(encounter)/nudge';
import AcceptedScreen from '../../../app/(encounter)/accepted';
import ArrowScreen from '../../../app/(encounter)/arrow';
import ScanScreen from '../../../app/(encounter)/scan';
import SelfiePromptScreen from '../../../app/(encounter)/selfie-prompt';
import SelfieReviewScreen from '../../../app/(encounter)/selfie-review';
import PinDropScreen from '../../../app/(encounter)/pin-drop';
import CountdownScreen from '../../../app/(encounter)/countdown';
import RevealScreen from '../../../app/(encounter)/reveal';
import MissedConnectionScreen from '../../../app/(encounter)/missed-connection';
import { ThemeProvider } from '../../../src/theme';
import * as hellosApi from '../../../src/api/hellos';
import {
  getSelfiePreview,
  recordAward,
  resetActiveHello,
  setActiveHelloId,
  setSelfiePreview,
} from '../../../src/state/active-hello';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// A 16-byte JPEG header: enough for the client's JPEG signature check.
const JPEG_BASE64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01]).toString('base64');

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useCameraPermissions: jest.fn(),
    CameraView: React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({
        takePictureAsync: jest.fn().mockResolvedValue({
          uri: 'file:///capture.jpg',
          width: 1,
          height: 1,
          base64: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01]).toString('base64'),
          format: 'jpg',
        }),
      }));
      return React.createElement(View, props);
    }),
  };
});

jest.mock('../../../src/api/hellos', () => ({
  ...jest.requireActual('../../../src/api/hellos'),
  getHello: jest.fn(),
  acceptHello: jest.fn(),
  declineHello: jest.fn(),
  scanHello: jest.fn(),
  continueHello: jest.fn(),
  getHelloReveal: jest.fn(),
  uploadHelloSelfie: jest.fn(),
  getHelloPoints: jest.fn(),
}));

const mockHasSeenSafety = jest.fn();
jest.mock('../../../src/state/safety-guidance', () => ({
  hasSeenSafetyGuidance: (...a: unknown[]) => mockHasSeenSafety(...a),
  markSafetyGuidanceSeen: jest.fn(),
}));

jest.mock('../../../src/api/client', () => {
  // Inside the factory: jest.mock is hoisted above module-level initialisers.
  const listeners = new Set<() => void>();
  return {
    api: {
      icebreakers: {
        getMyAnswers: jest.fn().mockResolvedValue({ data: { answers: [{}, {}, {}] } }),
      },
    },
    addSessionChangeListener: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    mockSessionListeners: listeners,
  };
});
const mockSessionListeners: Set<() => void> = jest.requireMock('../../../src/api/client').mockSessionListeners;

const api = hellosApi as jest.Mocked<typeof hellosApi>;

const pending = { id: 'h1', status: 'pending', from: 'waverly' };
const accepted = (overrides: Record<string, unknown> = {}) => ({
  id: 'h1',
  status: 'accepted',
  helloCode: 'ABC2345',
  myProofCode: 'MNP-4567',
  revealScheduledAt: new Date(Date.now() + 3 * 3600_000).toISOString(),
  revealedAt: null,
  qrScanned: false,
  qrExpiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  failedScanCount: 2,
  hasSelfie: false,
  ...overrides,
});

describe('Encounter Flow', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetActiveHello();
    setActiveHelloId('h1');
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true, canAskAgain: true, status: 'granted' },
      jest.fn(),
    ]);
    api.getHello.mockResolvedValue({ data: { hello: pending } });
    api.getHelloPoints.mockResolvedValue({ data: { points: { accept: 0, selfie: 0, continue: 0 } } });
  });

  describe('1a - Nudge Screen', () => {
    it('renders nudge screen with correct copy', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      expect(await screen.findByText(/It's time to/)).toBeTruthy();
      expect(screen.getByText(/Say Hello/)).toBeTruthy();
      expect(screen.getByText(/Go ahead, it's just one word/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Accept' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Not right now' })).toBeTruthy();
    });

    it('navigates to accepted screen when accept is tapped', async () => {
      api.acceptHello.mockResolvedValue({ data: { hello: pending } });
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      const acceptButton = await screen.findByRole('button', { name: 'Accept' });
      await fireEvent.press(acceptButton);

      expect(api.acceptHello).toHaveBeenCalledWith('h1');
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/accepted');
    });

    it('navigates back when decline is tapped', async () => {
      api.declineHello.mockResolvedValue({ data: { hello: pending } });
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );

      const declineButton = await screen.findByRole('button', { name: 'Not right now' });
      await fireEvent.press(declineButton);

      expect(api.declineHello).toHaveBeenCalledWith('h1');
      expect(mockBack).toHaveBeenCalled();
    });

    it('stays on the nudge with a visible error when the accept request fails', async () => {
      api.acceptHello.mockResolvedValue({ error: { message: 'Offline — try again', status: 0 } } as never);
      await render(<ThemeProvider><NudgeScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByRole('button', { name: 'Accept' }));
      expect(screen.getByText('Offline — try again')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('never states a distance', async () => {
      await render(
        <ThemeProvider>
          <NudgeScreen />
        </ThemeProvider>
      );
      await screen.findByText(/It's time to/);

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
    it('renders the server-reported accept points after a mutual accept', async () => {
      api.getHello.mockResolvedValue({ data: { hello: accepted() } });
      api.getHelloPoints.mockResolvedValue({ data: { points: { accept: 25, selfie: 0, continue: 0 } } });
      await render(
        <ThemeProvider>
          <AcceptedScreen />
        </ThemeProvider>
      );

      expect(await screen.findByText('They said yes too.')).toBeTruthy();
      expect(screen.getByText('+25')).toBeTruthy();
      expect(screen.getByText('points')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Show me' })).toBeTruthy();
    });

    it('shows no points when the server ledger has none, and a check-again action while the other side has not answered', async () => {
      await render(<ThemeProvider><AcceptedScreen /></ThemeProvider>);
      expect(await screen.findByText(/Your yes is in/)).toBeOnTheScreen();
      expect(api.getHelloPoints).toHaveBeenCalledWith('h1');
      expect(screen.queryByTestId('accept-points')).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByRole('button', { name: 'Check again' }));
      expect(api.getHello).toHaveBeenCalledTimes(2);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('shows the own-accept award while still waiting, read from the server ledger (§4.2)', async () => {
      api.getHelloPoints.mockResolvedValue({ data: { points: { accept: 25, selfie: 0, continue: 0 } } });
      await render(<ThemeProvider><AcceptedScreen /></ThemeProvider>);
      expect(await screen.findByText('+25')).toBeOnTheScreen();
      expect(screen.getByText(/Your yes is in/)).toBeOnTheScreen();
      expect(screen.queryByText('They said yes too.')).not.toBeOnTheScreen();
    });

    it('goes to the arrow screen when continue is tapped and the safety guidance was already seen', async () => {
      mockHasSeenSafety.mockResolvedValue(true);
      api.getHello.mockResolvedValue({ data: { hello: accepted() } });
      await render(<ThemeProvider><AcceptedScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByRole('button', { name: 'Show me' }));
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(encounter)/arrow'));
    });

    it('shows the safety guidance once before the first meet on this device (§24.18, §36.6)', async () => {
      mockHasSeenSafety.mockResolvedValue(false);
      api.getHello.mockResolvedValue({ data: { hello: accepted() } });
      await render(<ThemeProvider><AcceptedScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByRole('button', { name: 'Show me' }));
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(encounter)/safety'));
      expect(mockPush).not.toHaveBeenCalledWith('/(encounter)/arrow');
    });
  });

  describe('1c - Arrow Screen', () => {
    it('renders arrow screen with correct copy', async () => {
      await render(
        <ThemeProvider>
          <ArrowScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/can't point the way yet/)).toBeTruthy();
      expect(screen.getByText(/Say Hello/)).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Scan their code' }));
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/scan');
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
    beforeEach(() => {
      api.getHello.mockResolvedValue({ data: { hello: accepted() } });
    });

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

    it('shows this phone’s per-encounter code with the fallback instruction', async () => {
      await render(<ThemeProvider><ScanScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByText('Show my code'));
      // This phone's OWN proof code (§10.18), never the shared support reference.
      expect(screen.getByTestId('hello-code-text')).toHaveTextContent('MNP-4567');
      expect(screen.queryByText('ABC2345')).not.toBeOnTheScreen();
      expect(screen.getByText("If you can't scan, enter this code.")).toBeOnTheScreen();
      expect(screen.getByRole('image', { name: /Your hello code/ })).toBeOnTheScreen();
    });

    it('sends the code typed from the other phone and moves to the selfie when the server accepts it', async () => {
      api.scanHello.mockResolvedValue({ data: { hello: accepted({ qrScanned: true }), alreadyScanned: false } });
      await render(<ThemeProvider><ScanScreen /></ThemeProvider>);
      await fireEvent.changeText(await screen.findByLabelText('Or type the code on their phone'), 'abc2345');
      await fireEvent.press(screen.getByRole('button', { name: 'Enter code' }));
      expect(api.scanHello).toHaveBeenCalledWith('h1', 'abc2345', 'code');
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-prompt');
    });

    it('refuses this phone’s own code without counting it as a failed scan (§10.18)', async () => {
      api.scanHello.mockResolvedValue({ error: { code: 'own_code', message: 'own', status: 400 } } as never);
      await render(<ThemeProvider><ScanScreen /></ThemeProvider>);
      const input = await screen.findByLabelText('Or type the code on their phone');
      await fireEvent.changeText(input, 'MNP-4567');
      await fireEvent.press(screen.getByRole('button', { name: 'Enter code' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Enter code' }));
      expect(screen.getByText("That's the code on your phone. Type the one on theirs.")).toBeOnTheScreen();
      expect(screen.queryByTestId('manual-selfie-path')).not.toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('opens the manual selfie path only after the server-set number of failed scans', async () => {
      api.scanHello.mockResolvedValue({ error: { code: 'invalid_code', message: 'Hello code does not match', status: 400 } } as never);
      await render(<ThemeProvider><ScanScreen /></ThemeProvider>);
      const input = await screen.findByLabelText('Or type the code on their phone');
      await fireEvent.changeText(input, 'WRONG11');
      await fireEvent.press(screen.getByRole('button', { name: 'Enter code' }));
      expect(screen.getByText("That code didn't match. Try again.")).toBeOnTheScreen();
      expect(screen.queryByTestId('manual-selfie-path')).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByRole('button', { name: 'Enter code' }));
      expect(screen.getByTestId('manual-selfie-path')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();
      // The manual path tells the selfie screen to record the meeting proof (§10.47).
      await fireEvent.press(screen.getByTestId('manual-selfie-path'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(encounter)/selfie-prompt', params: { proof: 'manual' } });
    });
  });

  describe('1e - Selfie Prompt Screen', () => {
    beforeEach(() => {
      api.getHello.mockResolvedValue({ data: { hello: accepted({ qrScanned: true }) } });
    });

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
      expect(screen.getByText(/first photo is saved the moment you take it/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Take the selfie' })).toBeTruthy();
    });

    it('opens the live camera with the capture consent visible, and navigates nowhere before an upload', async () => {
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      expect(screen.getByTestId('selfie-camera')).toBeOnTheScreen();
      // RULES 10.48 — visible at capture
      expect(screen.getByText(/carries both your names/)).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('uploads the first capture before showing review, and reports only the server award', async () => {
      api.uploadHelloSelfie.mockResolvedValue({ data: { hello: accepted({ hasSelfie: true }) as never, pointsAwarded: 25, firstCapture: true } });
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));

      expect(api.uploadHelloSelfie).toHaveBeenCalledTimes(1);
      const [helloId, bytes, contentType] = api.uploadHelloSelfie.mock.calls[0];
      expect(helloId).toBe('h1');
      expect(contentType).toBe('image/jpeg');
      expect(Buffer.from(bytes as ArrayBuffer)).toEqual(Buffer.from(JPEG_BASE64, 'base64'));
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });

    it('keeps the capture for retry and never shows review when the upload fails', async () => {
      api.uploadHelloSelfie
        .mockResolvedValueOnce({ error: { message: 'Could not store selfie', status: 502 } })
        .mockResolvedValueOnce({ data: { hello: accepted({ hasSelfie: true }) as never, pointsAwarded: 25, firstCapture: true } });
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      expect(screen.getByText('Could not store selfie')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
      expect(api.uploadHelloSelfie).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });

    // Encounter-review carryover: focus / background / sign-in lifecycle.
    function mockNavigation() {
      const listeners: Record<string, Set<() => void>> = { focus: new Set(), blur: new Set() };
      let focused = true;
      const navigation = {
        addListener: (event: string, cb: () => void) => {
          listeners[event]?.add(cb);
          return () => { listeners[event]?.delete(cb); };
        },
        isFocused: () => focused,
      };
      const emit = async (event: 'focus' | 'blur') => {
        focused = event === 'focus';
        await act(async () => { listeners[event].forEach(cb => cb()); });
      };
      return { navigation, emit };
    }

    function deferredUpload() {
      let resolve!: (value: unknown) => void;
      api.uploadHelloSelfie.mockReturnValue(new Promise(r => { resolve = r; }) as never);
      return (value: unknown) => act(async () => { resolve(value); });
    }

    const stored = { data: { hello: accepted({ hasSelfie: true }) as never, pointsAwarded: 25, firstCapture: true } };

    it('does not push the review onto an unfocused screen; it opens when the screen is focused again', async () => {
      const { navigation, emit } = mockNavigation();
      const finish = deferredUpload();
      await render(
        <NavigationContext.Provider value={navigation as never}>
          <ThemeProvider><SelfiePromptScreen /></ThemeProvider>
        </NavigationContext.Provider>
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      expect(api.uploadHelloSelfie).toHaveBeenCalledTimes(1);

      await emit('blur');
      // The camera is hidden at once; the in-flight bytes keep uploading.
      expect(screen.queryByTestId('selfie-camera')).not.toBeOnTheScreen();
      await finish(stored);
      expect(mockPush).not.toHaveBeenCalled();

      await emit('focus');
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });

    it('does not push the review while the app is in the background', async () => {
      const finish = deferredUpload();
      const listeners: Array<(state: string) => void> = [];
      // Once only: the screen subscribes once; the preset mock stays intact for later tests.
      jest.spyOn(AppState, 'addEventListener').mockImplementationOnce(((_: string, cb: (state: string) => void) => {
        listeners.push(cb);
        return { remove: jest.fn() };
      }) as never);
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      await act(async () => { listeners.forEach(cb => cb('background')); });
      expect(screen.queryByTestId('selfie-camera')).not.toBeOnTheScreen();
      await finish(stored);
      expect(mockPush).not.toHaveBeenCalled();
      await act(async () => { listeners.forEach(cb => cb('active')); });
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });

    it('drops the capture and never navigates when another account signs in during the upload', async () => {
      const finish = deferredUpload();
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      await act(async () => { mockSessionListeners.forEach(cb => cb()); });
      await finish(stored);
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.queryByTestId('selfie-camera')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeOnTheScreen();
      expect(getSelfiePreview('h1')).toBeNull();
    });

    it('records the meeting proof when opened from the manual selfie path (§10.38, §10.47)', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ proof: 'manual' });
      api.getHello.mockResolvedValue({ data: { hello: accepted() } });
      api.uploadHelloSelfie.mockResolvedValue(stored);
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      expect(api.uploadHelloSelfie.mock.calls[0][3]).toBe('manual');
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/selfie-review');
    });

    it('does not record meeting proof from the ordinary (scanned) selfie path', async () => {
      api.uploadHelloSelfie.mockResolvedValue(stored);
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByRole('button', { name: 'Take the selfie' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Take it' }));
      expect(api.uploadHelloSelfie.mock.calls[0][3]).toBeUndefined();
    });

    it('offers skip only before the first capture (RULES 10.33)', async () => {
      api.getHello.mockResolvedValue({ data: { hello: accepted({ qrScanned: true, hasSelfie: true }) } });
      await render(<ThemeProvider><SelfiePromptScreen /></ThemeProvider>);
      expect(await screen.findByText('Keep the saved one')).toBeOnTheScreen();
      expect(screen.queryByText('Skip for now')).not.toBeOnTheScreen();
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
      expect(screen.getByText(/A retake replaces this one/)).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Looks good' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Retake' })).toBeTruthy();
    });

    it('shows the photo this phone saved and the first-capture award the server reported', async () => {
      setSelfiePreview('h1', 'file:///capture.jpg');
      recordAward('h1', 'selfie', 25);
      await render(<ThemeProvider><SelfieReviewScreen /></ThemeProvider>);
      expect(screen.getByTestId('selfie-preview')).toBeOnTheScreen();
      expect(screen.getByTestId('selfie-points')).toHaveTextContent('+25 points');
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
      await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
      expect(mockPush).toHaveBeenCalledWith('/(encounter)/countdown');
    });
  });

  describe('1g - Countdown Screen', () => {
    beforeEach(() => {
      // 2h 47m and half a minute from now, from the server's reveal_scheduled_at.
      api.getHello.mockResolvedValue({
        data: { hello: accepted({ qrScanned: true, revealScheduledAt: new Date(Date.now() + (167 * 60 + 30) * 1000).toISOString() }) },
      });
    });

    it('renders countdown with hours and minutes only (RULES 10.14)', async () => {
      await render(
        <ThemeProvider>
          <CountdownScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/Waverly's holding something/)).toBeTruthy();
      expect(await screen.findByText(/2h 47m/)).toBeTruthy();
      expect(screen.getByText(/until Waverly hands it over/)).toBeTruthy();
    });

    it('shows NO seconds in countdown (RULES 10.14)', async () => {
      await render(
        <ThemeProvider>
          <CountdownScreen />
        </ThemeProvider>
      );
      await screen.findByTestId('countdown-clock');

      // Should NOT contain seconds indicator
      expect(screen.queryByText(/s$/)).toBeNull();
      expect(screen.queryByText(/sec/i)).toBeNull();
    });
  });

  describe('1h - Reveal Screen', () => {
    const answers = Array.from({ length: 9 }, (_, i) => ({ question: `Question ${i + 1}`, answer: `Answer ${i + 1}` }));

    beforeEach(() => {
      api.getHello.mockResolvedValue({ data: { hello: accepted({ revealedAt: '2026-09-25T12:00:00.000Z' }) } });
      api.getHelloReveal.mockResolvedValue({
        data: {
          reveal: {
            id: 'h1',
            status: 'accepted',
            person: { displayName: 'Mara', identityColor: null, profilePhotoUrl: null },
            icebreakers: answers,
            locationName: null,
            selfieUrl: null,
          },
          hello: accepted({ revealedAt: '2026-09-25T12:00:00.000Z', myContinue: null, bothContinued: false }) as never,
        },
      });
    });

    it('renders reveal with minimal decoration', async () => {
      await render(
        <ThemeProvider>
          <RevealScreen />
        </ThemeProvider>
      );

      expect(await screen.findByText(/Waverly's back/)).toBeTruthy();
      expect(screen.getByText(/Here's what Mara wrote/)).toBeTruthy();
      expect(screen.getByText('7 more below')).toBeTruthy();
      expect(screen.getByText('Answer 9')).toBeTruthy();
    });

    it('records only this viewer’s second-wave choice and shows chat as unavailable when both continue', async () => {
      api.continueHello.mockResolvedValue({
        data: { hello: accepted({ revealedAt: '2026-09-25T12:00:00.000Z', myContinue: true, bothContinued: true }) as never, pointsAwarded: 50 },
      });
      await render(<ThemeProvider><RevealScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByRole('button', { name: 'Keep talking' }));
      expect(api.continueHello).toHaveBeenCalledWith('h1', true);
      expect(screen.getByText("Mara said yes. You've got a chat.")).toBeOnTheScreen();
      expect(screen.queryByText(/Chat isn't in the app yet/)).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('open-chat'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(encounter)/chat', params: { helloId: 'h1' } });
    });
  });

  describe('1i - Missed Connection Screen', () => {
    beforeEach(() => {
      api.getHello.mockResolvedValue({ data: { hello: { id: 'h1', status: 'missed', helloCode: 'ABC2345' } } });
      api.getHelloReveal.mockResolvedValue({
        data: {
          reveal: {
            id: 'h1',
            status: 'missed',
            person: { displayName: 'Theo', identityColor: null, profilePhotoUrl: null },
            icebreakers: [{ question: 'What are you weirdly good at?', answer: 'Naming the year a song came out.' }],
            locationName: null,
            selfieUrl: null,
          },
          hello: { id: 'h1', status: 'missed', helloCode: 'ABC2345' } as never,
        },
      });
    });

    it('renders missed connection without rejection framing (RULES 10.21)', async () => {
      await render(
        <ThemeProvider>
          <MissedConnectionScreen />
        </ThemeProvider>
      );

      expect(await screen.findByText(/who you missed today/)).toBeTruthy();
      expect(screen.getByText('Theo')).toBeTruthy();
      expect(screen.getByText('Naming the year a song came out.')).toBeTruthy();
    });

    it('never explains non-acceptance (RULES 10.21)', async () => {
      await render(
        <ThemeProvider>
          <MissedConnectionScreen />
        </ThemeProvider>
      );
      await screen.findByText(/who you missed today/);

      // Should NOT contain rejection language
      expect(screen.queryByText(/reject/i)).toBeNull();
      expect(screen.queryByText(/declined/i)).toBeNull();
      expect(screen.queryByText(/not interested/i)).toBeNull();
      expect(screen.queryByText(/unfortunately/i)).toBeNull();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <MissedConnectionScreen />
        </ThemeProvider>
      );
      await screen.findByText(/who you missed today/);

      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
