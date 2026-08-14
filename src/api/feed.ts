/**
 * FEED API
 *
 * What's Happening feed endpoints
 */

import { api } from './client';

export interface HootzaItem {
  type: 'hootza';
  id: string;
  title: string;
  description?: string;
  venueType: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  startTime: string;
  coverChargeAmount?: number;
  coverChargeDescription?: string;
  host: {
    id: string;
    fullName: string;
  };
  rsvpCount: number;
  checkinCount: number;
  createdAt: string;
}

export interface PostItem {
  type: 'special' | 'holla';
  id: string;
  title: string;
  description?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed_amount' | 'description_only';
  dealStartDate?: string;
  dealEndDate?: string;
  timeOfDay?: string;
  isAllDay: boolean;
  hangout: {
    id: string;
    businessName: string;
    locationLat: number;
    locationLng: number;
    isFounding: boolean;
  };
  createdAt: string;
}

export type FeedItem = HootzaItem | PostItem;

export interface FeedResponse {
  view: string;
  items: FeedItem[];
  count: number;
}

/**
 * Get What's Happening feed
 */
export async function getFeed(params?: {
  view?: 'today' | 'this_week' | 'nearest' | 'newest';
  lat?: number;
  lng?: number;
}): Promise<{ data?: FeedResponse; error?: { message: string } }> {
  const queryParams = new URLSearchParams();
  if (params?.view) queryParams.append('view', params.view);
  if (params?.lat) queryParams.append('lat', params.lat.toString());
  if (params?.lng) queryParams.append('lng', params.lng.toString());

  const queryString = queryParams.toString();
  const url = `/feed${queryString ? `?${queryString}` : ''}`;

  return api.get<FeedResponse>(url);
}
