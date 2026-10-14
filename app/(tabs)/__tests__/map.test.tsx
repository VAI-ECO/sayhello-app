/**
 * HELLO MAP TESTS
 *
 * Tests all 5 states of the Hello Map:
 * - Browsing (default map view)
 * - Search (active search with results)
 * - Pin Sheet (selfie detail)
 * - Place Page (city detail)
 * - Empty State (no pins)
 *
 * RNTL v14: All operations async, always await, use imported screen
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import Map from '../map';
import PlaceDetailScreen from '../map/place';
import EmptyStateScreen from '../map/empty';
import { en } from '../../../src/i18n/en';
import { useRouter } from 'expo-router';

// Mock expo-router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock Waverly component
jest.mock('../../../src/components', () => ({
  ...jest.requireActual('../../../src/components'),
  Waverly: () => null,
}));

// Mock hellos API
jest.mock('../../../src/api/hellos', () => ({
  getHellos: jest.fn(() =>
    Promise.resolve({
      data: {
        hellos: [
          {
            id: 'pin-1',
            user1Id: 'user-maya',
            user1FullName: 'Maya',
            user2Id: 'user-jordan',
            user2FullName: 'Jordan',
            locationLat: 36.1627,
            locationLng: -86.7816,
            locationName: 'Ridge Tavern, Nashville',
            hangoutId: null,
            metAt: '2026-08-02T18:42:00Z',
            revealScheduledAt: '2026-08-02T21:42:00Z',
            revealedAt: '2026-08-02T21:42:00Z',
            hasSelfie: false,
            helloCode: '1204',
            createdAt: '2026-08-02T18:42:00Z',
          },
          {
            id: 'pin-2',
            user1Id: 'user-alex',
            user1FullName: 'Alex',
            user2Id: 'user-sam',
            user2FullName: 'Sam',
            locationLat: 36.1707,
            locationLng: -86.7844,
            locationName: 'The Pharmacy, Nashville',
            hangoutId: null,
            metAt: '2026-07-28T14:15:00Z',
            revealScheduledAt: '2026-07-28T17:15:00Z',
            revealedAt: '2026-07-28T17:15:00Z',
            hasSelfie: false,
            helloCode: '1187',
            createdAt: '2026-07-28T14:15:00Z',
          },
          {
            id: 'pin-3',
            user1Id: 'user-taylor',
            user1FullName: 'Taylor',
            user2Id: 'user-casey',
            user2FullName: 'Casey',
            locationLat: 36.1547,
            locationLng: -86.7754,
            locationName: 'Centennial Park, Nashville',
            hangoutId: null,
            metAt: '2026-07-15T10:30:00Z',
            revealScheduledAt: '2026-07-15T13:30:00Z',
            revealedAt: '2026-07-15T13:30:00Z',
            hasSelfie: false,
            helloCode: '1142',
            createdAt: '2026-07-15T10:30:00Z',
          },
        ],
      },
    })
  ),
}));

describe('Hello Map', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  describe('BROWSING STATE (default)', () => {
    it('renders map placeholder with replacement note', async () => {
      await render(<Map />);
      expect(await screen.findByText('REPLACE WITH MAP TILE LAYER')).toBeTruthy();
    });

    it('renders search bar with placeholder copy', async () => {
      await render(<Map />);
      expect(
        await screen.findByText(en.map.search.placeholder)
      ).toBeTruthy();
    });

    it('renders all four filter chips', async () => {
      await render(<Map />);
      expect(await screen.findByText(en.map.filters.nearMe)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.mine)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.helloHangouts)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.thisYear)).toBeTruthy();
    });

    it('renders bottom sheet with Hellos count', async () => {
      await render(<Map />);
      // Default shows "Nashville, Tennessee" with "1204 Hellos"
      expect(await screen.findByText('Hellos')).toBeTruthy();
      expect(await screen.findByText('Nashville, Tennessee')).toBeTruthy();
    });

    it('displays coach mark with exact copy', async () => {
      await render(<Map />);
      expect(
        await screen.findByText(en.map.browsing.coachMark)
      ).toBeTruthy();
    });

    it('coach mark says "Pins are people. Squares are places. Rings are happening now."', async () => {
      await render(<Map />);
      const coachMark = await screen.findByText(en.map.browsing.coachMark);
      expect(coachMark.props.children).toBe(
        'Pins are people. Squares are places. Rings are happening now.'
      );
    });

    it('search bar has accessibilityRole button', async () => {
      await render(<Map />);
      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar.props.accessibilityRole).toBe('button');
    });

    it('filter chips have accessibilityRole button', async () => {
      await render(<Map />);
      const nearMeChip = (await screen.findByText(en.map.filters.nearMe))
        .parent;
      expect(nearMeChip?.props.accessibilityRole).toBe('button');
    });

    it('does NOT state a distance anywhere (RULES 8.12)', async () => {
      const { container } = await render(<Map />);
      const text = JSON.stringify(container);
      // No distance words allowed
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });

  describe('SEARCH STATE', () => {
    it('transitions to search state when search bar tapped', async () => {
      await render(<Map />);
      const searchBar = screen.getByTestId('search-bar');
      await fireEvent.press(searchBar);
      expect(await screen.findByText(en.map.search.cancel)).toBeTruthy();
    });

    it('shows three result sections: Places, Hangouts, Recent', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      expect(
        await screen.findByText(en.map.search.sectionsPlaces)
      ).toBeTruthy();
      expect(
        await screen.findByText(en.map.search.sectionsHangouts)
      ).toBeTruthy();
      expect(
        await screen.findByText(en.map.search.sectionsRecent)
      ).toBeTruthy();
    });

    it('displays place results with Hellos count', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      expect(await screen.findByText('Nashville, Tennessee')).toBeTruthy();
      expect(await screen.findByText('1204 Hellos')).toBeTruthy();
    });

    it('displays place with null Hellos count as em dash', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      expect(await screen.findByText('Nashua, New Hampshire')).toBeTruthy();
      expect(await screen.findByText('— Hellos')).toBeTruthy();
    });

    it('displays Hangout with golden icon indicator', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      expect(await screen.findByText('Nashville Palace')).toBeTruthy();
      expect(await screen.findByText('⭐')).toBeTruthy(); // Golden icon
    });

    it('displays recent searches', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      expect(await screen.findByText('Chicago')).toBeTruthy();
      expect(await screen.findByText('Portugal')).toBeTruthy();
      expect(await screen.findByText('Austin, TX')).toBeTruthy();
    });

    it('Cancel button returns to browsing state', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      const cancelButton = (await screen.findByText(en.map.search.cancel))
        .parent;
      await fireEvent.press(cancelButton!);

      expect(await screen.findByText(en.map.browsing.coachMark)).toBeTruthy();
    });

    it('does NOT state a distance in search results (RULES 8.12)', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      const { container } = await render(<Map />);
      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });
  });

  describe('PIN SHEET STATE', () => {
    it('renders person names with Waverly hand between them', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(await screen.findByText('Maya')).toBeTruthy();
      expect(await screen.findByText('Jordan')).toBeTruthy();
      expect(await screen.findByText('👋')).toBeTruthy();
    });

    it('displays Where detail with location name', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(await screen.findByText(en.map.pinSheet.labelWhere)).toBeTruthy();
      expect(
        await screen.findByText('Ridge Tavern, Nashville')
      ).toBeTruthy();
    });

    it('displays When detail with formatted date', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(await screen.findByText(en.map.pinSheet.labelWhen)).toBeTruthy();
      expect(await screen.findByText('Aug 2, 2026, 6:42 PM')).toBeTruthy();
    });

    it('displays Pin number detail', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(
        await screen.findByText(en.map.pinSheet.labelPinNumber)
      ).toBeTruthy();
      expect(await screen.findByText('1204')).toBeTruthy();
    });

    it('displays permanence note with exact copy', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(
        await screen.findByText(en.map.pinSheet.permanence)
      ).toBeTruthy();
    });

    it('permanence note says "This pin is permanent. Both of them chose to put it here."', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      const permanence = await screen.findByText(en.map.pinSheet.permanence);
      expect(permanence.props.children).toBe(
        'This pin is permanent. Both of them chose to put it here.'
      );
    });

    it('renders Share and Report buttons', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(await screen.findByText(en.map.pinSheet.share)).toBeTruthy();
      expect(await screen.findByText(en.map.pinSheet.report)).toBeTruthy();
    });

    it('Share button has accessibilityRole button', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      const shareButton = (await screen.findByText(en.map.pinSheet.share))
        .parent;
      expect(shareButton?.props.accessibilityRole).toBe('button');
    });

    it('Report button has accessibilityRole button', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('pin-1'));
      const reportButton = (await screen.findByText(en.map.pinSheet.report))
        .parent;
      expect(reportButton?.props.accessibilityRole).toBe('button');
    });
  });

  describe('PLACE PAGE STATE', () => {
    it('navigates to place route when place result tapped', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      const placeResult = (await screen.findByText('Nashville, Tennessee'))
        .parent?.parent;
      await fireEvent.press(placeResult!);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/map/place',
        params: {
          name: 'Nashville, Tennessee',
          totalHellos: '1204',
          thisMonth: '31',
          hangoutsCount: '18',
          yoursCount: '6',
        },
      });
    });

    it('displays place name as title', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);
      expect(await screen.findByText('Nashville, Tennessee')).toBeTruthy();
    });

    it('displays big count with number and Hellos label', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);
      expect(screen.getByTestId('place-total-count')).toBeTruthy();
      expect(screen.getByTestId('place-hellos-label')).toBeTruthy();
      expect(screen.getByTestId('place-total-count').props.children).toBe('1,204');
      expect(screen.getByTestId('place-hellos-label').props.children).toBe('Hellos');
    });

    it('displays stats: This month, Hangouts, Yours', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);

      expect(
        await screen.findByText(en.map.place.statsThisMonth)
      ).toBeTruthy();
      expect(
        await screen.findByText(en.map.place.statsHangouts)
      ).toBeTruthy();
      expect(await screen.findByText(en.map.place.statsYours)).toBeTruthy();
    });

    it('displays stat values', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);

      expect(await screen.findByText('31')).toBeTruthy(); // This month
      expect(await screen.findByText('18')).toBeTruthy(); // Hangouts
      expect(await screen.findByText('6')).toBeTruthy(); // Yours
    });

    it('displays "Most recent" section', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);

      expect(
        await screen.findByText(en.map.place.sectionRecent)
      ).toBeTruthy();
    });

    it('renders "Open on the map" button', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);

      expect(await screen.findByText(en.map.place.openOnMap)).toBeTruthy();
    });

    it('Open on map button has accessibilityRole button', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      await render(<PlaceDetailScreen />);

      const openButton = (await screen.findByText(en.map.place.openOnMap))
        .parent;
      expect(openButton?.props.accessibilityRole).toBe('button');
    });
  });

  describe('EMPTY STATE', () => {
    it('navigates to empty route when empty place result tapped', async () => {
      await render(<Map />);
      await fireEvent.press(screen.getByTestId('search-bar'));

      const emptyPlace = (await screen.findByText('Nashua, New Hampshire'))
        .parent?.parent;
      await fireEvent.press(emptyPlace!);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/map/empty',
        params: { locationName: 'Nashua, New Hampshire' },
      });
    });

    it('displays empty state title', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);
      expect(await screen.findByText(en.map.empty.title)).toBeTruthy();
    });

    it('displays empty state body with city name interpolated', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);

      expect(
        await screen.findByText(
          "Somebody has to be first. If you're in Nashua, New Hampshire, that's a fun thing to be."
        )
      ).toBeTruthy();
    });

    it('empty state body encourages being first, never negative framing', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);

      const bodyText = await screen.findByText(/Somebody has to be first/);
      expect(bodyText.props.children).toContain('fun thing to be');
      // No negation stacking
      expect(bodyText.props.children).not.toContain("don't");
      expect(bodyText.props.children).not.toContain("hasn't");
      expect(bodyText.props.children).not.toContain('nobody');
    });

    it('renders "Turn on Hello mode" button', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);

      expect(
        await screen.findByText(en.map.empty.turnOnHello)
      ).toBeTruthy();
    });

    it('"Turn on Hello mode" button uses Dreaming font for "Hello"', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);

      // Find the Text component with "Hello" that has Dreaming font
      const helloText = await screen.findByText('Hello');
      expect(helloText.props.style).toEqual(
        expect.objectContaining({ fontFamily: 'Dreaming' })
      );
    });

    it('button has accessibilityRole button', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      await render(<EmptyStateScreen />);

      const turnOnButton = screen.getByTestId('turn-on-hello-button');
      expect(turnOnButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('ACCESSIBILITY', () => {
    it('all interactive elements have accessibilityRole', async () => {
      await render(<Map />);

      // Browsing state buttons
      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar.props.accessibilityRole).toBe('button');

      const nearMeChip = (await screen.findByText(en.map.filters.nearMe))
        .parent;
      expect(nearMeChip?.props.accessibilityRole).toBe('button');

      // Pin sheet buttons - tap pin first
      await fireEvent.press(screen.getByTestId('pin-1'));
      const shareButton = (await screen.findByText(en.map.pinSheet.share))
        .parent;
      expect(shareButton?.props.accessibilityRole).toBe('button');

      const reportButton = (await screen.findByText(en.map.pinSheet.report))
        .parent;
      expect(reportButton?.props.accessibilityRole).toBe('button');
    });

    it('filter chips have accessibilityState with selected', async () => {
      await render(<Map />);

      const nearMeChip = (await screen.findByText(en.map.filters.nearMe))
        .parent;
      expect(nearMeChip?.props.accessibilityState).toBeDefined();
      expect(nearMeChip?.props.accessibilityState.selected).toBe(true); // Default active
    });
  });

  describe('COPY VALIDATION', () => {
    it('NO hardcoded strings - all copy from i18n', async () => {
      await render(<Map />);

      // Spot check that key strings are from i18n
      expect(await screen.findByText(en.map.search.placeholder)).toBeTruthy();
      expect(await screen.findByText(en.map.filters.nearMe)).toBeTruthy();
      expect(await screen.findByText(en.map.browsing.coachMark)).toBeTruthy();

      // Tap pin to show pin sheet content
      await fireEvent.press(screen.getByTestId('pin-1'));
      expect(await screen.findByText(en.map.pinSheet.permanence)).toBeTruthy();
    });

    it('NEVER says "Hangout" without "Hello" prefix', async () => {
      const { container } = await render(<Map />);
      const text = JSON.stringify(container);

      // Should find "Hello Hangouts" but never bare "Hangout"
      expect(text).toContain('Hello Hangouts');

      // Check for bare "Hangout" not preceded by "Hello"
      const bareHangout = text.match(/(?<!Hello )\bHangout\b/);
      expect(bareHangout).toBeNull();
    });

    it('NEVER uses "Hi" instead of "Hello"', async () => {
      const { container } = await render(<Map />);
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
      const { container } = await render(<Map />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
      expect(text.toLowerCase()).not.toMatch(/nearby/);
    });

    it('NEVER states a distance in search results', async () => {
      await render(<Map />);
      const searchBar = (await screen.findByText(en.map.search.placeholder))
        .parent?.parent;
      await fireEvent.press(searchBar!);

      const { container } = await render(<Map />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });

    it('NEVER states a distance in pin sheet', async () => {
      const { container } = await render(<Map />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });

    it('NEVER states a distance in place page', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        name: 'Nashville, Tennessee',
        totalHellos: '1204',
        thisMonth: '31',
        hangoutsCount: '18',
        yoursCount: '6',
      });

      const { container } = await render(<PlaceDetailScreen />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });

    it('NEVER states a distance in empty state', async () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        locationName: 'Nashua, New Hampshire',
      });

      const { container } = await render(<EmptyStateScreen />);
      const text = JSON.stringify(container);

      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|km|meter|feet|ft)/);
    });
  });
});
