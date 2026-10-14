/**
 * HELLO MAP TESTS
 *
 * States of the Hello Map: browsing (one GET /map/viewport for every pin type, with clusters), search
 * (GET /map/search: Hello Hangouts, Hootzas, Places), pin sheet (GET /map/pins/:id), place page
 * (GET /map/area), empty state, and "Open to Hellos" (GET/PUT /map/open-to-hellos). The basemap
 * provider note comes from GET /map/provider. Own pins in limited mode (location off) still use
 * GET /map/pins?scope=mine.
 *
 * RNTL v14: All operations async, always await, use imported screen
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import Map from '../../../app/(tabs)/map';
import PlaceDetailScreen from '../../../app/(tabs)/map/place';
import EmptyStateScreen from '../../../app/(tabs)/map/empty';
import { en } from '../../../src/i18n/en';
import * as mapApi from '../../../src/api/map';

// Mock expo-router
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock Waverly component
jest.mock('../../../src/components', () => ({
  ...jest.requireActual('../../../src/components'),
  Waverly: () => null,
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

const mockStorage = new globalThis.Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStorage.get(k) ?? null)),
    setItem: jest.fn((k: string, v: string) => { mockStorage.set(k, v); return Promise.resolve(); }),
    removeItem: jest.fn((k: string) => { mockStorage.delete(k); return Promise.resolve(); }),
  },
}));

jest.mock('../../../src/api/map', () => ({
  getViewport: jest.fn(),
  getMapProviderStatus: jest.fn(),
  getOpenToHellos: jest.fn(),
  setOpenToHellos: jest.fn(),
  searchMap: jest.fn(),
  getMapPins: jest.fn(),
  getMapHangouts: jest.fn(),
  getPinDetail: jest.fn(),
  getAreaSummary: jest.fn(),
}));

const api = mapApi as jest.Mocked<typeof mapApi>;
const HERE = { latitude: 36.16, longitude: -86.78 };
const serverPins: mapApi.MapPin[] = [
  { id: 'p1', locationLat: 36.162, locationLng: -86.781, hangoutId: null, mine: true, color: '#8E24AA' },
  { id: 'p2', locationLat: 36.17, locationLng: -86.784, hangoutId: null, mine: false, color: null },
];
const hangout: mapApi.MapHangout = { id: 'hh1', name: 'Ridge Tavern', address: '12 Bell St', lat: 36.165, lng: -86.78, founding: true };
const metAt = '2026-08-02T18:42:00Z';

const viewportItems: mapApi.ViewportItem[] = [
  { kind: 'hello', id: 'p1', lat: 36.162, lng: -86.781, title: null, mine: true, color: '#8E24AA', destination: { type: 'pin', id: 'p1' } },
  { kind: 'hello', id: 'p2', lat: 36.17, lng: -86.784, title: null, mine: false, color: null, destination: { type: 'pin', id: 'p2' } },
  { kind: 'hangout', id: 'hh1', lat: 36.165, lng: -86.78, title: 'Ridge Tavern', founding: true, destination: { type: 'directory', id: 'hh1' } },
  { kind: 'hootza', id: 'z1', lat: 36.158, lng: -86.775, title: 'Trivia Night', destination: { type: 'hootza', id: 'z1' } },
  { kind: 'holla', id: 'ho1', lat: 36.155, lng: -86.79, title: 'Two for one', destination: { type: 'directory', id: 'hh1', postId: 'post-7' } },
];
const viewport = (over: Partial<mapApi.ViewportResult> = {}): { data: mapApi.ViewportResult } => ({
  data: { items: viewportItems, clusters: [], truncated: {}, ...over },
});
const openState = (over: Partial<mapApi.OpenToHellos> = {}) => ({ data: { open: false, updatedAt: null, discoveryActive: false, ...over } });
const fullSearch = (over: Partial<mapApi.FullSearch> = {}) => ({
  data: { hangouts: [hangout], hootzas: [], places: { configured: false, results: [], error: null }, ...over },
});

/** The test renderer computes no layout; give the map canvas a phone-sized frame. */
async function layoutCanvas() {
  const canvas = await screen.findByTestId('map-canvas');
  await fireEvent(canvas, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 375, height: 600 } } });
}

