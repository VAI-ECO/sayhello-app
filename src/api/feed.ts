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
  /** Distinct people going or checked in (server-computed; no double count). */
  attendeeCount?: number;
  organizationName?: string | null;
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
    /** The Hello Hangout directory page a tap opens (§17.23); null for a legacy business. */
    directoryId?: string | null;
  };
  createdAt: string;
}

export type FeedItem = HootzaItem | PostItem;

export interface FeedResponse {
  view: string;
  items: FeedItem[];
  count: number;
  total?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
}

/**
 * Get What's Happening feed
 */
export async function getFeed(params?: {
  view?: 'today' | 'this_week' | 'nearest' | 'newest';
  lat?: number;
  lng?: number;
}): Promise<{ data?: FeedResponse; error?: { message: string } }> {
  // The server pages the feed (filter, then limit, then cursor). Follow the cursor so the list shown is
  // the whole feed, never the first page presented as complete.
  const items: FeedItem[] = [];
  let cursor: string | undefined;
  let last: FeedResponse | undefined;
  for (let page = 0; page < 20; page++) {
    const queryParams = new URLSearchParams();
    if (params?.view) queryParams.append('view', params.view);
    if (params?.lat !== undefined) queryParams.append('lat', params.lat.toString());
    if (params?.lng !== undefined) queryParams.append('lng', params.lng.toString());
    queryParams.append('limit', '100');
    if (cursor) queryParams.append('cursor', cursor);
    const res = await api.get<FeedResponse>(`/api/feed?${queryParams.toString()}`);
    if (res.error || !res.data) return res;
    last = res.data;
    items.push(...res.data.items);
    if (!res.data.hasMore || !res.data.nextCursor) break;
    cursor = res.data.nextCursor;
  }
  return { data: { ...(last as FeedResponse), items, count: items.length } };
}

export interface CreatePostInput {
  hangoutId?: string;
  helloHangoutId?: string;
  postType: 'special' | 'holla';
  title: string;
  description?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed_amount' | 'description_only';
  dealStartDate?: string;
  dealEndDate?: string;
  timeOfDay?: string;
  isAllDay?: boolean;
  /** §17.12: a Holla may link to a Special on its own page. */
  linkedSpecialId?: string;
}

export interface HangoutPost {
  id: string;
  hangoutId: string;
  postType: string;
  title: string;
  description?: string;
  discountAmount?: number;
  discountType?: string;
  dealStartDate?: string;
  dealEndDate?: string;
  postExpiryDate?: string;
  createdAt: string;
}

export interface PaymentRequiredError {
  freeSlots: number;
  slotsUsed: number;
}

/**
 * Create a Hello Hangout post (Discount or Holla)
 * Backend: POST /api/feed/posts
 */
export async function createFeedPost(input: CreatePostInput) {
  return api.post<{ post: HangoutPost }>('/api/feed/posts', input);
}

/**
 * List posts on a Hello Hangout's own page
 * Backend: GET /api/feed/hangouts/:id/posts
 */
export async function getHangoutPosts(hangoutId: string) {
  return api.get<{ posts: HangoutPost[] }>(`/api/feed/hangouts/${hangoutId}/posts`);
}

export interface HangoutPostSlots {
  monthYear: string;
  freeSlots: number;
  slotsUsed: number;
  remaining: number;
  additionalPostCents: number;
  /** Present on the Hello Hangout manage read (the post's shelf life, a setting). */
  shelfDays?: number;
}

export async function getHangoutPostSlots(hangoutId: string) {
  return api.get<HangoutPostSlots>(`/api/feed/hangouts/${hangoutId}/slots`);
}

// ── Owner post management (§17.9 edit and repost, §17.11) ───────────────────

export type ManagedPostState = 'on_feed' | 'scheduled' | 'page_only' | 'ended' | 'held';

export interface ManagedPost {
  id: string;
  postType: 'special' | 'holla';
  title: string;
  description: string | null;
  dealStartDate: string | null;
  dealEndDate: string | null;
  postExpiryDate: string;
  effectiveExpiryDate: string;
  createdAt: string;
  state: ManagedPostState;
}

export function getManagedPosts(helloHangoutId: string) {
  return api.get<{ status: string; slots: HangoutPostSlots; posts: ManagedPost[] }>(
    `/api/feed/hello-hangouts/${encodeURIComponent(helloHangoutId)}/manage`
  );
}

export function updateFeedPost(
  postId: string,
  patch: { title?: string; description?: string | null; dealStartDate?: string; dealEndDate?: string }
) {
  return api.patch<{ post: HangoutPost }>(`/api/feed/posts/${encodeURIComponent(postId)}`, patch);
}

export function deleteFeedPost(postId: string) {
  return api.delete<{ deleted: boolean }>(`/api/feed/posts/${encodeURIComponent(postId)}`);
}
