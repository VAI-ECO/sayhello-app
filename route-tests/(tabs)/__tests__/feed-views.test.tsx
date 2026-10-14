/**
 * What's Happening — views (§17.18), the quiet-day fallback, and Open to Hellos on the server (lane 07).
 * ⚠️ RNTL v14: render, fireEvent and waitFor are async and awaited.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../src/theme';
import * as feedApi from '../../../src/api/feed';
import * as mapApi from '../../../src/api/map';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })),
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react') as typeof import('react');
    useEffect(cb, [cb]);
  },
}));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));
jest.mock('../../../src/api/feed');
jest.mock('../../../src/api/hellos');
jest.mock('../../../src/api/points');
jest.mock('../../../src/api/map');

import * as Location from 'expo-location';
import WhatsHappeningScreen from '../../../app/(tabs)/home';
import * as hellosApi from '../../../src/api/hellos';
import * as pointsApi from '../../../src/api/points';
import { resetKnownOpen } from '../../../src/state/open-to-hellos';

const getFeed = feedApi.getFeed as jest.Mock;
const getOpen = mapApi.getOpenToHellos as jest.Mock;
const setOpen = mapApi.setOpenToHellos as jest.Mock;

const hootza = (id: string, title: string) => ({
  type: 'hootza', id, title, venueType: 'public_place', locationName: 'Bell St', startTime: new Date().toISOString(),
  host: { id: 'h', fullName: 'Host' }, rsvpCount: 1, checkinCount: 0, createdAt: new Date().toISOString(), isTonight: false,
});
const feed = (items: unknown[], view = 'today') => ({ data: { view, items, count: items.length } });

async function renderHome() {
  await render(<ThemeProvider><WhatsHappeningScreen /></ThemeProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  resetKnownOpen();
  (hellosApi.getHellos as jest.Mock).mockResolvedValue({ data: { hellos: [] } });
  (hellosApi.getNudgeCap as jest.Mock).mockResolvedValue({ data: { atCap: false } });
  (pointsApi.getPointsBalance as jest.Mock).mockResolvedValue({ data: { balance: 1, drawingEntries: 1 } });
  getOpen.mockResolvedValue({ data: { open: false, updatedAt: null, discoveryActive: false } });
  setOpen.mockImplementation(async (open: boolean) => ({ data: { open, updatedAt: null, discoveryActive: false } }));
});

describe('views', () => {
  it('opens on Today and offers This week, Nearest and Newest', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    expect(getFeed).toHaveBeenCalledWith({ view: 'today', singlePage: true });
    for (const v of ['today', 'this_week', 'nearest', 'newest']) expect(screen.getByTestId(`feed-view-${v}`)).toBeTruthy();
  });

  it('reloads the chosen view from the server', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    getFeed.mockResolvedValue(feed([hootza('2', 'Sunrise 5k')], 'newest'));
    await fireEvent.press(screen.getByTestId('feed-view-newest'));
    await waitFor(() => expect(screen.getByText('Sunrise 5k')).toBeTruthy());
    expect(getFeed).toHaveBeenLastCalledWith({ view: 'newest', singlePage: true });
  });

  it('asks for location for Nearest and sends the coordinates, never showing them', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 13.7, longitude: 100.5 } });
    getFeed.mockResolvedValue(feed([hootza('3', 'Near Cafe Quiz')], 'nearest'));
    await fireEvent.press(screen.getByTestId('feed-view-nearest'));
    await waitFor(() => expect(screen.getByText('Near Cafe Quiz')).toBeTruthy());
    expect(getFeed).toHaveBeenLastCalledWith({ view: 'nearest', lat: 13.7, lng: 100.5, singlePage: true });
    expect(screen.queryByText(/13\.7|km|mile/i)).toBeNull();
  });

  it('says plainly that Nearest needs location, and does not call the server without it', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    getFeed.mockClear();
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
    await fireEvent.press(screen.getByTestId('feed-view-nearest'));
    await waitFor(() => expect(screen.getByTestId('feed-location-needed')).toBeTruthy());
    expect(getFeed).not.toHaveBeenCalled();
  });
});

describe('paging and type filter', () => {
  it('offers Show more when the server has more, and appends the next page of the same list', async () => {
    getFeed.mockResolvedValueOnce({ data: { view: 'today', items: [hootza('1', 'Trivia')], count: 1, hasMore: true, nextCursor: 'c1' } });
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    getFeed.mockResolvedValueOnce({ data: { view: 'today', items: [hootza('2', 'Brunch')], count: 1, hasMore: false, nextCursor: null } });
    await fireEvent.press(screen.getByTestId('feed-show-more'));
    await waitFor(() => expect(screen.getByText('Brunch')).toBeTruthy());
    expect(screen.getByText('Trivia')).toBeTruthy();
    expect(getFeed).toHaveBeenLastCalledWith({ view: 'today', singlePage: true, cursor: 'c1' });
    expect(screen.queryByTestId('feed-show-more')).toBeNull();
  });

  it('cuts by type on the server, so a chip is never a filter over the first page', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
    getFeed.mockResolvedValue(feed([], 'today'));
    await fireEvent.press(screen.getByRole('button', { name: 'Discounts' }));
    await waitFor(() => expect(getFeed).toHaveBeenCalledWith({ view: 'today', types: ['special'], singlePage: true }));
  });
});

describe('quiet day', () => {
  it('shows what is coming up this week when Today is empty', async () => {
    getFeed.mockImplementation(async (p: { view: string }) => (p.view === 'today' ? feed([]) : feed([hootza('9', 'Friday Jam')], 'this_week')));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Friday Jam')).toBeTruthy());
    expect(screen.getByTestId('coming-up-header')).toBeTruthy();
    expect(screen.getByText('Quiet around here today')).toBeTruthy();
  });

  it('stays an honest quiet day when this week is empty too', async () => {
    getFeed.mockResolvedValue(feed([]));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Quiet around here today')).toBeTruthy());
    expect(screen.queryByTestId('coming-up-header')).toBeNull();
  });
});

describe('tablet and desktop cards', () => {
  it('picks columns from the window width (700 tablet; three from 1280, past the 260 px rail)', () => {
    const { feedColumns } = require('../../../src/components/feed/FeedGridCard');
    expect([feedColumns(390), feedColumns(699), feedColumns(700), feedColumns(834), feedColumns(1024), feedColumns(1279), feedColumns(1280), feedColumns(1440)]).toEqual([1, 1, 2, 2, 2, 2, 3, 3]);
  });

  it('draws the feed as cards side by side at tablet width', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia'), hootza('2', 'Sunrise 5k')]));
    await renderHome(); // the test window is 750 wide: a tablet
    await waitFor(() => expect(screen.getByTestId('feed-grid')).toBeTruthy());
    expect(screen.getByTestId('feed-card-hootza-1')).toBeTruthy();
    expect(screen.getByTestId('feed-card-hootza-2')).toBeTruthy();
  });
});

describe('Open to Hellos is the server state', () => {
  it('starts off until the server says otherwise, and writes the change to the server', async () => {
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(getOpen).toHaveBeenCalled());
    const sw = await screen.findByTestId('home-open-to-hellos-switch');
    await waitFor(() => expect(sw.props.accessibilityState.disabled).toBe(false));
    expect(sw.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(sw);
    await waitFor(() => expect(setOpen).toHaveBeenCalledWith(true));
    await waitFor(() => expect(screen.getByTestId('home-open-to-hellos-switch').props.accessibilityState.checked).toBe(true));
    // Discovery is off server-side, so the screen says so rather than implying people are being found.
    expect(screen.getByTestId('home-open-not-on')).toBeTruthy();
  });

  it('shows the server value when it is already on, and keeps it when the write fails', async () => {
    getOpen.mockResolvedValue({ data: { open: true, updatedAt: null, discoveryActive: true } });
    setOpen.mockResolvedValue({ error: { message: 'down' } });
    getFeed.mockResolvedValue(feed([hootza('1', 'Trivia')]));
    await renderHome();
    await waitFor(() => expect(screen.getByTestId('home-open-to-hellos-switch').props.accessibilityState.checked).toBe(true));
    await fireEvent.press(screen.getByTestId('home-open-to-hellos-switch'));
    await waitFor(() => expect(screen.getByText("That didn't change. Try again.")).toBeTruthy());
    expect(screen.getByTestId('home-open-to-hellos-switch').props.accessibilityState.checked).toBe(true);
  });
});
