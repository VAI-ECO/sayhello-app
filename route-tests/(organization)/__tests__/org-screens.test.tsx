/**
 * LANE 06: organization screens — the page (Share, Follow), the event list's closed-group state, and the leads
 * screen's plain error messages. Route-level, API mocked.
 */

import React from 'react';
import { Share } from 'react-native';
import { render, screen, userEvent, fireEvent } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import OrganizationPage from '../../../app/(organization)/org/[id]/index';
import OrganizationEvents from '../../../app/(organization)/org/[id]/events';
import OrganizationLeads from '../../../app/(organization)/org/[id]/leads';
import OrgSignupCode from '../../../app/(organization)/new/code';
import OrganizationNewEvent from '../../../app/(organization)/org/[id]/new-event';
import { patchOrgDraft, resetOrgDraft } from '../../../src/state/organization-draft';
import * as orgApi from '../../../src/api/organizations';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const R = require('react');
    R.useEffect(() => { cb(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  },
}));
jest.mock('../../../src/api/organizations');

const ID = '11111111-1111-4111-8111-111111111111';
const page = (over: Partial<orgApi.OrgPage['organization']> = {}, viewer: Partial<orgApi.OrgPage['viewer']> = {}): { data: orgApi.OrgPage } => ({
  data: {
    organization: { id: ID, name: 'Park Runners', kind: 'running_club', status: 'active', venueType: 'private_residence', meetingPlace: null, meetingPlaceWithheld: true, code: null, ...over },
    followerCount: 214, isFollowing: false,
    viewer: { canManage: false, canManageLeads: false, isSuperAdmin: false, ...viewer },
    events: [],
  },
});

