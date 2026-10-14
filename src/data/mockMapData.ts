/**
 * MOCK MAP DATA
 *
 * ⚠️ THIS IS TEMPORARY MOCK DATA
 * Replace with actual API calls when backend is ready.
 *
 * Map data includes:
 * - Hello pins (people who said Hello - permanent, survive account deletion)
 * - Clusters (grouped pins)
 * - Place search results (cities, states, countries)
 * - Hello Hangout search results
 * - Recent searches
 */

export type IdentityColor =
  | '#FB8C00' // Orange
  | '#FDD835' // Yellow
  | '#546E7A' // Slate
  | '#00ACC1' // Cyan
  | '#8E24AA' // Purple
  | '#D81B60' // Magenta
  | '#0B1F5C' // DeepNavy
  | '#6B3F1D' // Brown
  | '#101010' // Black
  | '#00893F'; // Emerald

/**
 * A Hello pin - permanent marker where two people said Hello
 * Pins survive account deletion (RULES 10.8, 10.10)
 */
export interface HelloPin {
  id: string;
  person1Name: string;
  person2Name: string;
  location: {
    lat: number;
    lng: number;
  };
  locationName: string; // e.g., "Ridge Tavern, Nashville"
  timestamp: string; // ISO 8601
  selfieUrl?: string; // Optional until first capture
  pinNumber: number; // Sequential number (e.g., 1204)
  identityColor: IdentityColor; // The person's identity color
}

/**
 * A cluster of multiple Hello pins grouped together
 * Shows a count badge instead of individual pins
 */
export interface HelloCluster {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  count: number;
  locationName: string; // e.g., "East Nashville"
}

/**
 * Place search result (city, state, country, neighborhood)
 */
export interface PlaceSearchResult {
  id: string;
  name: string; // e.g., "Nashville, Tennessee"
  subtitle: string; // e.g., "United States" or "Neighborhood · Nashville, TN"
  hellosCount: number | null; // null displays as "—"
  type: 'city' | 'state' | 'country' | 'neighborhood';
}

/**
 * Hello Hangout search result
 */
export interface HangoutSearchResult {
  id: string;
  name: string;
  address: string;
  hasGoldenIcon: boolean; // Founding Hangout
}

/**
 * Recent search (just the search term)
 */
export type RecentSearch = string;

/**
 * Place detail page data
 */
export interface PlaceDetail {
  name: string;
  totalHellos: number;
  thisMonth: number;
  hangoutsCount: number;
  yoursCount: number;
  recentSelfies: string[]; // URLs
}

/**
 * Mock pins for map browsing view
 */
export const mockHelloPins: HelloPin[] = [
  {
    id: 'pin-1',
    person1Name: 'Maya',
    person2Name: 'Jordan',
    location: { lat: 36.1627, lng: -86.7816 },
    locationName: 'Ridge Tavern, Nashville',
    timestamp: '2026-08-02T18:42:00Z',
    selfieUrl: undefined, // Placeholder
    pinNumber: 1204,
    identityColor: '#D81B60', // Magenta
  },
  {
    id: 'pin-2',
    person1Name: 'Alex',
    person2Name: 'Sam',
    location: { lat: 36.1707, lng: -86.7844 },
    locationName: 'The Pharmacy, Nashville',
    timestamp: '2026-07-28T14:15:00Z',
    pinNumber: 1187,
    identityColor: '#D81B60', // Magenta (same color to test shape distinction)
  },
  {
    id: 'pin-3',
    person1Name: 'Taylor',
    person2Name: 'Casey',
    location: { lat: 36.1547, lng: -86.7754 },
    locationName: 'Centennial Park, Nashville',
    timestamp: '2026-07-15T10:30:00Z',
    pinNumber: 1142,
    identityColor: '#FB8C00', // Orange
  },
];

/**
 * Mock clusters for map browsing view
 */
export const mockHelloClusters: HelloCluster[] = [
  {
    id: 'cluster-1',
    location: { lat: 36.1653, lng: -86.7809 },
    count: 12,
    locationName: 'Downtown Nashville',
  },
  {
    id: 'cluster-2',
    location: { lat: 36.1712, lng: -86.7845 },
    count: 7,
    locationName: 'Germantown',
  },
];

/**
 * Mock place search results
 */
export const mockPlaceResults: PlaceSearchResult[] = [
  {
    id: 'place-1',
    name: 'Nashville, Tennessee',
    subtitle: 'United States',
    hellosCount: 1204,
    type: 'city',
  },
  {
    id: 'place-2',
    name: 'East Nashville',
    subtitle: 'Neighborhood · Nashville, TN',
    hellosCount: 47,
    type: 'neighborhood',
  },
  {
    id: 'place-3',
    name: 'Nashua, New Hampshire',
    subtitle: 'United States',
    hellosCount: null, // Displays as "—"
    type: 'city',
  },
];

/**
 * Mock Hello Hangout search results
 */
export const mockHangoutResults: HangoutSearchResult[] = [
  {
    id: 'hangout-1',
    name: 'Nashville Palace',
    address: '2611 McGavock Pike',
    hasGoldenIcon: true,
  },
];

/**
 * Mock recent searches
 */
export const mockRecentSearches: RecentSearch[] = [
  'Chicago',
  'Portugal',
  'Austin, TX',
];

/**
 * Mock place detail (for Nashville)
 */
export const mockPlaceDetail: PlaceDetail = {
  name: 'Nashville, Tennessee',
  totalHellos: 1204,
  thisMonth: 31,
  hangoutsCount: 18,
  yoursCount: 6,
  recentSelfies: [], // Placeholders
};

/**
 * Mock empty place detail (for Nashua)
 */
export const mockEmptyPlaceDetail: PlaceDetail = {
  name: 'Nashua, New Hampshire',
  totalHellos: 0,
  thisMonth: 0,
  hangoutsCount: 0,
  yoursCount: 0,
  recentSelfies: [],
};
