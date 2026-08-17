/**
 * HOOTZA SCREENS TESTS
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HootzaPageScreen from '../[id]/index';
import EndVsCancelScreen from '../[id]/end-vs-cancel';
import CancelConfirmScreen from '../[id]/cancel-confirm';
import EditHootzaScreen from '../[id]/edit';
import CommentsScreen from '../[id]/comments';
import HostControlsScreen from '../[id]/host-controls';
import CreateWhatWhereScreen from '../create/index';
import PostErrorScreen from '../create/post-error';
import HootzasEmptyScreen from '../empty';
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
