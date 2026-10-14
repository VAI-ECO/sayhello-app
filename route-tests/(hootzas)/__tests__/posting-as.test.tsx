/**
 * LANE 06: "Posting as" on the Hootza create flow (CANON-RL-01-SN-75) — the chooser appears only for a user who leads an
 * active group, states the split and the group's own free-post figure, and step 2 posts through the group's event route.
 */

import React from 'react';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import CreateWhatWhereScreen from '../../../app/(hootzas)/create/index';
import CreateHowItRunsScreen from '../../../app/(hootzas)/create/how-it-runs';
import * as hootzasApi from '../../../src/api/hootzas';
import * as orgApi from '../../../src/api/organizations';
import { getHootzaCreateDraft, resetHootzaCreateDraft, updateHootzaCreateDraft } from '../../../src/state/hootza-create-draft';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));
jest.mock('../../../src/api/hootzas');
jest.mock('../../../src/api/organizations');

const GROUP = { id: 'org-9', name: 'Park Runners', kind: 'running_club', status: 'active', leadRole: 'lead' };
const dashboard = (remaining: number) => ({
  data: { organization: { status: 'active' }, quota: { monthYear: '2026-10', freePosts: 4, used: 4 - remaining, remaining } },
});

describe('posting as', () => {
  let replace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetHootzaCreateDraft();
    replace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('shows nothing when the user has no active group', async () => {
    (orgApi.getMyOrganizations as jest.Mock).mockResolvedValue({ data: { organizations: [{ ...GROUP, status: 'closed' }] } });
    await render(<ThemeProvider><CreateWhatWhereScreen /></ThemeProvider>);
    await screen.findByTestId('create-title');
    expect(screen.queryByTestId('posting-as')).not.toBeOnTheScreen();
  });

  it('shows nothing, and the form still works, when the lookup fails', async () => {
    (orgApi.getMyOrganizations as jest.Mock).mockRejectedValue(new Error('offline'));
    await render(<ThemeProvider><CreateWhatWhereScreen /></ThemeProvider>);
    await screen.findByTestId('create-title');
    expect(screen.queryByTestId('posting-as')).not.toBeOnTheScreen();
  });

  it('choosing the group states the split and the group’s own free-post figure from the server', async () => {
    (orgApi.getMyOrganizations as jest.Mock).mockResolvedValue({ data: { organizations: [GROUP] } });
    (orgApi.getOrgDashboard as jest.Mock).mockResolvedValue(dashboard(3));
    const user = userEvent.setup();
    await render(<ThemeProvider><CreateWhatWhereScreen /></ThemeProvider>);
    await user.press(await screen.findByTestId('posting-as-org-9'));
    expect(await screen.findByTestId('posting-as-split')).toBeOnTheScreen();
    expect(await screen.findByText(/4 free posts a month for the group.*3 left this month/)).toBeOnTheScreen();
    expect(getHootzaCreateDraft()).toMatchObject({ postingAsOrganizationId: 'org-9', postingAsFreePostsLeft: 3, postToFeed: true });
    // Back to yourself clears the group.
    await user.press(screen.getByTestId('posting-as-me'));
    expect(getHootzaCreateDraft()).toMatchObject({ postingAsOrganizationId: null, postingAsFreePostsLeft: null, postToFeed: false });
  });

  it('says plainly when the group has no free posts left, and keeps the event off the feed', async () => {
    (orgApi.getMyOrganizations as jest.Mock).mockResolvedValue({ data: { organizations: [GROUP] } });
    (orgApi.getOrgDashboard as jest.Mock).mockResolvedValue(dashboard(0));
    const user = userEvent.setup();
    await render(<ThemeProvider><CreateWhatWhereScreen /></ThemeProvider>);
    await user.press(await screen.findByTestId('posting-as-org-9'));
    expect(await screen.findByText(/used this month/)).toBeOnTheScreen();
    expect(getHootzaCreateDraft().postToFeed).toBe(false);
  });

  describe('step 2', () => {
    const complete = { title: 'Long run', venueType: 'public_place' as const, startTimeIso: '2026-10-09T12:00:00.000Z' };

    it('posts through the group event route with the feed choice, not the personal route', async () => {
      updateHootzaCreateDraft({ ...complete, postingAsOrganizationId: 'org-9', postingAsFreePostsLeft: 3, postToFeed: true });
      (orgApi.createOrgEvent as jest.Mock).mockResolvedValue({ data: { hootza: { id: 'hz-7' }, quota: {} } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CreateHowItRunsScreen /></ThemeProvider>);
      await user.press(screen.getByTestId('create-post-it'));
      expect(orgApi.createOrgEvent).toHaveBeenCalledWith('org-9', expect.objectContaining({ title: 'Long run', venueType: 'public_place', postToFeed: true }));
      expect(hootzasApi.createHootza).not.toHaveBeenCalled();
      expect(replace).toHaveBeenCalledWith('/(hootzas)/hz-7');
    });

    it('the lead can keep it off the feed', async () => {
      updateHootzaCreateDraft({ ...complete, postingAsOrganizationId: 'org-9', postingAsFreePostsLeft: 3, postToFeed: true });
      (orgApi.createOrgEvent as jest.Mock).mockResolvedValue({ data: { hootza: { id: 'hz-8' }, quota: {} } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CreateHowItRunsScreen /></ThemeProvider>);
      await fireEvent(screen.getByTestId('post-as-group-feed'), 'valueChange', false);
      await user.press(screen.getByTestId('create-post-it'));
      expect(orgApi.createOrgEvent).toHaveBeenCalledWith('org-9', expect.objectContaining({ postToFeed: false }));
    });

    it('a refusal because the group closed stays on the screen with a plain message', async () => {
      updateHootzaCreateDraft({ ...complete, postingAsOrganizationId: 'org-9', postingAsFreePostsLeft: 0, postToFeed: false });
      (orgApi.createOrgEvent as jest.Mock).mockResolvedValue({ error: { code: 'organization_closed', status: 409 } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CreateHowItRunsScreen /></ThemeProvider>);
      await user.press(screen.getByTestId('create-post-it'));
      expect(await screen.findByText(/group is closed/)).toBeOnTheScreen();
      expect(replace).not.toHaveBeenCalled();
    });

    it('posting as yourself is unchanged: the personal route, no group feed switch', async () => {
      updateHootzaCreateDraft(complete);
      (hootzasApi.createHootza as jest.Mock).mockResolvedValue({ data: { hootza: { id: 'hz-1' } } });
      const user = userEvent.setup();
      await render(<ThemeProvider><CreateHowItRunsScreen /></ThemeProvider>);
      expect(screen.queryByTestId('post-as-group-feed')).not.toBeOnTheScreen();
      await user.press(screen.getByTestId('create-post-it'));
      expect(hootzasApi.createHootza).toHaveBeenCalled();
      expect(orgApi.createOrgEvent).not.toHaveBeenCalled();
    });
  });
});
