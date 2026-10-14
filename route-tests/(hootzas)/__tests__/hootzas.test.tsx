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
import { resetHootzaCreateDraft } from '../../../src/state/hootza-create-draft';

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

  beforeEach(() => {
    jest.clearAllMocks();
    resetHootzaCreateDraft();
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
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

    it('shows read-only backend note', async () => {
      await render(
        <ThemeProvider>
          <EditHootzaScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('edit-readonly-note')).toBeTruthy();
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
});
