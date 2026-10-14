/**
 * What's Happening: the screen's item shape and the formatting that turns a server feed item into it.
 *
 * Every time shown is the viewer's own clock (§17.17). "Tonight" is decided by the server from the admin cutoff
 * (MONEY Part 6, F55) and arrives as `isTonight`; nothing here carries the hour. No distance is ever shown (§8.12).
 */

import type { FeedItem } from '../api/feed';

export type FeedViewKey = 'today' | 'this_week' | 'nearest' | 'newest';
/** §17.18 Views: Today · This week · Nearest · Newest. */
export const FEED_VIEWS: FeedViewKey[] = ['today', 'this_week', 'nearest', 'newest'];

export interface UIFeedItem {
  id: string;
  type: 'hootza' | 'discount' | 'holla';
  title: string;
  locationName: string | null;
  /** A private residence whose address the server withheld from this viewer (§28.2: say it is a house, not where). */
  privateResidence?: boolean;
  time?: string;
  date?: string;
  expiryDate?: string;
  postedAt?: string;
  attendeeCount?: number;
  isTonight?: boolean;
  /** RULES §17.23 — a Discount or Holla opens its Hello Hangout's directory page. */
  directoryId?: string | null;
  /**
   * RULES §17.23 stage-04 post selection: for a Discount or Holla this IS the post id, so the directory
   * page can surface the tapped post first (posts only; a Hootza has no directory post).
   */
  postId?: string;
}

/** The viewer's UTC offset in minutes east of UTC (what GET /api/feed `tz_offset_minutes` expects). */
export function deviceTzOffsetMinutes(now: Date = new Date()): number {
  const offset = -now.getTimezoneOffset();
  return offset === 0 ? 0 : offset; // never -0
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
  return `${displayHours}${displayMinutes}${ampm}`;
}

export function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function formatExpiryDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatPostedAt(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return `${Math.max(0, Math.floor(diffMs / (1000 * 60)))}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function toUIFeedItem(item: FeedItem): UIFeedItem {
  if (item.type === 'hootza') {
    const startTime = new Date(item.startTime);
    return {
      id: item.id,
      type: 'hootza',
      title: item.title,
      locationName: item.locationName || null,
      privateResidence: item.venueType === 'private_residence' && !item.locationName,
      time: formatTime(startTime),
      date: formatDate(startTime),
      attendeeCount: item.attendeeCount ?? item.rsvpCount,
      isTonight: item.isTonight === true,
    };
  }
  return {
    id: item.id,
    type: item.type === 'special' ? 'discount' : 'holla',
    title: item.title,
    locationName: item.hangout.businessName,
    expiryDate: item.dealEndDate ? formatExpiryDate(new Date(item.dealEndDate)) : undefined,
    postedAt: formatPostedAt(new Date(item.createdAt)),
    directoryId: item.hangout.directoryId ?? null,
    // The feed item id is the post id (api/src/routes/feed.ts); carried so the tap selects it (§17.23).
    postId: item.id,
  };
}