/** Render the map and let the canvas lay out so projected pins can be drawn. */
async function renderMap() {
  const result = await render(<Map />);
  await layoutCanvas();
  return result;
}

function setParams(params: Record<string, string>) {
  (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue(params);
}
const areaParams = { label: 'Ridge Tavern', minLat: '36.155', maxLat: '36.175', minLng: '-86.79', maxLng: '-86.77' };

describe('Hello Map', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
    setParams({});
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true, status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: HERE });
    api.getViewport.mockResolvedValue(viewport());
    api.getMapProviderStatus.mockResolvedValue({ data: { provider: 'none', geocoding: { configured: false }, basemap: { configured: false, renderer: 'grid' } } });
    api.getOpenToHellos.mockResolvedValue(openState());
    api.setOpenToHellos.mockImplementation(async (open: boolean) => openState({ open }) as never);
    api.getMapPins.mockResolvedValue({ data: { pins: serverPins, truncated: false } });
    api.getMapHangouts.mockResolvedValue({ data: { hangouts: [hangout] } });
    api.getPinDetail.mockResolvedValue({
      data: {
        pin: {
          id: 'p1',
          viewerIsParticipant: true,
          people: [{ displayName: 'Maya', identityColor: '#8E24AA' }, { displayName: 'Jordan', identityColor: '#00893F' }],
          locationName: 'Ridge Tavern, Nashville',
          hangoutName: 'Ridge Tavern',
          metAt,
          hasSelfie: false,
          selfieUrl: null,
        },
      },
    });
    api.getAreaSummary.mockResolvedValue({ data: { area: { hellos: 1204, thisMonth: 31, helloHangouts: 18, recent: [{ id: 'p1', mine: true, color: '#8E24AA' }] } } });
    api.searchMap.mockResolvedValue(fullSearch());
  });

  describe('BROWSING STATE (default)', () => {
    it('draws every pin type from one viewport query around the device position (Near me)', async () => {
      await renderMap();
      expect(await screen.findByTestId('hello-p1')).toBeTruthy();
      expect(screen.getByTestId('hello-p2')).toBeTruthy();
      expect(screen.getByTestId('hangout-hh1')).toBeTruthy();
      expect(screen.getByTestId('hootza-z1')).toBeTruthy();
      expect(screen.getByTestId('holla-ho1')).toBeTruthy();
      expect(api.getViewport).toHaveBeenCalledTimes(1);
      const [call] = api.getViewport.mock.calls[0];
      expect(call.bbox.minLat).toBeLessThan(HERE.latitude);
      expect(call.bbox.maxLat).toBeGreaterThan(HERE.latitude);
      expect(call.bbox.minLng).toBeLessThan(HERE.longitude);
      expect(call.bbox.maxLng).toBeGreaterThan(HERE.longitude);
      expect(call.kinds).toBeUndefined();
      expect(call.since).toBeNull();
      expect(api.getMapPins).not.toHaveBeenCalled();
    });

    it('renders search bar with placeholder copy', async () => {
      await renderMap();
      expect(await screen.findByText(en.map.search.placeholder)).toBeTruthy();
    });

    it('renders all five filter chips', async () => {
      await renderMap();
      expect(await screen.findByText(en.map.filters.nearMe)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.mine)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.helloHangouts)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.happening)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.thisYear)).toBeTruthy();
    });

    it('with location off, starts with this person’s own pins and one dismissible banner (§26.5)', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' });
      api.getMapPins.mockResolvedValue({ data: { pins: [serverPins[0]], truncated: false } });
      await renderMap();
      expect(await screen.findByTestId('location-banner')).toBeTruthy();
      expect(api.getMapPins).toHaveBeenCalledWith({ scope: 'mine' });
      expect(await screen.findByTestId('hello-p1')).toBeTruthy();
      expect(api.getViewport).not.toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
      expect(screen.getByText(en.map.filters.mine).parent?.props.accessibilityState.selected).toBe(true);
      await fireEvent.press(screen.getByText(en.map.browsing.dismiss));
      expect(screen.queryByTestId('location-banner')).toBeNull();
    });

    it('with location off and no pins of its own, asks for location or a search instead of drawing a fake map', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' });
      api.getMapPins.mockResolvedValue({ data: { pins: [], truncated: false } });
      await renderMap();
      expect(await screen.findByText(en.map.browsing.needArea)).toBeTruthy();
      expect(screen.queryByTestId('hello-p1')).toBeNull();
    });

    it('shows a retryable error instead of a fake map when the server fails', async () => {
      api.getViewport.mockResolvedValueOnce({ error: { message: 'Offline' } } as never);
      await renderMap();
      expect(await screen.findByText('Offline')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('retry-button'));
      expect(await screen.findByTestId('hello-p1')).toBeTruthy();
      expect(api.getViewport).toHaveBeenCalledTimes(2);
    });

    it('Hello Hangouts filter asks the viewport for hangout pins only', async () => {
      await renderMap();
      await screen.findByTestId('hello-p1');
      await fireEvent.press(screen.getByText(en.map.filters.helloHangouts));
      await waitFor(() => expect(api.getViewport).toHaveBeenCalledTimes(2));
      expect(api.getViewport.mock.calls[1][0].kinds).toEqual(['hangout']);
      expect(screen.getByText(en.map.filters.helloHangouts).parent?.props.accessibilityState.selected).toBe(true);
    });

    it('Happening filter asks for Hootzas, org events, Hollas and Discounts', async () => {
      await renderMap();
      await screen.findByTestId('hello-p1');
      await fireEvent.press(screen.getByText(en.map.filters.happening));
      await waitFor(() => expect(api.getViewport).toHaveBeenCalledTimes(2));
      expect(api.getViewport.mock.calls[1][0].kinds).toEqual(['hootza', 'org_event', 'holla', 'discount']);
    });

    it('This year asks the server for Hello and Hello Hangout pins since 1 January', async () => {
      await renderMap();
      await screen.findByTestId('hello-p1');
      await fireEvent.press(screen.getByText(en.map.filters.thisYear));
      await waitFor(() => expect(api.getViewport).toHaveBeenCalledTimes(2));
      const last = api.getViewport.mock.calls[1][0];
      expect(last.since).toBe(new Date(new Date().getFullYear(), 0, 1).toISOString());
      expect(last.kinds).toEqual(['hello', 'hangout']);
    });

    it('Mine asks for this person’s own pins only', async () => {
      await renderMap();
      await screen.findByTestId('hello-p1');
      await fireEvent.press(screen.getByText(en.map.filters.mine));
      await waitFor(() => expect(api.getMapPins).toHaveBeenCalledWith({ scope: 'mine' }));
    });

    it('says when a viewport was cut to the most recent pins', async () => {
      api.getViewport.mockResolvedValue(viewport({ truncated: { hello: true } }));
      await renderMap();
      expect(await screen.findByText(en.map.browsing.truncated)).toBeTruthy();
    });

    it('draws the honest basemap note when the provider is not configured', async () => {
      await renderMap();
      expect(await screen.findByTestId('basemap-note')).toHaveTextContent(en.map.browsing.basemapNotConfigured);
      expect(api.getMapProviderStatus).toHaveBeenCalled();
    });

    it('draws no basemap note when the provider is configured', async () => {
      api.getMapProviderStatus.mockResolvedValue({ data: { provider: 'x', geocoding: { configured: true }, basemap: { configured: true, renderer: 'grid' } } });
      await renderMap();
      await screen.findByTestId('hello-p1');
      expect(screen.queryByTestId('basemap-note')).toBeNull();
    });

    it('displays coach mark with exact copy', async () => {
      await renderMap();
      const coachMark = await screen.findByText(en.map.browsing.coachMark);
      expect(coachMark.props.children).toBe('Pins are people. Squares are places. Rings are happening now.');
    });

    it('search bar has accessibilityRole button', async () => {
      await renderMap();
      expect(screen.getByTestId('search-bar').props.accessibilityRole).toBe('button');
    });

    it('filter chips have accessibilityRole button', async () => {
      await renderMap();
      const nearMeChip = (await screen.findByText(en.map.filters.nearMe)).parent;
      expect(nearMeChip?.props.accessibilityRole).toBe('button');
    });

    it('does NOT state a distance anywhere (RULES 8.12)', async () => {
      const { container } = await renderMap();
      await screen.findByTestId('hello-p1');
      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });

  describe('TAPPING PINS AND CLUSTERS', () => {
    it('a Hello Hangout square opens its directory page', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('hangout-hh1'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/directory/[id]', params: { id: 'hh1' } });
    });

    it('a Holla opens its Hello Hangout page at the post', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('holla-ho1'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hangout)/directory/[id]', params: { id: 'hh1', postId: 'post-7' } });
    });

    it('a Hootza ring opens that Hootza', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('hootza-z1'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hootzas)/[id]', params: { id: 'z1' } });
    });

    it('a cluster with few members lists them so they can be reached', async () => {
      const members = [viewportItems[2], viewportItems[3]];
      api.getViewport.mockResolvedValue(viewport({
        items: [],
        clusters: [{ count: 2, lat: 36.16, lng: -86.78, bounds: { minLat: 36.158, maxLat: 36.165, minLng: -86.78, maxLng: -86.775 }, members }],
      }));
      await renderMap();
      const cluster = await screen.findByTestId('cluster-0');
      expect(cluster.props.accessibilityLabel).toBe('2 things here. Open them.');
      await fireEvent.press(cluster);
      const list = await screen.findByTestId('cluster-list');
      expect(list).toHaveTextContent(/Ridge Tavern.*Hello Hangout.*Trivia Night.*Hootza/);
      await fireEvent.press(screen.getByText('Trivia Night'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hootzas)/[id]', params: { id: 'z1' } });
    });

    it('a large cluster zooms in: loads the viewport again for the cluster’s own bounds', async () => {
      const bounds = { minLat: 36.29, maxLat: 36.31, minLng: -86.6, maxLng: -86.58 }; // away from the device position
      api.getViewport.mockResolvedValueOnce(viewport({ items: [], clusters: [{ count: 40, lat: 36.16, lng: -86.78, bounds, members: null }] }));
      await renderMap();
      await fireEvent.press(await screen.findByTestId('cluster-0'));
      await waitFor(() => expect(api.getViewport).toHaveBeenCalledTimes(2));
      const zoomed = api.getViewport.mock.calls[1][0].bbox;
      expect(zoomed.maxLat - zoomed.minLat).toBeLessThan(0.08);
      expect((zoomed.minLat + zoomed.maxLat) / 2).toBeCloseTo(36.3, 2); // not re-centred on the device
      expect(zoomed.minLat).toBeLessThanOrEqual(bounds.minLat);
      expect(zoomed.maxLat).toBeGreaterThanOrEqual(bounds.maxLat);
    });

    it('"See this area" opens the place page with the viewport as its box, never a distance', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('see-area'));
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/map/place',
        params: expect.objectContaining({ label: en.map.browsing.thisArea, minLat: expect.any(String), maxLng: expect.any(String) }),
      });
    });
  });

  describe('OPEN TO HELLOS', () => {
    it('reads the saved choice and switches it on through PUT /map/open-to-hellos', async () => {
      await renderMap();
      const sw = await screen.findByTestId('open-to-hellos-switch');
      await waitFor(() => expect(api.getOpenToHellos).toHaveBeenCalled());
      await fireEvent(sw, 'valueChange', true);
      await waitFor(() => expect(api.setOpenToHellos).toHaveBeenCalledWith(true));
      expect(await screen.findByText(en.map.open.notSwitchedOn)).toBeTruthy();
    });

    it('says nothing extra when discovery is active', async () => {
      api.getOpenToHellos.mockResolvedValue(openState({ open: true, discoveryActive: true }));
      await renderMap();
      await screen.findByTestId('hello-p1');
      await waitFor(() => expect(screen.getByTestId('open-to-hellos-switch').props.value).toBe(true));
      expect(screen.queryByText(en.map.open.notSwitchedOn)).toBeNull();
    });

    it('keeps the switch off when the server cannot save it', async () => {
      api.setOpenToHellos.mockResolvedValue({ error: { message: 'x' } } as never);
      await renderMap();
      const sw = await screen.findByTestId('open-to-hellos-switch');
      await waitFor(() => expect(api.getOpenToHellos).toHaveBeenCalled());
      await fireEvent(sw, 'valueChange', true);
      await waitFor(() => expect(api.setOpenToHellos).toHaveBeenCalled());
      expect(screen.getByTestId('open-to-hellos-switch').props.value).toBe(false);
    });
  });

  describe('SEARCH STATE', () => {
    it('transitions to search state when search bar tapped', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      expect(await screen.findByText(en.map.search.cancel)).toBeTruthy();
    });

    it('shows Places (with the provider gap) and Hello Hangouts sections', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      expect(await screen.findByText(en.map.search.sectionsPlaces)).toBeTruthy();
      expect(screen.getByText(en.map.search.placesUnavailable)).toBeTruthy();
      expect(screen.getByText(en.map.search.sectionsHangouts)).toBeTruthy();
    });

    it('asks for at least two letters before searching', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'R');
      expect(await screen.findByText(en.map.search.typeMore)).toBeTruthy();
      expect(api.searchMap).not.toHaveBeenCalled();
    });

    it('finds Hello Hangouts from the server, never people, and marks Founding', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Ridge');
      expect(await screen.findByText('Ridge Tavern')).toBeTruthy();
      expect(api.searchMap).toHaveBeenCalledTimes(1);
      const [q, bias] = api.searchMap.mock.calls[0];
      expect(q).toBe('Ridge');
      expect(bias!.lat).toBeCloseTo(HERE.latitude, 2);
      expect(bias!.lng).toBeCloseTo(HERE.longitude, 2);
      expect(screen.getByText('12 Bell St')).toBeTruthy();
      expect(screen.getByLabelText(en.map.search.founding)).toBeTruthy();
    });

    it('says when nothing matches', async () => {
      api.searchMap.mockResolvedValue(fullSearch({ hangouts: [] }));
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Zzz');
      expect(await screen.findByText(en.map.search.noResults)).toBeTruthy();
    });

    it('lists Hootza results and opens the Hootza', async () => {
      api.searchMap.mockResolvedValue(fullSearch({
        hangouts: [],
        hootzas: [{ id: 'z1', title: 'Trivia Night', locationName: 'Bell St Pub', lat: 36.1, lng: -86.7, kind: 'hootza', startsAt: '2026-10-05T19:00:00Z' }],
      }));
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Trivia');
      expect(await screen.findByText(en.map.search.sectionsHootzas)).toBeTruthy();
      expect(screen.getByText('Bell St Pub')).toBeTruthy();
      await fireEvent.press(screen.getByText('Trivia Night'));
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(hootzas)/[id]', params: { id: 'z1' } });
    });

    it('when the Places provider is configured, lists places and re-frames the map on the chosen one', async () => {
      api.searchMap.mockResolvedValue(fullSearch({
        hangouts: [],
        places: { configured: true, results: [{ name: 'Nashville', address: 'Tennessee', lat: 36.17, lng: -86.78 }], error: null },
      }));
      await renderMap();
      await screen.findByTestId('hello-p1');
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Nash');
      await fireEvent.press(await screen.findByText('Nashville'));
      await waitFor(() => expect(api.getViewport).toHaveBeenCalledTimes(2));
      const box = api.getViewport.mock.calls[1][0].bbox;
      expect((box.minLat + box.maxLat) / 2).toBeCloseTo(36.17, 3);
      expect((box.minLng + box.maxLng) / 2).toBeCloseTo(-86.78, 3);
      expect(await screen.findByText(en.map.browsing.coachMark)).toBeTruthy();
    });

    it('says the place search did not answer when the provider errors, and offers retry on a failed search', async () => {
      api.searchMap.mockResolvedValueOnce(fullSearch({ places: { configured: true, results: [], error: 'provider_error' } }));
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Nash');
      expect(await screen.findByText(en.map.search.placesError)).toBeTruthy();
      api.searchMap.mockResolvedValueOnce({ error: { message: 'Offline' } } as never);
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Nashv');
      expect(await screen.findByText(new RegExp(`Offline ${en.map.common.retry}`))).toBeTruthy();
    });

    // VERTICAL-BUILD-06 replacement (for coordinator review): this expected the area
    // view (/map/place). RULES §17.24 "everything routes through the directory" — a
    // chosen Hello Hangout now opens its directory page, by id. The Recent check is kept.
    it('opens the directory page for a chosen Hello Hangout and keeps it in Recent', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Ridge');
      await fireEvent.press(await screen.findByTestId('hangout-result-hh1'));
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(hangout)/directory/[id]',
        params: { id: 'hh1' },
      });
      await fireEvent.press(screen.getByTestId('search-bar'));
      expect(await screen.findByText(en.map.search.sectionsRecent)).toBeTruthy();
      expect(screen.getByTestId('hangout-result-hh1')).toBeTruthy();
    });

    it('Cancel button returns to browsing state', async () => {
      await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.press(await screen.findByText(en.map.search.cancel));
      expect(await screen.findByText(en.map.browsing.coachMark)).toBeTruthy();
    });

    it('does NOT state a distance in search results (RULES 8.12)', async () => {
      const { container } = await renderMap();
      await fireEvent.press(screen.getByTestId('search-bar'));
      await fireEvent.changeText(screen.getByTestId('map-search-input'), 'Ridge');
      await screen.findByText('Ridge Tavern');
      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });
  });

  describe('PIN SHEET STATE', () => {
    it('shows both names from the server, where, the Hello Hangout and when', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('hello-p1'));
      expect(await screen.findByTestId('pin-names')).toHaveTextContent('Maya and Jordan');
      expect(api.getPinDetail).toHaveBeenCalledWith('p1');
      expect(screen.getByText(en.map.pinSheet.labelWhere)).toBeTruthy();
      expect(screen.getByText('Ridge Tavern, Nashville')).toBeTruthy();
      expect(screen.getByText(en.map.pinSheet.labelHangout)).toBeTruthy();
      expect(screen.getByText(en.map.pinSheet.labelWhen)).toBeTruthy();
      expect(screen.getByText(new Date(metAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }))).toBeTruthy();
    });

    it('displays permanence note with exact copy and no removal button (§10.11)', async () => {
      await renderMap();
      await fireEvent.press(await screen.findByTestId('hello-p1'));
      const permanence = await screen.findByText(en.map.pinSheet.permanence);
      expect(permanence.props.children).toBe('This pin is permanent. Both of them chose to put it here.');
      expect(screen.queryByText(/delete|remove/i)).toBeNull();
    });

    it('says the pin is not on the map when the server has no revealed pin', async () => {
      api.getPinDetail.mockResolvedValueOnce({ error: { message: 'Pin not found', status: 404 } } as never);
      await renderMap();
      await fireEvent.press(await screen.findByTestId('hello-p2'));
      expect(await screen.findByText(en.map.pinSheet.notAvailable)).toBeTruthy();
    });
  });

  describe('PLACE PAGE', () => {
    beforeEach(() => setParams(areaParams));

    it('displays the area title from its real source', async () => {
      await render(<PlaceDetailScreen />);
      expect(await screen.findByTestId('place-title')).toHaveTextContent('Ridge Tavern');
    });

    it('shows the server tallies as Waverly plus a number (§19.1)', async () => {
      await render(<PlaceDetailScreen />);
      expect(await screen.findByText('1,204')).toBeTruthy();
      expect(screen.getByText('31')).toBeTruthy(); // This month
      expect(screen.getByText('18')).toBeTruthy(); // Hello Hangouts
      expect(screen.getByText(en.map.place.statsThisMonth)).toBeTruthy();
      expect(screen.getByText(en.map.place.statsHangouts)).toBeTruthy();
      const [box] = api.getAreaSummary.mock.calls[0];
      expect(box).toEqual({ minLat: 36.155, maxLat: 36.175, minLng: -86.79, maxLng: -86.77 });
    });

    it('shows no number at zero: Waverly alone (§19.1)', async () => {
      api.getAreaSummary.mockResolvedValueOnce({ data: { area: { hellos: 3, thisMonth: 0, helloHangouts: 0, recent: [] } } });
      await render(<PlaceDetailScreen />);
      expect(await screen.findByText('3')).toBeTruthy();
      expect(screen.queryByText('0')).toBeNull();
    });

    it('displays "Most recent" pins that open the pin sheet', async () => {
      await render(<PlaceDetailScreen />);
      expect(await screen.findByText(en.map.place.sectionRecent)).toBeTruthy();
      await fireEvent.press(screen.getByTestId('recent-p1'));
      expect(await screen.findByTestId('pin-names')).toHaveTextContent('Maya and Jordan');
    });

    it('goes to "empty here" when the server reports no pins in the area', async () => {
      api.getAreaSummary.mockResolvedValueOnce({ data: { area: { hellos: 0, thisMonth: 0, helloHangouts: 0, recent: [] } } });
      await render(<PlaceDetailScreen />);
      await screen.findByTestId('place-title');
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/map/empty',
        params: expect.objectContaining({ locationName: 'Ridge Tavern', minLat: '36.155' }),
      });
    });

    it('shows a retryable error, never fabricated tallies', async () => {
      api.getAreaSummary.mockResolvedValueOnce({ error: { message: 'Offline' } } as never);
      await render(<PlaceDetailScreen />);
      expect(await screen.findByTestId('place-retry')).toHaveTextContent(/Offline/);
      expect(screen.queryByText('1,204')).toBeNull();
    });
  });

  describe('EMPTY STATE', () => {
    beforeEach(() => setParams({ locationName: 'Nashua, New Hampshire' }));

    it('displays empty state title', async () => {
      await render(<EmptyStateScreen />);
      expect(await screen.findByText(en.map.empty.title)).toBeTruthy();
    });

    it('displays empty state body with city name interpolated', async () => {
      await render(<EmptyStateScreen />);

      expect(
        await screen.findByText(
          "Somebody has to be first. If you're in Nashua, New Hampshire, that's a fun thing to be."
        )
      ).toBeTruthy();
    });

    it('empty state body encourages being first, never negative framing', async () => {
      await render(<EmptyStateScreen />);

      const bodyText = await screen.findByText(/Somebody has to be first/);
      expect(bodyText.props.children).toContain('fun thing to be');
      // No negation stacking
      expect(bodyText.props.children).not.toContain("don't");
      expect(bodyText.props.children).not.toContain("hasn't");
      expect(bodyText.props.children).not.toContain('nobody');
    });

    it('shows "Turn on Hellos here" disabled until the saved choice has loaded', async () => {
      api.getOpenToHellos.mockReturnValue(new Promise(() => undefined) as never);
      await render(<EmptyStateScreen />);
      const turnOnButton = screen.getByTestId('turn-on-hello-button');
      expect(turnOnButton.props.accessibilityRole).toBe('button');
      expect(turnOnButton).toBeDisabled();
      const helloText = await screen.findByText('Hellos');
      expect(helloText.props.style).toEqual(expect.objectContaining({ fontFamily: 'Dreaming' }));
    });

    it('turns Hellos on through PUT /map/open-to-hellos and says discovery is not switched on yet', async () => {
      await render(<EmptyStateScreen />);
      await waitFor(() => expect(screen.getByTestId('turn-on-hello-button')).toBeEnabled());
      await fireEvent.press(screen.getByTestId('turn-on-hello-button'));
      await waitFor(() => expect(api.setOpenToHellos).toHaveBeenCalledWith(true));
      expect(await screen.findByText(en.map.open.notSwitchedOn)).toBeTruthy();
      expect(screen.getByTestId('turn-on-hello-button')).toBeDisabled();
    });

    it('says "You\'re open to Hellos here" when discovery is active', async () => {
      api.getOpenToHellos.mockResolvedValue(openState({ open: true, discoveryActive: true }));
      await render(<EmptyStateScreen />);
      expect(await screen.findByText(en.map.empty.nowOpen)).toBeTruthy();
    });

    it('says it failed, and stays off, when the server refuses', async () => {
      api.setOpenToHellos.mockResolvedValue({ error: { message: 'x' } } as never);
      await render(<EmptyStateScreen />);
      await waitFor(() => expect(screen.getByTestId('turn-on-hello-button')).toBeEnabled());
      await fireEvent.press(screen.getByTestId('turn-on-hello-button'));
      expect(await screen.findByText(en.map.common.failed)).toBeTruthy();
      expect(screen.getByTestId('turn-on-hello-button')).toBeEnabled();
    });
  });

  describe('ACCESSIBILITY', () => {
    it('filter chips have accessibilityState with selected', async () => {
      await renderMap();
      await screen.findByTestId('hello-p1');
      const nearMeChip = (await screen.findByText(en.map.filters.nearMe)).parent;
      expect(nearMeChip?.props.accessibilityState).toBeDefined();
      expect(nearMeChip?.props.accessibilityState.selected).toBe(true); // Default active
    });

    it('pins and Hello Hangouts are labelled buttons', async () => {
      await renderMap();
      expect((await screen.findByTestId('hello-p1')).props.accessibilityLabel).toBe(en.map.browsing.yourPinLabel);
      expect(screen.getByTestId('hangout-hh1').props.accessibilityRole).toBe('button');
    });
  });

  describe('COPY VALIDATION', () => {
    it('NO hardcoded strings - all copy from i18n', async () => {
      await renderMap();

      // Spot check that key strings are from i18n
      expect(await screen.findByText(en.map.search.placeholder)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.nearMe)).toBeTruthy();
      expect(await screen.findByText(en.map.browsing.coachMark)).toBeTruthy();

      // Tap pin to show pin sheet content
      await fireEvent.press(await screen.findByTestId('hello-p1'));
      expect(await screen.findByText(en.map.pinSheet.permanence)).toBeTruthy();
    });

    it('NEVER says "Hangout" without "Hello" prefix', async () => {
      const { container } = await renderMap();
      await screen.findByTestId('hello-p1');
      const text = JSON.stringify(container);

      // Should find "Hello Hangouts" but never bare "Hangout"
      expect(text).toContain('Hello Hangouts');

      // Check for bare "Hangout" not preceded by "Hello"
      const bareHangout = text.match(/(?<!Hello )\bHangout\b/);
      expect(bareHangout).toBeNull();
    });

    it('NEVER uses "Hi" instead of "Hello"', async () => {
      const { container } = await renderMap();
      const text = JSON.stringify(container);

      expect(text).not.toContain('"Hi"');
      expect(text).not.toContain("'Hi'");
      // Allow "This" but not bare "Hi"
      const bareHi = text.match(/\bHi\b(?!s)/);
      expect(bareHi).toBeNull();
    });
  });

  describe('DISTANCE PROHIBITION (RULES 8.12)', () => {
    it('NEVER states a distance in browsing state', async () => {
      const { container } = await renderMap();
      await screen.findByTestId('hello-p1');
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
      expect(text.toLowerCase()).not.toMatch(/nearby/);
    });

    it('NEVER states a distance in pin sheet', async () => {
      const { container } = await renderMap();
      await fireEvent.press(await screen.findByTestId('hello-p1'));
      await screen.findByTestId('pin-names');
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });

    it('NEVER states a distance in place page', async () => {
      setParams(areaParams);
      const { container } = await render(<PlaceDetailScreen />);
      await screen.findByText('1,204');
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });

    it('NEVER states a distance in empty state', async () => {
      setParams({ locationName: 'Nashua, New Hampshire' });

      const { container } = await render(<EmptyStateScreen />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });
  });
});
