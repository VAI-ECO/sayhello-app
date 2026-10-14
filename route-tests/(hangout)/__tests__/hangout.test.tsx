/**
 * HELLO HANGOUT (BUSINESS) SCREENS
 *
 * VERTICAL-BUILD-06 replacements (for coordinator review) — the old assertions
 * pinned placeholder screens that had no backend; each is replaced by a stronger
 * check of the real behaviour, and every check that still applies is kept:
 *  - Dashboard "shows status" asserted the raw status word and a push to
 *    /(hootzas)/discount/compose. The dashboard now reads GET /hello-hangouts/:id/manage;
 *    the test asserts the real content (name, "Yes, it's working.", free posts,
 *    renewal, no-customer-list notice) and that "Post something" opens the H10
 *    composer for that Hello Hangout. "Shows unavailable when none" is kept.
 *  - Create post "redirects to discount compose" → the composer is now this route;
 *    tests assert both clocks are enforced and what is sent.
 *  - Directory "shows empty/unavailable" (testID directory-empty) is kept for the
 *    real empty state (no Hello Hangouts, no search) and joined by list/search/filter/
 *    error tests.
 *  - Listing "shows unavailable" (testID listing-unavailable) is kept for a dark /
 *    unknown page (404) and joined by the real page.
 *  - Redeem tests are unchanged (the redemption backend is still not built).
 */

import React from 'react';
import * as ReactNative from 'react-native';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HangoutSignupScreen from '../../../app/(hangout)/signup';
import HangoutDashboardScreen from '../../../app/(hangout)/dashboard';
import HangoutCreatePostScreen from '../../../app/(hangout)/create-post';
import HangoutDirectoryScreen from '../../../app/(hangout)/directory/index';
import HangoutListingScreen from '../../../app/(hangout)/directory/[id]';
import HelloWallScreen from '../../../app/(hangout)/directory/wall';
import EditDirectoryScreen from '../../../app/(hangout)/edit';
import HoursScreen from '../../../app/(hangout)/hours';
import PreviewScreen from '../../../app/(hangout)/preview';
import ManagePostsScreen from '../../../app/(hangout)/posts';
import DealRedemptionScreen from '../../../app/(hangout)/redeem';
import * as hangoutsApi from '../../../src/api/hangouts';
import * as directoryApi from '../../../src/api/directory';
import * as bizApi from '../../../src/api/hangout-business';
import * as feedApi from '../../../src/api/feed';
import * as Location from 'expo-location';
import type { HangoutPage, ManageData } from '../../../src/api/directory';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => { cb(); }, [cb]);
  },
  Redirect: jest.fn(() => null),
}));

// The width every screen's layout reads (phone by default; the desktop portal test sets 1440).
let mockWindowWidth = 375;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWindowWidth, height: 900, scale: 1, fontScale: 1 }),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../../../src/api/hangouts', () => ({
  createHelloHangout: jest.fn(),
  listMyHelloHangouts: jest.fn(),
}));

jest.mock('../../../src/api/directory', () => ({
  ...jest.requireActual('../../../src/api/directory'),
  listDirectory: jest.fn(),
  getDirectoryPage: jest.fn(),
  getDirectoryWall: jest.fn(),
  getManage: jest.fn(),
  getDirectoryDraft: jest.fn(),
  saveDirectoryDraft: jest.fn(),
  publishDirectory: jest.fn(),
  previewDirectory: jest.fn(),
}));

jest.mock('../../../src/api/hangout-business', () => ({
  ...jest.requireActual('../../../src/api/hangout-business'),
  redeemDeal: jest.fn(),
  getRedemptions: jest.fn(),
}));

jest.mock('../../../src/api/feed', () => ({
  createFeedPost: jest.fn(),
  getManagedPosts: jest.fn(),
  updateFeedPost: jest.fn(),
  deleteFeedPost: jest.fn(),
}));

const hangouts = hangoutsApi as jest.Mocked<typeof hangoutsApi>;
const dir = directoryApi as jest.Mocked<typeof directoryApi>;
const biz = bizApi as jest.Mocked<typeof bizApi>;
const feed = feedApi as jest.Mocked<typeof feedApi>;
const location = Location as jest.Mocked<typeof Location>;

function distanceGuard() {
  expect(screen.queryByText(/\d+\s*(miles?|mi|km|meters?|feet|ft)\b/i)).toBeNull();
  expect(screen.queryByText(/\d+\s*away/i)).toBeNull();
}

const wrap = (el: React.ReactElement) => render(<ThemeProvider>{el}</ThemeProvider>);

