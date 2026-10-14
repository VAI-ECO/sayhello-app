/**
 * LANE 06: organization Hootza controls on the Hootza screens — comment removal for managers, the organization link,
 * and "post again" staying an organization event.
 */

import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HootzaPageScreen from '../../../app/(hootzas)/[id]/index';
import CommentsScreen from '../../../app/(hootzas)/[id]/comments';
import * as hootzasApi from '../../../src/api/hootzas';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('../../../src/api/hootzas');
jest.mock('../../../src/api/client', () => ({
  api: { user: { getProfile: jest.fn().mockResolvedValue({ data: { id: 'lead-2' } }) } },
}));
// The confirmation is a platform dialog; the test confirms it by pressing its destructive button.
jest.mock('../../../src/lib/dialog', () => ({
  showDialog: jest.fn((_title: string, _message: string, buttons: { style?: string; onPress?: () => void }[]) => {
    buttons.find((b) => b.style === 'destructive')?.onPress?.();
  }),
}));

const orgHootza = (overrides: Partial<hootzasApi.Hootza> = {}): hootzasApi.Hootza => ({
  id: 'hz-1', hostUserId: 'lead-1', title: 'Long run', description: null, venueType: 'public_place',
  locationName: 'Park', locationLat: null, locationLng: null,
  startTime: '2026-08-20T19:00:00.000Z', scheduledEndTime: '2026-08-20T22:00:00.000Z', actualEndTime: null,
  coverChargeAmount: null, coverChargeDescription: null, status: 'live', cancellationReason: null, cancelledAt: null,
  checkInQrCode: null, createdAt: '2026-08-17T12:00:00.000Z',
  organization: { id: 'org-9', name: 'Park Runners' }, canManage: true, awardGoesToYou: false,
  ...overrides,
});

describe('organization Hootza controls', () => {
  let push: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn(), replace: jest.fn() });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1' });
  });

  describe('comments', () => {
    const comment = { id: 'c-1', hootzaId: 'hz-1', userId: 'u-5', content: 'Hello there', createdAt: '2026-08-18T10:00:00.000Z', user: { id: 'u-5', fullName: 'Sam' } };

    it('shows Remove to a manager and removes after confirming, then reloads the list', async () => {
      (hootzasApi.getHootzaComments as jest.Mock).mockResolvedValue({ data: { comments: [comment], canManage: true } });
      (hootzasApi.removeHootzaComment as jest.Mock).mockResolvedValue({ data: { removed: true } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CommentsScreen /></ThemeProvider>);
      await user.press(await screen.findByTestId('comment-remove-c-1'));
      expect(hootzasApi.removeHootzaComment).toHaveBeenCalledWith('hz-1', 'c-1');
      // Initial load plus the reload after a successful removal.
      await screen.findByText('Hello there');
      expect(hootzasApi.getHootzaComments).toHaveBeenCalledTimes(2);
    });

    it('does not offer Remove to anyone else', async () => {
      (hootzasApi.getHootzaComments as jest.Mock).mockResolvedValue({ data: { comments: [comment], canManage: false } });
      await render(<ThemeProvider><CommentsScreen /></ThemeProvider>);
      await screen.findByText('Hello there');
      expect(screen.queryByTestId('comment-remove-c-1')).not.toBeOnTheScreen();
    });

    it('says so when the removal fails, and keeps the comment', async () => {
      (hootzasApi.getHootzaComments as jest.Mock).mockResolvedValue({ data: { comments: [comment], canManage: true } });
      (hootzasApi.removeHootzaComment as jest.Mock).mockResolvedValue({ error: { code: 'server_error', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CommentsScreen /></ThemeProvider>);
      await user.press(await screen.findByTestId('comment-remove-c-1'));
      expect(await screen.findByTestId('comment-remove-error')).toBeOnTheScreen();
      expect(screen.getByText('Hello there')).toBeOnTheScreen();
    });
  });

  describe('Hootza page', () => {
    it('links the organization name to the group page', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: orgHootza() } });
      const user = userEvent.setup();
      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      await user.press(await screen.findByTestId('hootza-org-link'));
      expect(push).toHaveBeenCalledWith({ pathname: '/(organization)/org/[id]', params: { id: 'org-9' } });
    });

    it('an organization Hootza carries the note that the group earns nothing and Waverly never nudges for it; a personal one does not', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: orgHootza() } });
      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      expect(await screen.findByTestId('hootza-org-note')).toHaveTextContent(/Waverly never nudges on behalf of a group/);
    });

    it('a personal Hootza has no organization note and no organization link', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: orgHootza({ organization: null, host: { id: 'lead-1', fullName: 'Alex' } }) } });
      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      await screen.findByTestId('hootza-title');
      expect(screen.queryByTestId('hootza-org-note')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('hootza-org-link')).not.toBeOnTheScreen();
    });

    it('post again on an ended organization Hootza opens the organization compose screen, not the personal one', async () => {
      (hootzasApi.getHootza as jest.Mock).mockResolvedValue({ data: { hootza: orgHootza({ status: 'ended', actualEndTime: '2026-08-20T23:00:00.000Z' }) } });
      (hootzasApi.postHootzaAgain as jest.Mock).mockResolvedValue({ data: { template: { title: 'Long run', description: null, venueType: 'public_place', locationName: 'Park', locationLat: null, locationLng: null, coverChargeAmount: null, coverChargeDescription: null, organizationId: 'org-9' } } });
      const user = userEvent.setup();
      await render(<ThemeProvider><HootzaPageScreen /></ThemeProvider>);
      await user.press(await screen.findByTestId('hootza-post-again'));
      expect(push).toHaveBeenCalledWith({ pathname: '/(organization)/org/[id]/new-event', params: { id: 'org-9', fromHootzaId: 'hz-1' } });
      expect(push).not.toHaveBeenCalledWith('/(hootzas)/create');
    });
  });
});
