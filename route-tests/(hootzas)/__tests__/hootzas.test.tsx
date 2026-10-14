/**
 * HOOTZA SCREENS TESTS
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HootzaPageScreen from '../../../app/(hootzas)/[id]/index';
import EndVsCancelScreen from '../../../app/(hootzas)/[id]/end-vs-cancel';
import CancelConfirmScreen from '../../../app/(hootzas)/[id]/cancel-confirm';
import EditHootzaScreen from '../../../app/(hootzas)/[id]/edit';
import CommentsScreen from '../../../app/(hootzas)/[id]/comments';
import HostControlsScreen from '../../../app/(hootzas)/[id]/host-controls';
import CheckInCodeScreen from '../../../app/(hootzas)/[id]/check-in-code';
import CreateWhatWhereScreen from '../../../app/(hootzas)/create/index';
import PostErrorScreen from '../../../app/(hootzas)/create/post-error';
import HootzasEmptyScreen from '../../../app/(hootzas)/empty';
import * as hootzasApi from '../../../src/api/hootzas';
import * as feedApi from '../../../src/api/feed';
import {
  getHootzaCreateDraft,
  resetHootzaCreateDraft,
  updateHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';
import { resetHootzaSession } from '../../../src/state/hootza-session';
import CreateHowItRunsScreen from '../../../app/(hootzas)/create/how-it-runs';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../src/api/hootzas');
jest.mock('../../../src/api/feed');
jest.mock('../../../src/api/client', () => ({
  api: {
    user: {
      getProfile: jest.fn().mockResolvedValue({ data: { id: 'user-1' } }),
    },
  },
}));

const mockHootza = (overrides: Partial<hootzasApi.Hootza> = {}): hootzasApi.Hootza => ({
  id: 'hz-1',
  hostUserId: 'host-1',
  title: 'Trivia Night',
  description: 'Bring a team',
  venueType: 'public_place',
  locationName: '412 Bell St',
  locationLat: 36.1,
  locationLng: -86.7,
  startTime: '2026-08-20T19:00:00.000Z',
  scheduledEndTime: '2026-08-20T22:00:00.000Z',
  actualEndTime: null,
  coverChargeAmount: 500,
  coverChargeDescription: 'At the door',
  status: 'live',
  cancellationReason: null,
  cancelledAt: null,
  checkInQrCode: 'ABC123',
  createdAt: '2026-08-17T12:00:00.000Z',
  host: { id: 'host-1', fullName: 'Alex Host' },
  rsvps: [{ count: 8 }],
  checkins: [{ count: 3 }],
  ...overrides,
});

function distanceGuard(container: unknown) {
  const text = JSON.stringify(container);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
}

describe('Hootza Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;
  let mockDismissTo: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetHootzaCreateDraft();
    resetHootzaSession();
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    mockDismissTo = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
      dismissTo: mockDismissTo,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1' });
  });

  describe('Hootza page — live', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: { hootza: mockHootza() },
      });
    });

    it('renders live hootza', async () => {
      await render(
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hootza-title')).toHaveTextContent('Trivia Night');
      });
      expect(screen.getByTestId('hootza-live-badge')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('hootza-title')).toBeTruthy());
      distanceGuard(container);
    });
  });

  describe('Hootza page — ended', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: {
          hootza: mockHootza({
            status: 'ended',
            actualEndTime: '2026-08-20T23:00:00.000Z',
          }),
        },
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1' });
    });

    it('renders ended band', async () => {
      await render(
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId('hootza-ended-band')).toBeTruthy();
      });
    });
  });

  describe('Hootza page — cancelled', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: {
          hootza: mockHootza({
            status: 'cancelled',
            cancellationReason: 'Weather',
            cancelledAt: '2026-08-19T10:00:00.000Z',
          }),
        },
      });
    });

    it('renders cancelled band and reason', async () => {
      await render(
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId('hootza-cancelled-band')).toBeTruthy();
        expect(screen.getByText('Weather')).toBeTruthy();
      });
    });
  });

  describe('End vs Cancel', () => {
    it('shows distinct end and cancel columns', async () => {
      await render(
        <ThemeProvider>
          <EndVsCancelScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('end-vs-cancel-end')).toBeTruthy();
      expect(screen.getByTestId('end-vs-cancel-cancel')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <EndVsCancelScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });

  describe('Cancel confirm', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: { hootza: mockHootza({ hostUserId: 'user-1' }) },
      });
      (hootzasApi.cancelHootza as jest.Mock).mockResolvedValue({ data: { message: 'ok' } });
    });

    it('submits cancel with reason', async () => {
      await render(
        <ThemeProvider>
          <CancelConfirmScreen />
        </ThemeProvider>
      );
      const input = await screen.findByTestId('cancel-reason-input');
      fireEvent.changeText(input, 'Rain');
      await fireEvent.press(await screen.findByTestId('cancel-confirm-submit'));
      await waitFor(() => {
        expect(hootzasApi.cancelHootza).toHaveBeenCalledWith('hz-1', 'Rain');
      });
    });
  });

  describe('Edit live Hootza', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: { hootza: mockHootza({ hostUserId: 'user-1' }) },
      });
    });

    const renderEdit = () => render(<ThemeProvider><EditHootzaScreen /></ThemeProvider>);

    it('shows the going count and seeds the form from the live Hootza', async () => {
      (hootzasApi.getRsvpCount as jest.Mock).mockReturnValue(8);
      await renderEdit();
      expect(await screen.findByText("8 people said they're going")).toBeTruthy();
      expect(hootzasApi.getHootza).toHaveBeenCalledWith('hz-1');
      expect(screen.getByTestId('edit-title').props.value).toBe('Trivia Night');
      expect(screen.getByTestId('edit-details').props.value).toBe('Bring a team');
      expect(screen.getByTestId('edit-cover').props.value).toBe('5');
    });

    it('saves through PATCH updateHootza with the edited fields and says Saved', async () => {
      (hootzasApi.updateHootza as jest.Mock).mockResolvedValue({ data: { ok: true } });
      await renderEdit();
      await fireEvent.changeText(await screen.findByTestId('edit-title'), 'Trivia Night II');
      await fireEvent.press(screen.getByTestId('edit-save'));
      await waitFor(() => expect(hootzasApi.updateHootza).toHaveBeenCalledTimes(1));
      const [id, patch] = (hootzasApi.updateHootza as jest.Mock).mock.calls[0];
      expect(id).toBe('hz-1');
      expect(patch).toEqual(expect.objectContaining({
        title: 'Trivia Night II', venueType: 'public_place', locationName: '412 Bell St',
        coverChargeAmount: 500, chatEnabled: false, adultsOnly: false,
      }));
      expect(await screen.findByTestId('edit-save-msg')).toHaveTextContent('Saved.');
    });

    it('refuses a bad time without calling the server', async () => {
      await renderEdit();
      await fireEvent.changeText(await screen.findByTestId('edit-start'), 'noon');
      await fireEvent.press(screen.getByTestId('edit-save'));
      expect(await screen.findByTestId('edit-save-msg')).toHaveTextContent('Enter a valid date and time.');
      expect(hootzasApi.updateHootza).not.toHaveBeenCalled();
    });

    it('names the venue lock when the server refuses with venue_type_locked', async () => {
      (hootzasApi.updateHootza as jest.Mock).mockResolvedValue({ error: { code: 'venue_type_locked', message: 'x' } });
      await renderEdit();
      await fireEvent.press(await screen.findByTestId('edit-venue-private'));
      await fireEvent.press(screen.getByTestId('edit-save'));
      expect(await screen.findByTestId('edit-save-msg')).toHaveTextContent(/public or private cannot change/);
    });

    it('disables Save when the Hootza is no longer live', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: mockHootza({ hostUserId: 'user-1', status: 'ended' }) } });
      await renderEdit();
      await screen.findByTestId('edit-save');
      expect(screen.getByTestId('edit-save').props.accessibilityState?.disabled ?? screen.getByTestId('edit-save').props.disabled).toBeTruthy();
      expect(hootzasApi.updateHootza).not.toHaveBeenCalled();
    });
  });

  describe('Comments', () => {
    beforeEach(() => {
      (hootzasApi.getHootzaComments as jest.Mock).mockResolvedValue({
        data: { comments: [] },
      });
    });

    it('shows empty comments state', async () => {
      await render(
        <ThemeProvider>
          <CommentsScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('comments-empty')).toBeTruthy();
    });
  });

  describe('Host controls', () => {
    beforeEach(() => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({
        data: {
          hootza: mockHootza({
            hostUserId: 'user-1',
            hostMode: {
              id: 'hm-1',
              hootzaId: 'hz-1',
              intervalMinutes: 45,
              windowLengthMinutes: 10,
              lastWindowOpenedAt: null,
              isActive: true,
              developerOverrideEnabled: false,
            },
          }),
        },
      });
      (hootzasApi.endHootza as jest.Mock).mockResolvedValue({ data: { message: 'ended' } });
    });

    it('end and cancel are separate actions', async () => {
      await render(
        <ThemeProvider>
          <HostControlsScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('host-end-hootza')).toBeTruthy();
      expect(await screen.findByTestId('host-cancel-link')).toBeTruthy();
    });

    it('retains edited Host Mode values on failure and saves them on retry', async () => {
      (hootzasApi.saveHostMode as jest.Mock)
        .mockResolvedValueOnce({ error: { message: 'Offline — try again' } })
        .mockResolvedValueOnce({ data: { hostMode: { id: 'hm-1', intervalMinutes: 90, windowLengthMinutes: 15 } } });
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      await fireEvent.changeText(await screen.findByLabelText('Host Mode interval in minutes'), '90');
      await fireEvent.changeText(screen.getByLabelText('Host Mode window in minutes'), '15');
      await fireEvent.press(screen.getByText('Save Host Mode'));
      expect(screen.getByText('Offline — try again')).toBeOnTheScreen();
      expect(screen.getByLabelText('Host Mode interval in minutes')).toHaveDisplayValue('90');
      expect(screen.getByLabelText('Host Mode window in minutes')).toHaveDisplayValue('15');
      await fireEvent.press(screen.getByText('Save Host Mode'));
      expect(hootzasApi.saveHostMode).toHaveBeenLastCalledWith('hz-1', 90, 15);
      expect(screen.getByText('Host Mode saved.')).toBeOnTheScreen();
    });

    it('does not send invalid Host Mode intervals', async () => {
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      await fireEvent.changeText(await screen.findByLabelText('Host Mode interval in minutes'), '0');
      await fireEvent.press(screen.getByText('Save Host Mode'));
      expect(screen.getByText('Enter positive whole minutes for both fields.')).toBeOnTheScreen();
      expect(hootzasApi.saveHostMode).not.toHaveBeenCalled();
    });

    it.each([0, 137])('displays the server projection %s without inventing a local rate', async projectedPoints => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: mockHootza({
        hostPointsProjection: { completionPoints: projectedPoints, pointsPerCheckin: 0, checkins: 3, projectedPoints },
      }) } });
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      expect(await screen.findByText(String(projectedPoints))).toBeOnTheScreen();
      expect(screen.getByText('projected points')).toBeOnTheScreen();
      expect(screen.getByText(/not yet credited/)).toBeOnTheScreen();
      expect(screen.queryByText('points so far')).not.toBeOnTheScreen();
    });

    it('does not manufacture points when the server has no projection', async () => {
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      expect(await screen.findByText('—')).toBeOnTheScreen();
      expect(screen.getByText(/current points projection is unavailable/)).toBeOnTheScreen();
      expect(screen.queryByText('13')).not.toBeOnTheScreen();
    });

    it('does not present a stale live projection or allow ending an already ended event', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: mockHootza({
        status: 'ended', hostPointsProjection: { completionPoints: 137, pointsPerCheckin: 0, checkins: 3, projectedPoints: 137 },
      }) } });
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      expect(await screen.findByText('—')).toBeOnTheScreen();
      expect(screen.queryByText('137')).not.toBeOnTheScreen();
      expect(screen.getByTestId('host-end-hootza')).toBeDisabled();
      expect(screen.getByText('Ended')).toBeOnTheScreen();
      expect(screen.queryByText('Live now')).not.toBeOnTheScreen();
    });

    it('shows an end failure and stays on screen until a successful retry', async () => {
      (hootzasApi.endHootza as jest.Mock)
        .mockResolvedValueOnce({ error: { message: 'Could not finish — retry' } })
        .mockResolvedValueOnce({ data: { message: 'hootza_ended', pointsAwarded: 137 } });
      await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByTestId('host-end-hootza'));
      expect(screen.getByText('Could not finish — retry')).toBeOnTheScreen();
      expect(mockReplace).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByTestId('host-end-hootza'));
      expect(hootzasApi.endHootza).toHaveBeenCalledTimes(2);
      expect(mockReplace).toHaveBeenCalledWith('/(hootzas)/hz-1');
    });
  });

  describe('Host check-in code display', () => {
    it('uses server-configured pending base and attendee points', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: mockHootza({
        hostPointsProjection: { completionPoints: 137, pointsPerCheckin: 9, checkins: 3, projectedPoints: 164 },
      }) } });
      await render(<ThemeProvider><CheckInCodeScreen /></ThemeProvider>);
      expect(await screen.findByText('ABC123')).toBeOnTheScreen();
      expect(screen.getByRole('image', { name: /Hootza check-in QR code/ })).toBeOnTheScreen();
      expect(screen.getByText('+27')).toBeOnTheScreen();
      expect(screen.getByText("137 for hosting lands when it's over.")).toBeOnTheScreen();
      expect(screen.getByText('projected points')).toBeOnTheScreen();
    });

    it.each(['live', 'ended', 'cancelled'] as const)('does not advertise an unavailable code for a %s event', async status => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: mockHootza({
        status, checkInQrCode: status === 'live' ? null : 'STALECODE',
      }) } });
      await render(<ThemeProvider><CheckInCodeScreen /></ThemeProvider>);
      expect(await screen.findByText('Check-in code unavailable')).toBeOnTheScreen();
      expect(screen.queryByTestId('scannable-code')).not.toBeOnTheScreen();
      expect(screen.queryByText('STALECODE')).not.toBeOnTheScreen();
      expect(screen.getByText(/Only the host of a live Hootza/)).toBeOnTheScreen();
      expect(screen.getByText(/current points projection is unavailable/)).toBeOnTheScreen();
    });

    it('clears a loading error on successful retry', async () => {
      (hootzasApi.getHootza as jest.Mock)
        .mockResolvedValueOnce({ error: { message: 'Connection unavailable' } })
        .mockResolvedValueOnce({ data: { hootza: mockHootza() } });
      await render(<ThemeProvider><CheckInCodeScreen /></ThemeProvider>);
      expect(await screen.findByText('Connection unavailable')).toBeOnTheScreen();
      await fireEvent.press(screen.getByText('Try again'));
      expect(await screen.findByText('ABC123')).toBeOnTheScreen();
      expect(screen.queryByText('Connection unavailable')).not.toBeOnTheScreen();
    });
  });

  describe('Create — what and where', () => {
    it('requires title and venue before next', async () => {
      await render(
        <ThemeProvider>
          <CreateWhatWhereScreen />
        </ThemeProvider>
      );
      await fireEvent.press(await screen.findByTestId('create-next'));
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('allows next without an end time', async () => {
      await render(
        <ThemeProvider>
          <CreateWhatWhereScreen />
        </ThemeProvider>
      );
      fireEvent.changeText(await screen.findByTestId('create-title'), 'Coffee');
      fireEvent.press(await screen.findByTestId('venue-public'));
      fireEvent.changeText(await screen.findByTestId('create-date'), '2026-09-01');
      fireEvent.changeText(await screen.findByTestId('create-start-time'), '19:00');
      fireEvent.changeText(await screen.findByTestId('create-end-time'), '');
      await fireEvent.press(await screen.findByTestId('create-next'));
      expect(mockPush).toHaveBeenCalledWith('/(hootzas)/create/how-it-runs');
    });
  });

  describe('Post error', () => {
    it('offers retry', async () => {
      await render(
        <ThemeProvider>
          <PostErrorScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('post-error')).toBeTruthy();
      await fireEvent.press(await screen.findByTestId('post-error-retry'));
      expect(mockReplace).toHaveBeenCalledWith('/(hootzas)/create/how-it-runs');
    });
  });

  describe('Nothing on', () => {
    beforeEach(() => {
      (feedApi.getFeed as jest.Mock).mockResolvedValue({
        data: { view: 'this_week', count: 2, items: [{ type: 'hootza', id: 'a' }] },
      });
    });

    it('shows week count from feed', async () => {
      await render(
        <ThemeProvider>
          <HootzasEmptyScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('empty-data')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <HootzasEmptyScreen />
        </ThemeProvider>
      );
      await screen.findByTestId('empty-data');
      distanceGuard(container);
    });
  });

  // VERTICAL-BUILD-01: screen-to-API contracts for the Hootza journey.
  describe('Hootza journey', () => {
    const getHootzaMock = () => hootzasApi.getHootza as jest.Mock;

    it('cancels without claiming anyone was notified, recovers from a failure, and returns to the existing page', async () => {
      getHootzaMock().mockResolvedValue({ data: { hootza: mockHootza({ hostUserId: 'user-1' }) } });
      (hootzasApi.cancelHootza as jest.Mock)
        .mockResolvedValueOnce({ error: { code: 'server_error', message: 'An error occurred', status: 500 } })
        .mockResolvedValueOnce({ data: { message: 'hootza_cancelled', rsvpsNotified: 0, rsvpsAwaitingNotification: 8 } });
      await render(<ThemeProvider><CancelConfirmScreen /></ThemeProvider>);

      expect(await screen.findByText(/can't send cancellation notifications yet/)).toBeOnTheScreen();
      expect(screen.queryByText('Cancel it and tell them')).not.toBeOnTheScreen();

      await fireEvent.press(screen.getByText('Cancel the Hootza'));
      expect(await screen.findByText('Could not cancel the Hootza. Please try again.')).toBeOnTheScreen();
      expect(mockDismissTo).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByText('Cancel the Hootza'));
      expect(hootzasApi.cancelHootza).toHaveBeenCalledTimes(2);
      expect(mockDismissTo).toHaveBeenCalledWith('/(hootzas)/hz-1');
    });

    it('shows the real state when the server says the Hootza is no longer live', async () => {
      getHootzaMock()
        .mockResolvedValueOnce({ data: { hootza: mockHootza({ hostUserId: 'user-1' }) } })
        .mockResolvedValueOnce({ data: { hootza: mockHootza({ hostUserId: 'user-1', status: 'ended' }) } });
      (hootzasApi.cancelHootza as jest.Mock).mockResolvedValue({
        error: { code: 'hootza_not_live', message: 'An error occurred', status: 400 },
      });
      await render(<ThemeProvider><CancelConfirmScreen /></ThemeProvider>);
      await fireEvent.press(await screen.findByText('Cancel the Hootza'));
      expect(await screen.findByTestId('cancel-confirm-not-live')).toBeOnTheScreen();
      expect(screen.getByText('This Hootza has already ended or been cancelled.')).toBeOnTheScreen();
      expect(screen.queryByText('Cancel the Hootza')).not.toBeOnTheScreen();
    });

    it('shows only the server pointsAwarded on the ended page after the host ends it', async () => {
      getHootzaMock().mockResolvedValue({ data: { hootza: mockHootza({ hostUserId: 'user-1' }) } });
      (hootzasApi.endHootza as jest.Mock).mockResolvedValue({ data: { message: 'hootza_ended', pointsAwarded: 42 } });
      const controls = await render(<ThemeProvider><HostControlsScreen /></ThemeProvider>);

      await fireEvent.press(await screen.findByTestId('host-end-hootza'));
      expect(hootzasApi.endHootza).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(hootzas)/hz-1');
      await controls.unmount();

      getHootzaMock().mockResolvedValue({ data: { hootza: mockHootza({
        hostUserId: 'user-1', status: 'ended', actualEndTime: '2026-08-20T23:00:00.000Z',
      }) } });
      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      expect(await screen.findByText('Ended. 42 points were awarded for hosting.')).toBeOnTheScreen();
    });

    it('keeps the RSVP choice after a failed request, and remembers a confirmed one on return', async () => {
      getHootzaMock().mockResolvedValue({ data: { hootza: mockHootza() } });
      (hootzasApi.rsvpHootza as jest.Mock)
        .mockResolvedValueOnce({ error: { code: 'NETWORK_ERROR', message: 'Check your connection' } })
        .mockResolvedValueOnce({ data: { rsvp: { status: 'going' } } });
      const page = await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);

      await fireEvent.press(await screen.findByText("I'm going"));
      expect(await screen.findByText('Check your connection')).toBeOnTheScreen();
      expect(screen.getByText("I'm going")).toBeOnTheScreen();

      await fireEvent.press(screen.getByText("I'm going"));
      expect(await screen.findByText("You're going")).toBeOnTheScreen();
      expect(hootzasApi.rsvpHootza).toHaveBeenLastCalledWith('hz-1', 'going');
      await page.unmount();

      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      expect(await screen.findByText("You're going")).toBeOnTheScreen();
    });

    it('starts create with empty date and time, and refuses a wrap time before the start', async () => {
      await render(<ThemeProvider><CreateWhatWhereScreen /></ThemeProvider>);
      expect(await screen.findByTestId('create-date')).toHaveDisplayValue('');
      expect(screen.getByTestId('create-start-time')).toHaveDisplayValue('');

      await fireEvent.changeText(screen.getByTestId('create-title'), 'Coffee');
      await fireEvent.press(screen.getByTestId('venue-public'));
      await fireEvent.changeText(screen.getByTestId('create-date'), '2026-09-01');
      await fireEvent.changeText(screen.getByTestId('create-start-time'), '20:00');
      await fireEvent.changeText(screen.getByTestId('create-end-time'), '19:00');
      await fireEvent.press(screen.getByTestId('create-next'));

      expect(screen.getByText('The wrap time has to be after the start time on the same date.')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('posts only host-entered Host Mode minutes, explains a refused post, and clears the draft on success', async () => {
      updateHootzaCreateDraft({
        title: 'Coffee',
        venueType: 'public_place',
        startTimeIso: '2026-09-01T19:00:00.000Z',
        hostModeEnabled: true,
      });
      (hootzasApi.createHootza as jest.Mock)
        .mockResolvedValueOnce({ error: { code: 'validation_error', message: 'Cannot schedule Hootza that far in advance', status: 400 } })
        .mockResolvedValueOnce({ data: { hootza: { id: 'hz-new' } } });
      await render(<ThemeProvider><CreateHowItRunsScreen /></ThemeProvider>);

      await fireEvent.press(await screen.findByText('Post it'));
      expect(screen.getByText('Enter positive whole minutes for both, or turn Host Mode windows off.')).toBeOnTheScreen();
      expect(hootzasApi.createHootza).not.toHaveBeenCalled();

      await fireEvent.changeText(screen.getByTestId('host-mode-interval'), '30');
      await fireEvent.changeText(screen.getByTestId('host-mode-window'), '5');
      await fireEvent.press(screen.getByText('Post it'));
      expect(await screen.findByText('That didn’t post: Cannot schedule Hootza that far in advance')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByText('Post it'));
      expect(hootzasApi.createHootza).toHaveBeenLastCalledWith(expect.objectContaining({
        startTime: '2026-09-01T19:00:00.000Z',
        hostMode: { intervalMinutes: 30, windowLengthMinutes: 5 },
      }));
      expect(mockReplace).toHaveBeenCalledWith('/(hootzas)/hz-new');
      expect(getHootzaCreateDraft().title).toBe('');
    });
  });
});
