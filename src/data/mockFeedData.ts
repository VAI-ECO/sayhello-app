/**
 * MOCK FEED DATA
 *
 * ⚠️ THIS IS TEMPORARY MOCK DATA
 * Replace with actual API calls when backend is ready.
 *
 * Feed items include:
 * - Hootzas (events)
 * - Discounts (special offers from Hello Hangouts)
 * - Hollas (announcements from Hello Hangouts)
 */

export type FeedItemType = 'hootza' | 'discount' | 'holla';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  locationName: string;
  time?: string; // For Hootzas
  date?: string; // For Hootzas
  expiryDate?: string; // For Discounts
  postedAt?: string; // For Hollas
  attendeeCount?: number; // For Hootzas
  isTonight?: boolean; // For featured Hootzas
}

/**
 * Mock feed data for the default feed state
 */
export const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'hootza',
    title: 'Trivia at Foxhole',
    locationName: '412 Bell St',
    time: '7:00pm',
    attendeeCount: 16,
    isTonight: true,
  },
  {
    id: '2',
    type: 'discount',
    title: '20% off at Ridge Tavern',
    locationName: 'Ridge Tavern',
    expiryDate: 'Aug 28',
  },
  {
    id: '3',
    type: 'holla',
    title: 'Patio is open again',
    locationName: 'Bell St Coffee',
    postedAt: '2h ago',
  },
  {
    id: '4',
    type: 'hootza',
    title: 'Sunrise 5k',
    locationName: 'Riverfront lot',
    date: 'Sat',
    time: '6:30am',
    attendeeCount: 40,
  },
];

/**
 * Mock feed data for quiet day (empty state)
 */
export const mockQuietDayItems: FeedItem[] = [
  {
    id: '5',
    type: 'hootza',
    title: 'Sunrise 5k',
    locationName: 'Riverfront lot',
    date: 'Sat',
    attendeeCount: 40,
  },
  {
    id: '6',
    type: 'hootza',
    title: 'Flea market meetup',
    locationName: 'Downtown plaza',
    date: 'Sun',
    attendeeCount: 11,
  },
];