describe('organization screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn() });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: ID });
  });

  describe('page', () => {
    it('Share sends the group name and page link, never the withheld meeting place', async () => {
      (orgApi.getOrganization as jest.Mock).mockResolvedValue(page());
      const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as never);
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationPage /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-share'));
      expect(share).toHaveBeenCalledTimes(1);
      const message = (share.mock.calls[0][0] as { message: string }).message;
      expect(message).toBe(`Park Runners on Say Hello: https://sayhello.world/org/${ID}`);
      share.mockRestore();
    });

    it('a closed group offers neither Share nor Follow', async () => {
      (orgApi.getOrganization as jest.Mock).mockResolvedValue(page({ status: 'closed' }));
      await render(<ThemeProvider><OrganizationPage /></ThemeProvider>);
      await screen.findByTestId('org-follower-count');
      expect(screen.queryByTestId('org-share')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('org-follow')).not.toBeOnTheScreen();
    });

    it('Follow calls the follow route and reloads', async () => {
      (orgApi.getOrganization as jest.Mock).mockResolvedValue(page());
      (orgApi.followOrganization as jest.Mock).mockResolvedValue({ data: { isFollowing: true, followerCount: 215 } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationPage /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-follow'));
      expect(orgApi.followOrganization).toHaveBeenCalledWith(ID);
      expect(orgApi.getOrganization).toHaveBeenCalledTimes(2);
    });

    it('lists finished Hootzas with how many came', async () => {
      const p = page({ venueType: 'public_place', meetingPlace: 'Park', meetingPlaceWithheld: false });
      p.data.pastEvents = [{ id: 'done1', title: 'Track night', startTime: '2026-08-14T18:00:00.000Z', scheduledEndTime: null, endedAt: '2026-08-14T20:00:00.000Z', venueType: 'public_place', checkedInCount: 31 }];
      (orgApi.getOrganization as jest.Mock).mockResolvedValue(p);
      await render(<ThemeProvider><OrganizationPage /></ThemeProvider>);
      expect(await screen.findByText('Finished')).toBeOnTheScreen();
      expect(screen.getByTestId('org-past-done1')).toHaveTextContent(/Track night/);
      expect(screen.getByTestId('org-past-done1')).toHaveTextContent(/31 came/);
    });

    it('an unknown group shows the not-found message with a retry', async () => {
      (orgApi.getOrganization as jest.Mock).mockResolvedValue({ error: { code: 'organization_not_found', message: 'x' } });
      await render(<ThemeProvider><OrganizationPage /></ThemeProvider>);
      expect(await screen.findByText('This page is not here.')).toBeOnTheScreen();
    });
  });

  describe('events (leads)', () => {
    const ev = { id: 'e1', title: 'Hill session', startTime: '2026-10-09T11:00:00.000Z', scheduledEndTime: null, venueType: 'public_place', coverChargeAmount: null, coverChargeDescription: null, goingCount: 2, status: 'live', postedToFeed: false, checkInCount: 0, adultsOnly: false, chatEnabled: false };

    it('an active group offers Post a Hootza, the feed button and the toggles', async () => {
      (orgApi.getOrgEvents as jest.Mock).mockResolvedValue({ data: { events: [ev], canManage: true, organizationStatus: 'active' } });
      await render(<ThemeProvider><OrganizationEvents /></ThemeProvider>);
      expect(await screen.findByTestId('org-events-new')).toBeOnTheScreen();
      expect(screen.getByTestId('org-ev-feed-e1')).toBeOnTheScreen();
      expect(screen.getByTestId('org-ev-chat-e1')).toBeOnTheScreen();
    });

    it('a closed group says so and offers no controls that the server would refuse', async () => {
      (orgApi.getOrgEvents as jest.Mock).mockResolvedValue({ data: { events: [ev], canManage: true, organizationStatus: 'closed' } });
      await render(<ThemeProvider><OrganizationEvents /></ThemeProvider>);
      expect(await screen.findByTestId('org-events-closed')).toBeOnTheScreen();
      expect(screen.queryByTestId('org-events-new')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('org-ev-feed-e1')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('org-ev-chat-e1')).not.toBeOnTheScreen();
    });

    it('a finished Hootza offers Post again, which opens the compose screen with that Hootza as the source', async () => {
      const push = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn(), replace: jest.fn() });
      (orgApi.getOrgEvents as jest.Mock).mockResolvedValue({ data: { events: [{ ...ev, id: 'done1', status: 'ended' }], canManage: true, organizationStatus: 'active' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationEvents /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-ev-again-done1'));
      expect(push).toHaveBeenCalledWith({ pathname: '/(organization)/org/[id]/new-event', params: { id: ID, fromHootzaId: 'done1' } });
      expect(screen.queryByTestId('org-ev-feed-done1')).not.toBeOnTheScreen();
    });

    it('an empty list says there are no Hootzas yet', async () => {
      (orgApi.getOrgEvents as jest.Mock).mockResolvedValue({ data: { events: [], canManage: true, organizationStatus: 'active' } });
      await render(<ThemeProvider><OrganizationEvents /></ThemeProvider>);
      expect(await screen.findByTestId('org-events-empty')).toBeOnTheScreen();
    });

    it('running out of free posts while putting one on the feed shows the plain stop', async () => {
      (orgApi.getOrgEvents as jest.Mock).mockResolvedValue({ data: { events: [ev], canManage: true, organizationStatus: 'active' } });
      (orgApi.postOrgEventToFeed as jest.Mock).mockResolvedValue({ error: { code: 'out_of_free_posts', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationEvents /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-ev-feed-e1'));
      expect(await screen.findByTestId('org-events-error')).toHaveTextContent(/free posts are used/);
    });
  });

  describe('compose — where', () => {
    const dash = (venueType: 'public_place' | 'private_residence') => ({
      data: {
        organization: { id: ID, name: 'Park Runners', kind: 'running_club', status: 'active', code: 'PR', venueType, meetingPlace: '12 Home St' },
        followerCount: 3, checkInCount: 0, events: { live: 0, total: 0 }, leadCount: 1,
        quota: { monthYear: '2026-10', freePosts: 4, used: 0, remaining: 4 }, viewer: { canManageLeads: true, isSuperAdmin: false },
      },
    });
    const fill = async () => {
      await fireEvent.changeText(screen.getByTestId('org-event-title'), 'Long run');
      await fireEvent.changeText(screen.getByTestId('org-event-date'), '2026-10-09');
      await fireEvent.changeText(screen.getByTestId('org-event-start'), '19:00');
    };

    it('a public event of a private-residence group says it needs its own place, and sends the place the lead names', async () => {
      (orgApi.getOrgDashboard as jest.Mock).mockResolvedValue(dash('private_residence'));
      (orgApi.createOrgEvent as jest.Mock).mockResolvedValue({ data: { hootza: { id: 'hz-1' }, quota: {} } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationNewEvent /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-event-venue-public'));
      expect(screen.getByTestId('org-event-needs-place')).toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('org-event-location-name'), 'Town Hall');
      expect(screen.queryByTestId('org-event-needs-place')).not.toBeOnTheScreen();
      await fill();
      await user.press(screen.getByTestId('org-event-post'));
      expect(orgApi.createOrgEvent).toHaveBeenCalledWith(ID, expect.objectContaining({ venueType: 'public_place', locationName: 'Town Hall' }));
    });

    it('an untouched compose starts as the group’s own venue and sends no place, so the server default applies', async () => {
      (orgApi.getOrgDashboard as jest.Mock).mockResolvedValue(dash('public_place'));
      (orgApi.createOrgEvent as jest.Mock).mockResolvedValue({ data: { hootza: { id: 'hz-2' }, quota: {} } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationNewEvent /></ThemeProvider>);
      await screen.findByTestId('org-event-venue-public');
      expect(screen.queryByTestId('org-event-needs-place')).not.toBeOnTheScreen();
      await fill();
      await user.press(screen.getByTestId('org-event-post'));
      const sent = (orgApi.createOrgEvent as jest.Mock).mock.calls[0][1];
      expect(sent).toMatchObject({ venueType: 'public_place' });
      expect(sent.locationName).toBeUndefined();
    });
  });

  describe('signup step 3 — the code', () => {
    beforeEach(() => {
      resetOrgDraft();
      patchOrgDraft({ name: 'Park Runners', kind: 'running_club', meetingPlace: 'Park', venueType: 'public_place' });
    });

    it('a taken code offers the nearest free variant, and taking it fills the field', async () => {
      (orgApi.checkOrgCode as jest.Mock).mockResolvedValue({ data: { available: false, reason: 'taken_organization', suggestion: 'Bell2' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrgSignupCode /></ThemeProvider>);
      await fireEvent.changeText(screen.getByTestId('org-code'), 'Bell');
      await user.press(screen.getByTestId('org-code-take'));
      expect(await screen.findByTestId('org-code-error')).toHaveTextContent('Somebody already has that code.');
      await user.press(await screen.findByTestId('org-code-suggestion'));
      expect(screen.getByTestId('org-code').props.value).toBe('Bell2');
      expect(screen.queryByTestId('org-code-suggestion')).not.toBeOnTheScreen();
      expect(orgApi.createOrganization).not.toHaveBeenCalled();
    });

    it('says plainly when the account is at the group limit, and keeps the answers', async () => {
      (orgApi.checkOrgCode as jest.Mock).mockResolvedValue({ data: { available: true } });
      (orgApi.createOrganization as jest.Mock).mockResolvedValue({ error: { code: 'too_many_groups', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrgSignupCode /></ThemeProvider>);
      await fireEvent.changeText(screen.getByTestId('org-code'), 'Bell');
      await user.press(screen.getByTestId('org-code-take'));
      expect(await screen.findByTestId('org-code-error')).toHaveTextContent(/as many groups as are allowed/);
      expect(screen.getByTestId('org-code').props.value).toBe('Bell');
    });

    it('a blocked word is refused with no suggestion', async () => {
      (orgApi.checkOrgCode as jest.Mock).mockResolvedValue({ data: { available: false, reason: 'reserved_profanity' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrgSignupCode /></ThemeProvider>);
      await fireEvent.changeText(screen.getByTestId('org-code'), 'Darn');
      await user.press(screen.getByTestId('org-code-take'));
      expect(await screen.findByTestId('org-code-error')).toHaveTextContent('That code is not available.');
      expect(screen.queryByTestId('org-code-suggestion')).not.toBeOnTheScreen();
    });
  });

  describe('leads', () => {
    const leads = { data: { leads: [{ userId: 'u1', name: 'Nadia', leadRole: 'lead', addedAt: '2026-01-01T00:00:00.000Z', isYou: true }], viewer: { canManageLeads: true } } };

    it('says plainly when the phone number is not a phone number', async () => {
      (orgApi.getOrgLeads as jest.Mock).mockResolvedValue(leads);
      (orgApi.addOrgLead as jest.Mock).mockResolvedValue({ error: { code: 'invalid_phone', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationLeads /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-lead-add'));
      await fireEvent.changeText(screen.getByTestId('org-lead-phone'), '12345');
      await user.press(screen.getByTestId('org-lead-submit'));
      expect(await screen.findByTestId('org-lead-error')).toHaveTextContent(/country code/);
    });

    it('says plainly when the lookup limit has been reached', async () => {
      (orgApi.getOrgLeads as jest.Mock).mockResolvedValue(leads);
      (orgApi.addOrgLead as jest.Mock).mockResolvedValue({ error: { code: 'rate_limit_exceeded', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationLeads /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-lead-add'));
      await fireEvent.changeText(screen.getByTestId('org-lead-phone'), '+15551234567');
      await user.press(screen.getByTestId('org-lead-submit'));
      expect(await screen.findByTestId('org-lead-error')).toHaveTextContent(/lot of lookups/);
    });

    it('says plainly when there is no account for the number', async () => {
      (orgApi.getOrgLeads as jest.Mock).mockResolvedValue(leads);
      (orgApi.addOrgLead as jest.Mock).mockResolvedValue({ error: { code: 'no_account_for_that_number', message: 'x' } });
      const user = userEvent.setup();
      await render(<ThemeProvider><OrganizationLeads /></ThemeProvider>);
      await user.press(await screen.findByTestId('org-lead-add'));
      await fireEvent.changeText(screen.getByTestId('org-lead-phone'), '+15551234567');
      await user.press(screen.getByTestId('org-lead-submit'));
      expect(await screen.findByTestId('org-lead-error')).toHaveTextContent(/no Say Hello account/i);
    });
  });
});
