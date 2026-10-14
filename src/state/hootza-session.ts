/**
 * In-memory, this-session record of server-confirmed Hootza results.
 *
 * GET /api/hootzas/:id does not return the caller's own RSVP, and the end
 * award is only in the POST /end response. These hold what the server
 * actually confirmed so the page can show it after navigating back. Nothing
 * here is guessed: an RSVP is recorded only after the server accepted it, and
 * points only as the server's pointsAwarded. Lost on app restart.
 */

import type { RsvpStatus } from '../api/hootzas';

const rsvps = new Map<string, RsvpStatus>();
const endAwards = new Map<string, number>();

// Keyed by user as well, so a sign-in switch never shows another account's RSVP.
export function rememberRsvp(userId: string, hootzaId: string, status: RsvpStatus): void {
  rsvps.set(`${userId}:${hootzaId}`, status);
}

export function getRememberedRsvp(userId: string, hootzaId: string): RsvpStatus | null {
  return rsvps.get(`${userId}:${hootzaId}`) ?? null;
}

export function rememberEndAward(hootzaId: string, pointsAwarded: number): void {
  endAwards.set(hootzaId, pointsAwarded);
}

export function getEndAward(hootzaId: string): number | null {
  return endAwards.get(hootzaId) ?? null;
}

export function resetHootzaSession(): void {
  rsvps.clear();
  endAwards.clear();
}
