/**
 * HELLO HANGOUT DIRECTORY — public directory and the owner portal
 * (sayhello-api routes/directory.ts and routes/hello-hangouts.ts owner routes).
 * The API client camelizes response keys and snake-cases request bodies.
 */

import { api } from './client';

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Day = (typeof DAYS)[number];
export interface DayHours {
  closed: boolean;
  open?: string | null;
  close?: string | null;
}
export type Hours = Partial<Record<Day, DayHours>>;

export type DirectorySort = 'hellos' | 'closest' | 'newest' | 'az';

export interface DirectoryRow {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  founding: boolean;
  todayDiscount: string | null;
  published: boolean;
  hours: Hours | null;
  amenities: string[];
  /** null = the hello↔Hello Hangout link does not exist yet on this server. */
  hellos: number | null;
  categoryId?: string | null;
}

export interface DirectoryList {
  sort: DirectorySort;
  directoryAvailable: boolean;
  hellosAvailable: boolean;
  /** The real number of matches for the filters, not the size of this page. */
  total: number;
  /** Pass back as `cursor` for the next page; null on the last page. */
  nextCursor: string | null;
  hangouts: DirectoryRow[];
}

export interface PagePost {
  id: string;
  postType: 'special' | 'holla';
  title: string;
  description: string | null;
  dealStartDate: string | null;
  dealEndDate: string | null;
  effectiveExpiryDate: string;
  onFeed: boolean;
  createdAt: string;
  /** §17.12 (080): a Holla's link to a Special on this same page; absent before 080. */
  linkedSpecialId?: string | null;
}

export interface WallTile {
  helloId: string;
  selfieUrl: string | null;
  names: string[];
  colors: (string | null)[];
}

export interface HangoutPage {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  founding: boolean;
  memberSince: string | null;
  directoryAvailable: boolean;
  published: boolean;
  preview: boolean;
  description: string;
  phone: string;
  website: string;
  amenities: string[];
  hours: Hours;
  todayDiscount: string | null;
  posts: PagePost[];
  hellos: number | null;
  selfies: number | null;
  wall: WallTile[] | null;
  isOwner?: boolean;
  status?: string;
  /** S3/080: business photos, the venue's category, and whether THIS member saved it. */
  photos?: Array<{ id: string; url: string | null; altText: string | null }>;
  category?: { id: string; name: string; parent: { id: string; name: string } | null } | null;
  saved?: boolean;
}

export function listDirectory(params: {
  q?: string;
  sort?: DirectorySort;
  founding?: boolean;
  discountToday?: boolean;
  lat?: number;
  lng?: number;
  category?: string;
  city?: string;
  /** Evaluated on the server from the viewer's local weekday and minute (§17.17). */
  openNow?: boolean;
  cursor?: string | null;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params.city) search.set('city', params.city);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));
  if (params.openNow) {
    const now = new Date();
    search.set('open_now', '1');
    search.set('local_day', DAYS[(now.getDay() + 6) % 7]);
    search.set('local_minute', String(now.getHours() * 60 + now.getMinutes()));
  }
  if (params.q) search.set('q', params.q);
  if (params.category) search.set('category', params.category);
  if (params.sort) search.set('sort', params.sort);
  if (params.founding) search.set('founding', '1');
  if (params.discountToday) search.set('discount_today', '1');
  if (params.lat !== undefined && params.lng !== undefined) {
    search.set('lat', String(params.lat));
    search.set('lng', String(params.lng));
  }
  const qs = search.toString();
  return api.get<DirectoryList>(`/directory/hangouts${qs ? `?${qs}` : ''}`);
}

export function getDirectoryPage(id: string) {
  return api.get<{ hangout: HangoutPage }>(`/directory/hangouts/${encodeURIComponent(id)}`);
}

export function getDirectoryWall(id: string) {
  return api.get<{ name: string; wall: { hellos: number; selfies: number; tiles: WallTile[] } | null }>(
    `/directory/hangouts/${encodeURIComponent(id)}/wall`
  );
}

// ── Owner portal ─────────────────────────────────────────────────────────────

export interface DirectoryDraft {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  description?: string;
  phone?: string;
  website?: string;
  amenities?: string[];
  hours?: Hours;
}

export interface ManageData {
  helloHangout: {
    id: string;
    name: string;
    address: string;
    status: 'pending_payment' | 'active' | 'lapsed' | 'cancelled' | string;
    tier: string;
    founding: boolean;
    priceCents: number;
    paidAt: string | null;
    renewsAt: string | null;
    pinSet: boolean;
    categoryId?: string | null;
  };
  ambassador: { displayName: string } | null;
  slots: { monthYear: string; freeSlots: number; slotsUsed: number; remaining: number; additionalPostCents: number };
  directory:
    | { available: true; published: boolean; publishedAt: string | null; updatedAt: string | null; unpublishedChanges: boolean }
    | { available: false };
  wall: { hellos: number; selfies: number; thisMonth: number; lastMonth: number; tiles: WallTile[] } | null;
  onNow: Array<{ id: string; postType: 'special' | 'holla'; title: string; dealEndDate: string | null; effectiveExpiryDate: string }>;
}

export function getManage(id: string) {
  return api.get<ManageData>(`/hello-hangouts/${encodeURIComponent(id)}/manage`);
}

export interface DirectoryState {
  available: boolean;
  status: string;
  draft?: DirectoryDraft;
  published?: DirectoryDraft | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export function getDirectoryDraft(id: string) {
  return api.get<{ directory: DirectoryState }>(`/hello-hangouts/${encodeURIComponent(id)}/directory`);
}

/**
 * The API client snake-cases request keys. The draft's own keys are already
 * one word each, and `hours` day keys are lower-case, so the stored JSON is the
 * same shape the page reads back.
 */
export function saveDirectoryDraft(id: string, draft: DirectoryDraft) {
  return api.put<{ directory: { draft: DirectoryDraft; updatedAt: string } }>(
    `/hello-hangouts/${encodeURIComponent(id)}/directory`,
    { draft }
  );
}

export function publishDirectory(id: string) {
  return api.post<{ directory: { published: DirectoryDraft; publishedAt: string } }>(
    `/hello-hangouts/${encodeURIComponent(id)}/directory/publish`,
    {}
  );
}

export function previewDirectory(id: string) {
  return api.get<{ hangout: HangoutPage }>(`/hello-hangouts/${encodeURIComponent(id)}/directory/preview`);
}
