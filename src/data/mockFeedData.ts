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
  distance: string;
  time?: string; // For Hootzas
  date?: string; // For Hootzas
  expiryDate?: string; // For Discounts
  postedAt?: string; // For Hollas
  attendeeCount?: number; // For Hootzas
  imageUrl?: string;
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
    distance: '0.4 mi',
    time: '7:00pm',
    attendeeCount: 16,
    isTonight: true,
  },
  {
    id: '2',
    type: 'discount',
    title: '20% off at Ridge Tavern',
    locationName: 'Ridge Tavern',
    distance: '0.3 mi',
    expiryDate: 'Aug 28',
  },
  {
    id: '3',
    type: 'holla',
    title: 'Patio is open again',
    locationName: 'Bell St Coffee',
    distance: '0.3 mi',
    postedAt: '2h ago',
  },
  {
    id: '4',
    type: 'hootza',
    title: 'Sunrise 5k',
    locationName: 'Riverfront lot',
    distance: '1.2 mi',
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
    distance: '3.2 mi',
    date: 'Sat',
    attendeeCount: 40,
  },
  {
    id: '6',
    type: 'hootza',
    title: 'Flea market meetup',
    locationName: 'Downtown plaza',
    distance: '4.1 mi',
    date: 'Sun',
    attendeeCount: 11,
  },
];
