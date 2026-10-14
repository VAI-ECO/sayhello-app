/**
 * VENUE PRESENCE API (RULES §9, W-052; API migrations 265/266, routes/venue-presence.ts).
 * A member scans a Hello Hangout's QR with the live camera and is counted as present at that venue for the presence window.
 * The client sends only the scanned payload; the server decides everything (who may scan, which venue, how long, the count).
 * No position is read or sent. The response carries the venue and a past-tense COUNT, never who (§9.6).
 */
import { api } from './client';

export interface VenuePresence {
  venue: { id: string; name: string };
  /** The API client camelizes keys: expires_at -> expiresAt, here_count -> hereCount. */
  expiresAt: string;
  /** Only on a scan response. */
  hereCount?: number;
}

export const scanVenueCode = (scan: string) => api.post<{ presence: VenuePresence }>('/venue-presence/scan', { scan });
export const getMyVenuePresence = () => api.get<{ presence: VenuePresence | null }>('/venue-presence/mine');
/** The past-tense count for a venue over the presence window (§9.2): a number, never who. */
export const getVenuePresenceCount = (helloHangoutId: string) =>
  api.get<{ count: number }>(`/venue-presence/places/${encodeURIComponent(helloHangoutId)}/count`);
export const leaveVenuePresence = () => api.delete<{ left: boolean }>('/venue-presence/mine');