const manage = (overrides: Partial<ManageData['helloHangout']> = {}, extra: Partial<ManageData> = {}): ManageData => ({
  helloHangout: {
    id: 'hh-1', name: 'Ridge Tavern', address: '1411 Ridge Ave', status: 'active', tier: 'founding', founding: true,
    priceCents: 19900, paidAt: '2026-03-01T00:00:00.000Z', renewsAt: '2027-03-01T00:00:00.000Z', pinSet: true, ...overrides,
  },
  ambassador: { displayName: 'Marisol Reyes' },
  slots: { monthYear: '2026-09', freeSlots: 3, slotsUsed: 1, remaining: 2, additionalPostCents: 1000 },
  directory: { available: true, published: true, publishedAt: '2026-09-01T00:00:00.000Z', updatedAt: null, unpublishedChanges: false },
  wall: { hellos: 5, selfies: 2, thisMonth: 4, lastMonth: 1, tiles: [{ helloId: 'x1', selfieUrl: null, names: ['Ana', 'Marcus'], colors: ['#8E24AA', '#00893F'] }] },
  onNow: [{ id: 'p1', postType: 'special', title: '2 for 1 pints', dealEndDate: null, effectiveExpiryDate: '2026-10-01T00:00:00.000Z' }],
  ...extra,
});

const page = (overrides: Partial<HangoutPage> = {}): HangoutPage => ({
  id: 'hh-1', name: 'Ridge Tavern', address: '1411 Ridge Ave', lat: 47.6, lng: -122.3, founding: true,
  memberSince: '2026-03-01T00:00:00.000Z', directoryAvailable: true, published: true, preview: false,
  description: 'Neighborhood bar.', phone: '(303) 555-0148', website: 'https://ridge.example',
  amenities: ['Wheelchair accessible'], hours: { mon: { closed: false, open: '16:00', close: '02:00' }, sun: { closed: true } },
  todayDiscount: 'Happy hour 5–9', posts: [], hellos: 3, selfies: 1,
  wall: [{ helloId: 'x1', selfieUrl: null, names: ['Ana', 'Marcus'], colors: [] }],
  ...overrides,
});

describe('Hello Hangout Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack, replace: mockReplace });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    mockWindowWidth = 375;
  });

  describe('H8 Signup — one price + coupons', () => {
    it('shows one list price and coupon CTAs', async () => {
      hangouts.createHelloHangout.mockResolvedValue({ data: {} } as never);
      await wrap(<HangoutSignupScreen />);
      expect(screen.getByTestId('choose-founding')).toBeTruthy();
      expect(screen.getByTestId('choose-regular')).toBeTruthy();
      expect(screen.getByTestId('choose-deferred')).toBeTruthy();
      expect(screen.getByText('One price. Coupons carry every discount.')).toBeTruthy();
      expect(screen.getByTestId('hangout-name')).toBeTruthy();
      expect(screen.getByTestId('hangout-address')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      await wrap(<HangoutSignupScreen />);
      distanceGuard();
    });

    it('leads to the owner dashboard after signing up', async () => {
      hangouts.createHelloHangout.mockResolvedValue({ data: { helloHangout: { id: 'hh-9' }, pricing: { listPriceCents: 34900, couponOffCents: 0, priceCents: 34900 } } } as never);
      await wrap(<HangoutSignupScreen />);
      await fireEvent.changeText(screen.getByTestId('hangout-name'), 'Rainier Coffee');
      await fireEvent.changeText(screen.getByTestId('hangout-address'), '88 Pine St');
      // The pin is a real device location, never 0,0.
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 47.61, longitude: -122.33 } });
      await fireEvent.press(screen.getByTestId('hangout-pin-here'));
      await fireEvent.press(screen.getByTestId('choose-regular'));
      await waitFor(() => expect(hangouts.createHelloHangout).toHaveBeenCalledWith(expect.objectContaining({ lat: 47.61, lng: -122.33 })));
      await fireEvent.press(await screen.findByTestId('hangout-created'));
      expect(mockReplace).toHaveBeenCalledWith('/(hangout)/dashboard');
    });
  });

  describe('H9 Business dashboard', () => {
    it('shows the real dashboard from GET /hello-hangouts/:id/manage and opens the composer for that Hello Hangout', async () => {
      hangouts.listMyHelloHangouts.mockResolvedValue({ data: { helloHangouts: [{ id: 'hh-1', name: 'Ridge Tavern', status: 'active', tier: 'founding', price_cents: 19900 }] } } as never);
      dir.getManage.mockResolvedValue({ data: manage() } as never);
      await wrap(<HangoutDashboardScreen />);
      await waitFor(() => expect(screen.getByTestId('dashboard-status')).toBeTruthy());
      expect(dir.getManage).toHaveBeenCalledWith('hh-1');
      expect(screen.getByTestId('dashboard-status')).toHaveTextContent('Ridge Tavern');
      expect(screen.getByText("Yes, it's working.")).toBeOnTheScreen();
      expect(screen.getByTestId('stat-slots')).toHaveTextContent(/2 of 3/);
      expect(within(screen.getByTestId('stat-this-month')).getByText('4')).toBeOnTheScreen();
      expect(within(screen.getByTestId('stat-this-month')).getByText('1 last month')).toBeOnTheScreen();
      expect(screen.getByText('Marisol Reyes')).toBeOnTheScreen();
      expect(screen.getByText('2 for 1 pints')).toBeOnTheScreen();
      expect(screen.getByTestId('dashboard-no-customer-list')).toBeOnTheScreen();
      expect(screen.getByText('Ana and Marcus')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('dashboard-post-cta'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/create-post', params: { helloHangoutId: 'hh-1' } });
      await fireEvent.press(screen.getByTestId('dashboard-preview'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/preview', params: { helloHangoutId: 'hh-1' } });
      await fireEvent.press(screen.getByTestId('dashboard-edit'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/edit', params: { helloHangoutId: 'hh-1' } });
      distanceGuard();
    });

    it('states an unpaid page, a missing pin and an unpublished page plainly, and the wall when it cannot be linked', async () => {
      hangouts.listMyHelloHangouts.mockResolvedValue({ data: { helloHangouts: [{ id: 'hh-1', name: 'Ridge Tavern', status: 'pending_payment', tier: 'regular', price_cents: 34900 }] } } as never);
      dir.getManage.mockResolvedValue({ data: manage({ status: 'pending_payment', founding: false, pinSet: false, renewsAt: null }, { directory: { available: false }, wall: null }) } as never);
      await wrap(<HangoutDashboardScreen />);
      expect(await screen.findByTestId('dashboard-status-banner')).toHaveTextContent(/isn't public until your membership is paid/);
      expect(screen.getByTestId('dashboard-pin-missing')).toBeOnTheScreen();
      expect(screen.getByTestId('dashboard-directory-note')).toHaveTextContent(/aren't set up on this server yet/);
      expect(screen.getAllByText(/doesn't link a hello to a Hello Hangout/).length).toBeGreaterThan(0);
      expect(screen.queryByText("Yes, it's working.")).not.toBeOnTheScreen();
      expect(screen.queryByTestId('founding-badge')).not.toBeOnTheScreen();
    });

    it('lays out the desktop owner portal at 1440 wide (§19.7)', async () => {
      mockWindowWidth = 1440;
      hangouts.listMyHelloHangouts.mockResolvedValue({ data: { helloHangouts: [{ id: 'hh-1', name: 'Ridge Tavern', status: 'active', tier: 'founding', price_cents: 19900 }] } } as never);
      dir.getManage.mockResolvedValue({ data: manage() } as never);
      await wrap(<HangoutDashboardScreen />);
      expect(await screen.findByTestId('dashboard-desktop')).toBeOnTheScreen();
      expect(screen.getByTestId('rail-wall')).toBeOnTheScreen();
      // The rail item and the panel heading (both are drawn in the D 1440 H9 frame).
      expect(screen.getAllByText('Your wall')).toHaveLength(2);
      expect(within(screen.getByTestId('stat-selfies')).getByText('2')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('rail-billing'));
      expect(screen.getByTestId('dashboard-billing')).toHaveTextContent(/\$199/);
      await fireEvent.press(screen.getByTestId('rail-posts'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/posts', params: { helloHangoutId: 'hh-1' } });
    });

    it('shows unavailable when none', async () => {
      hangouts.listMyHelloHangouts.mockResolvedValue({ data: { helloHangouts: [] } } as never);
      await wrap(<HangoutDashboardScreen />);
      await waitFor(() => expect(screen.getByTestId('dashboard-unavailable')).toBeTruthy());
    });

    it('offers a retry when the dashboard fails to load', async () => {
      hangouts.listMyHelloHangouts.mockResolvedValueOnce({ error: { message: 'offline' } } as never)
        .mockResolvedValueOnce({ data: { helloHangouts: [] } } as never);
      await wrap(<HangoutDashboardScreen />);
      await fireEvent.press(await screen.findByTestId('dashboard-error'));
      expect(await screen.findByTestId('dashboard-unavailable')).toBeOnTheScreen();
    });
  });

  describe('H10 Create a post', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1' });
      feed.getManagedPosts.mockResolvedValue({ data: { status: 'active', slots: { monthYear: '2026-09', freeSlots: 3, slotsUsed: 1, remaining: 2, additionalPostCents: 1000, shelfDays: 7 }, posts: [] } } as never);
    });

    it('needs both of the deal\'s own dates before a Discount can post, and sends them with the shelf life left to the server', async () => {
      feed.createFeedPost.mockResolvedValue({ data: { post: { id: 'p1' } } } as never);
      await wrap(<HangoutCreatePostScreen />);
      expect(await screen.findByTestId('compose-free')).toHaveTextContent('2 free posts left');
      expect(screen.getByTestId('compose-shelf')).toHaveTextContent('7 days');
      await fireEvent.changeText(screen.getByTestId('compose-title'), 'Two for one on any pour-over');
      expect(screen.getByTestId('compose-submit')).toBeDisabled();
      await fireEvent.changeText(screen.getByTestId('compose-start'), '2099-08-22');
      expect(screen.getByTestId('compose-submit')).toBeDisabled();
      await fireEvent.changeText(screen.getByTestId('compose-end'), '2099-08-21');
      expect(screen.getByTestId('compose-submit')).toBeDisabled();
      await fireEvent.changeText(screen.getByTestId('compose-end'), '2099-08-31');
      await fireEvent.press(screen.getByTestId('compose-submit'));
      const sent = feed.createFeedPost.mock.calls[0][0];
      expect(sent).toMatchObject({ helloHangoutId: 'hh-1', postType: 'special', title: 'Two for one on any pour-over' });
      expect(new Date(sent.dealStartDate!).getDate()).toBe(22);
      expect(new Date(sent.dealEndDate!).getDate()).toBe(31);
      expect(mockBack).toHaveBeenCalled();
    });

    it('posts a Holla with no deal dates', async () => {
      feed.createFeedPost.mockResolvedValue({ data: { post: { id: 'p2' } } } as never);
      await wrap(<HangoutCreatePostScreen />);
      await fireEvent.press(await screen.findByTestId('compose-type-holla'));
      expect(screen.queryByTestId('compose-start')).not.toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('compose-title'), 'New single origin landed');
      await fireEvent.press(screen.getByTestId('compose-submit'));
      expect(feed.createFeedPost).toHaveBeenCalledWith(expect.objectContaining({ postType: 'holla', title: 'New single origin landed' }));
      expect(feed.createFeedPost.mock.calls[0][0]).not.toHaveProperty('dealStartDate');
    });

    it('opens the delivered out-of-free-posts screen when the server asks for payment', async () => {
      feed.createFeedPost.mockResolvedValue({ error: { status: 402, message: 'payment_required' } } as never);
      await wrap(<HangoutCreatePostScreen />);
      await fireEvent.press(await screen.findByTestId('compose-type-holla'));
      await fireEvent.changeText(screen.getByTestId('compose-title'), 'News');
      await fireEvent.press(screen.getByTestId('compose-submit'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hootzas)/discount/out-of-posts', params: { hangoutId: 'hh-1' } });
      expect(screen.getByTestId('compose-error')).toHaveTextContent(/\$10/);
    });

    it('edits an existing post in place (keeps its slot) with PATCH', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1', postId: 'p1' });
      feed.getManagedPosts.mockResolvedValue({ data: { status: 'active', slots: { monthYear: '2026-09', freeSlots: 3, slotsUsed: 1, remaining: 2, additionalPostCents: 1000 }, posts: [
        { id: 'p1', postType: 'special', title: 'Old', description: null, dealStartDate: '2099-08-22T07:00:00.000Z', dealEndDate: '2099-08-31T06:59:59.000Z', postExpiryDate: '2099-08-29T00:00:00.000Z', effectiveExpiryDate: '2099-08-29T00:00:00.000Z', createdAt: '2099-08-22T00:00:00.000Z', state: 'on_feed' },
      ] } } as never);
      feed.updateFeedPost.mockResolvedValue({ data: { post: { id: 'p1' } } } as never);
      await wrap(<HangoutCreatePostScreen />);
      expect(await screen.findByDisplayValue('Old')).toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('compose-title'), 'New title');
      await fireEvent.press(screen.getByTestId('compose-submit'));
      expect(feed.updateFeedPost).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'New title' }));
      expect(feed.createFeedPost).not.toHaveBeenCalled();
    });
  });

  describe('Your posts', () => {
    it('lists each post with its state and takes one down only after confirming', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1' });
      feed.getManagedPosts.mockResolvedValue({ data: { status: 'active', slots: {} as never, posts: [
        { id: 'p1', postType: 'special', title: 'Pints', description: null, dealStartDate: null, dealEndDate: '2099-01-01T00:00:00.000Z', postExpiryDate: '', effectiveExpiryDate: '', createdAt: '', state: 'on_feed' },
        { id: 'p2', postType: 'holla', title: 'Old news', description: null, dealStartDate: null, dealEndDate: null, postExpiryDate: '', effectiveExpiryDate: '', createdAt: '', state: 'page_only' },
      ] } } as never);
      feed.deleteFeedPost.mockResolvedValueOnce({ error: { code: 'reported_post_retained', message: 'x', status: 409 } } as never)
        .mockResolvedValueOnce({ data: { deleted: true } } as never);
      await wrap(<ManagePostsScreen />);
      expect(await screen.findByTestId('post-state-p1')).toHaveTextContent('On the feed');
      expect(screen.getByTestId('post-state-p2')).toHaveTextContent('On your page');
      await fireEvent.press(screen.getByTestId('post-takedown-p1'));
      expect(feed.deleteFeedPost).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByTestId('post-takedown-yes-p1'));
      expect(screen.getByText('Someone reported this post, so it stays for review.')).toBeOnTheScreen();
      expect(screen.getByTestId('post-p1')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('post-takedown-p1'));
      await fireEvent.press(screen.getByTestId('post-takedown-yes-p1'));
      expect(screen.queryByTestId('post-p1')).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('post-repost-p2'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/create-post', params: { helloHangoutId: 'hh-1', repostOf: 'p2' } });
    });
  });

  describe('H11 Directory', () => {
    const rows = [
      { id: 'hh-1', name: 'Ridge Tavern', address: '1411 Ridge Ave', lat: 1, lng: 2, founding: true, todayDiscount: 'Happy hour 5–9', published: true, hours: null, amenities: [], hellos: 12 },
      { id: 'hh-2', name: 'Otero Coffee', address: '9 Main', lat: 1, lng: 2, founding: false, todayDiscount: null, published: false, hours: null, amenities: [], hellos: 0 },
    ];

    it('shows empty/unavailable', async () => {
      dir.listDirectory.mockResolvedValue({ data: { sort: 'hellos', directoryAvailable: true, hellosAvailable: true, hangouts: [] } } as never);
      await wrap(<HangoutDirectoryScreen />);
      expect(await screen.findByTestId('directory-empty')).toBeTruthy();
      expect(screen.getByText('NO HELLO HANGOUTS HERE YET.')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('directory-become-ambassador'));
      expect(mockPush).toHaveBeenCalledWith('/ambassador/signup');
    });

    it('lists Hello Hangouts from the server with Founding, today\'s discount and Waverly plus the number, and opens a page', async () => {
      dir.listDirectory.mockResolvedValue({ data: { sort: 'hellos', directoryAvailable: true, hellosAvailable: true, hangouts: rows, total: rows.length } } as never);
      await wrap(<HangoutDirectoryScreen />);
      expect(await screen.findByText('Ridge Tavern')).toBeOnTheScreen();
      expect(screen.getByTestId('directory-count')).toHaveTextContent('2 Hello Hangouts · sorted by Most Hellos');
      expect(screen.getByText('Happy hour 5–9', { exact: false })).toBeOnTheScreen();
      expect(screen.getByText('No discount posted today.')).toBeOnTheScreen();
      expect(screen.getByText('12')).toBeOnTheScreen();
      expect(screen.queryByText('0')).not.toBeOnTheScreen(); // §19.1: never a "0"
      expect(screen.getAllByTestId('founding-badge')).toHaveLength(1);
      await fireEvent.press(screen.getByTestId('directory-row-hh-2'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/directory/[id]', params: { id: 'hh-2' } });
      distanceGuard();
    });

    it('searches, filters and sorts on the server, and says when Most Hellos cannot be used', async () => {
      dir.listDirectory.mockResolvedValue({ data: { sort: 'newest', directoryAvailable: false, hellosAvailable: false, hangouts: rows.map((r) => ({ ...r, hellos: null })) } } as never);
      await wrap(<HangoutDirectoryScreen />);
      expect(await screen.findByTestId('directory-sort-fallback')).toBeOnTheScreen();
      expect(screen.queryByTestId('sort-hellos')).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('sort-az'));
      await waitFor(() => expect(dir.listDirectory).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'az' })));
      await fireEvent.press(screen.getByTestId('directory-filters'));
      await fireEvent(screen.getByTestId('filter-founding'), 'valueChange', true);
      await fireEvent.press(screen.getByTestId('filters-apply'));
      await waitFor(() => expect(dir.listDirectory).toHaveBeenLastCalledWith(expect.objectContaining({ founding: true })));
      await fireEvent.changeText(screen.getByTestId('directory-search'), 'coffee');
      await waitFor(() => expect(dir.listDirectory).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'coffee' })));
    });

    it('asks for location only when Closest is chosen, and explains when it is off', async () => {
      dir.listDirectory.mockResolvedValue({ data: { sort: 'hellos', directoryAvailable: true, hellosAvailable: true, hangouts: rows } } as never);
      location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
      await wrap(<HangoutDirectoryScreen />);
      await screen.findByText('Ridge Tavern');
      expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByTestId('sort-closest'));
      expect(screen.getByText(/Closest needs your location/)).toBeOnTheScreen();
    });

    it('offers a retry when the directory fails to load', async () => {
      dir.listDirectory.mockResolvedValueOnce({ error: { message: 'offline' } } as never)
        .mockResolvedValue({ data: { sort: 'hellos', directoryAvailable: true, hellosAvailable: true, hangouts: rows } } as never);
      await wrap(<HangoutDirectoryScreen />);
      await fireEvent.press(await screen.findByTestId('directory-error'));
      expect(await screen.findByText('Ridge Tavern')).toBeOnTheScreen();
    });
  });

  describe('H11a Listing (the Hello Hangout page)', () => {
    it('shows unavailable', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'gone' });
      dir.getDirectoryPage.mockResolvedValue({ error: { status: 404, message: 'not_found' } } as never);
      await wrap(<HangoutListingScreen />);
      expect(await screen.findByTestId('listing-unavailable')).toBeTruthy();
    });

    it('renders the published page with working Directions, Call, Share and website, hours and the wall', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hh-1' });
      dir.getDirectoryPage.mockResolvedValue({ data: { hangout: page() } } as never);
      const openURL = jest.spyOn(ReactNative.Linking, 'openURL').mockResolvedValue(true);
      const share = jest.spyOn(ReactNative.Share, 'share').mockResolvedValue({ action: 'sharedAction' });
      await wrap(<HangoutListingScreen />);
      expect(await screen.findByText('Ridge Tavern')).toBeOnTheScreen();
      expect(screen.getByTestId('page-today')).toHaveTextContent(/Happy hour 5–9/);
      expect(screen.getByTestId('page-description')).toHaveTextContent(/Neighborhood bar\./);
      expect(screen.getByText('Wheelchair accessible')).toBeOnTheScreen();
      expect(screen.getByTestId('page-hours')).toHaveTextContent(/Closed/);
      expect(screen.getByTestId('founding-badge')).toBeOnTheScreen();
      expect(screen.getByText('3')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('page-directions'));
      expect(openURL.mock.calls[0][0]).toContain('47.6');
      await fireEvent.press(screen.getByTestId('page-call'));
      expect(openURL).toHaveBeenCalledWith('tel:3035550148');
      await fireEvent.press(screen.getByTestId('page-share'));
      expect(share).toHaveBeenCalledWith({ message: 'Ridge Tavern · 1411 Ridge Ave' });
      await fireEvent.press(screen.getByTestId('page-website'));
      expect(openURL).toHaveBeenCalledWith('https://ridge.example');
      await fireEvent.press(screen.getByTestId('page-see-all'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/directory/wall', params: { id: 'hh-1' } });
      distanceGuard();
    });

    it('is honest about an unpublished page and a wall the server cannot link', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hh-1' });
      dir.getDirectoryPage.mockResolvedValue({ data: { hangout: page({ published: false, description: '', phone: '', website: '', amenities: [], hours: {}, todayDiscount: null, hellos: null, wall: null, founding: false }) } } as never);
      await wrap(<HangoutListingScreen />);
      expect(await screen.findByTestId('page-details-soon')).toHaveTextContent("Ridge Tavern hasn't filled in its page yet.");
      expect(screen.getByText(/doesn't link a hello to a Hello Hangout/)).toBeOnTheScreen();
      expect(screen.queryByTestId('page-call')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('founding-badge')).not.toBeOnTheScreen();
    });
  });

  describe('Hello wall', () => {
    it('shows the first names on each selfie and never a hide control (§10.11)', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hh-1' });
      dir.getDirectoryWall.mockResolvedValue({ data: { name: 'Ridge Tavern', wall: { hellos: 2, selfies: 2, tiles: [{ helloId: 'x1', selfieUrl: null, names: ['Ana', 'Marcus'], colors: [] }] } } } as never);
      await wrap(<HelloWallScreen />);
      expect(await screen.findByText('Ana & Marcus')).toBeOnTheScreen();
      expect(screen.queryByText(/hide/i)).not.toBeOnTheScreen();
      expect(screen.queryByText(/remove|delete/i)).not.toBeOnTheScreen();
    });

    it('says the wall cannot be shown when the server does not link hellos', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hh-1' });
      dir.getDirectoryWall.mockResolvedValue({ data: { name: 'Ridge Tavern', wall: null } } as never);
      await wrap(<HelloWallScreen />);
      expect(await screen.findByTestId('wall-unlinked')).toBeOnTheScreen();
    });
  });

  describe('Owner: edit, hours, preview and publish', () => {
    const draft = { name: 'Ridge Tavern', address: '1411 Ridge Ave', lat: 0, lng: 0, description: '', phone: '', website: '', amenities: [], hours: {} };

    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1' });
    });

    it('saves the draft with a pin from the device and reads it back', async () => {
      dir.getDirectoryDraft.mockResolvedValue({ data: { directory: { available: true, status: 'active', draft } } } as never);
      dir.saveDirectoryDraft.mockImplementation(async (_id, d) => ({ data: { directory: { draft: d, updatedAt: 'now' } } }) as never);
      location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
      location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 47.66, longitude: -122.38 } } as never);
      await wrap(<EditDirectoryScreen />);
      expect(await screen.findByTestId('edit-pin-state')).toHaveTextContent('No pin yet');
      await fireEvent.press(screen.getByTestId('edit-pin-here'));
      expect(screen.getByTestId('edit-pin-state')).toHaveTextContent('Pin set');
      await fireEvent.changeText(screen.getByTestId('edit-description'), '  Neighborhood bar.  ');
      await fireEvent.changeText(screen.getByTestId('edit-amenity'), 'Cash & card');
      await fireEvent.press(screen.getByTestId('edit-amenity-add'));
      await fireEvent.press(screen.getByTestId('edit-save'));
      expect(dir.saveDirectoryDraft).toHaveBeenCalledWith('hh-1', expect.objectContaining({
        name: 'Ridge Tavern', lat: 47.66, lng: -122.38, description: 'Neighborhood bar.', amenities: ['Cash & card'],
      }));
      expect(screen.getByTestId('edit-message')).toHaveTextContent('Draft saved.');
    });

    it('says plainly when directory pages are not set up on the server', async () => {
      dir.getDirectoryDraft.mockResolvedValue({ data: { directory: { available: false, status: 'active' } } } as never);
      await wrap(<EditDirectoryScreen />);
      expect(await screen.findByTestId('edit-unavailable')).toBeOnTheScreen();
    });

    it('keeps the save visible and retryable when it fails', async () => {
      dir.getDirectoryDraft.mockResolvedValue({ data: { directory: { available: true, status: 'active', draft: { ...draft, lat: 1, lng: 1 } } } } as never);
      dir.saveDirectoryDraft.mockResolvedValue({ error: { status: 0, message: 'offline' } } as never);
      await wrap(<EditDirectoryScreen />);
      await fireEvent.press(await screen.findByTestId('edit-save'));
      expect(screen.getByTestId('edit-message')).toHaveTextContent("That didn't save. Try again.");
      expect(screen.getByTestId('edit-save')).toBeEnabled();
    });

    it('edits hours per day and refuses a malformed time', async () => {
      dir.getDirectoryDraft.mockResolvedValue({ data: { directory: { available: true, status: 'active', draft } } } as never);
      dir.saveDirectoryDraft.mockResolvedValue({ data: { directory: { draft, updatedAt: 'now' } } } as never);
      await wrap(<HoursScreen />);
      await fireEvent(await screen.findByTestId('hours-mon-open-switch'), 'valueChange', true);
      await fireEvent.changeText(screen.getByTestId('hours-mon-open'), '4pm');
      await fireEvent.changeText(screen.getByTestId('hours-mon-close'), '02:00');
      await fireEvent.press(screen.getByTestId('hours-save'));
      expect(dir.saveDirectoryDraft).not.toHaveBeenCalled();
      expect(screen.getByTestId('hours-message')).toHaveTextContent(/24-hour/);
      await fireEvent.changeText(screen.getByTestId('hours-mon-open'), '16:00');
      await fireEvent.press(screen.getByTestId('hours-save'));
      const saved = dir.saveDirectoryDraft.mock.calls[0][1];
      expect(saved.hours?.mon).toEqual({ closed: false, open: '16:00', close: '02:00' });
      expect(saved.hours?.tue).toEqual({ closed: true, open: null, close: null });
      expect(saved.name).toBe('Ridge Tavern');
      expect(screen.queryByText(/Deals and events use these hours/)).not.toBeOnTheScreen();
    });

    it('previews the draft as the public page and publishes it', async () => {
      dir.previewDirectory.mockResolvedValue({ data: { hangout: { ...page(), preview: true, status: 'active' } } } as never);
      dir.publishDirectory.mockResolvedValue({ data: { directory: { published: draft, publishedAt: 'now' } } } as never);
      await wrap(<PreviewScreen />);
      expect(await screen.findByText('Preview · this is the public page')).toBeOnTheScreen();
      expect(screen.getByText('Ridge Tavern')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('preview-publish'));
      expect(dir.publishDirectory).toHaveBeenCalledWith('hh-1');
      expect(screen.getByTestId('preview-message')).toHaveTextContent(/^Published\./);
      await fireEvent.press(screen.getByTestId('preview-edit'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/edit', params: { helloHangoutId: 'hh-1' } });
    });

    it('cannot publish an unpaid Hello Hangout and says why', async () => {
      dir.previewDirectory.mockResolvedValue({ data: { hangout: { ...page(), preview: true, status: 'pending_payment' } } } as never);
      await wrap(<PreviewScreen />);
      expect(await screen.findByTestId('preview-not-active')).toBeOnTheScreen();
      expect(screen.getByTestId('preview-publish')).toBeDisabled();
    });

    it('explains an incomplete draft when publishing is refused', async () => {
      dir.previewDirectory.mockResolvedValue({ data: { hangout: { ...page(), preview: true, status: 'active' } } } as never);
      dir.publishDirectory.mockResolvedValue({ error: { status: 422, code: 'incomplete', message: 'incomplete' } } as never);
      await wrap(<PreviewScreen />);
      await fireEvent.press(await screen.findByTestId('preview-publish'));
      expect(screen.getByTestId('preview-message')).toHaveTextContent(/Add a name, an address and your pin/);
    });
  });

  describe('H12 Deal redemption', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1' });
      dir.getManage.mockReset();
      biz.redeemDeal.mockReset();
      dir.getManage.mockResolvedValue({ data: manage() } as never);
      biz.getRedemptions.mockResolvedValue({ data: { redemptions: { total: 7, thisMonth: 3, byPost: [] } } } as never);
    });

    it('loads the live Special for this Hello Hangout and redeems it with the deal id, never a person', async () => {
      biz.redeemDeal.mockResolvedValue({ data: { redeemed: { postId: 'p1', title: '2 for 1 pints', redeemedAt: '2026-10-01T14:02:00.000Z' } } } as never);
      await wrap(<DealRedemptionScreen />);
      expect(await screen.findByText('2 for 1 pints')).toBeTruthy();
      expect(dir.getManage).toHaveBeenCalledWith('hh-1');
      expect(biz.getRedemptions).toHaveBeenCalledWith('hh-1');
      expect(screen.getByText('3 used this month')).toBeTruthy();
      expect(screen.getByText(/No name, no account, no history/)).toBeTruthy();
      await fireEvent.press(screen.getByTestId('redeem-button'));
      await waitFor(() => expect(biz.redeemDeal).toHaveBeenCalledWith('hh-1', 'p1'));
      expect(await screen.findByTestId('redeem-result')).toHaveTextContent(/^Redeemed · /);
    });

    it('reads an already-used claim as a time, not a name', async () => {
      biz.redeemDeal.mockResolvedValue({ error: { code: 'already_used', message: 'x', body: { redeemedAt: '2026-10-01T14:02:00.000Z' } } } as never);
      await wrap(<DealRedemptionScreen />);
      await fireEvent.press(await screen.findByTestId('redeem-button'));
      expect(await screen.findByTestId('redeem-result')).toHaveTextContent(/^Already used · /);
    });

    it('says the deal is not live and reloads when the server refuses with deal_not_live', async () => {
      biz.redeemDeal.mockResolvedValue({ error: { code: 'deal_not_live', message: 'x' } } as never);
      await wrap(<DealRedemptionScreen />);
      await fireEvent.press(await screen.findByTestId('redeem-button'));
      expect(await screen.findByText('That deal is not live right now.')).toBeTruthy();
      await waitFor(() => expect(dir.getManage).toHaveBeenCalledTimes(2));
    });

    it('shows no redeem button when no Special is live', async () => {
      dir.getManage.mockResolvedValue({ data: manage({}, { onNow: [] }) } as never);
      await wrap(<DealRedemptionScreen />);
      expect(await screen.findByTestId('redeem-none-live')).toBeTruthy();
      expect(screen.queryByTestId('redeem-button')).toBeNull();
    });

    it('shows no redeem button when the Hello Hangout is not active', async () => {
      dir.getManage.mockResolvedValue({ data: manage({ status: 'lapsed' }) } as never);
      await wrap(<DealRedemptionScreen />);
      expect(await screen.findByTestId('redeem-inactive')).toBeTruthy();
      expect(screen.queryByTestId('redeem-button')).toBeNull();
    });

    it('shows a retry when the page cannot load', async () => {
      dir.getManage.mockResolvedValue({ error: { code: 'server_error', message: 'x' } } as never);
      await wrap(<DealRedemptionScreen />);
      expect(await screen.findByTestId('redeem-error')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      await wrap(<DealRedemptionScreen />);
      await screen.findByTestId('redeem-button');
      distanceGuard();
    });
  });
});
