/**
 * HOOTZAS API
 *
 * Backend: /api/hootzas (sayhello-api src/routes/hootzas.ts)
 */

import { api } from './client';

export type HootzaStatus = 'live' | 'ended' | 'cancelled';
export type VenueType = 'public_place' | 'private_residence';
export type RsvpStatus = 'going' | 'not_going';

export interface HostModeConfig {
  id: string;
  hootzaId: string;
  intervalMinutes: number;
  windowLengthMinutes: number;
  lastWindowOpenedAt: string | null;
  isActive: boolean;
  developerOverrideEnabled: boolean;
}

export type HostModeState = 'not-checked-in' | 'ended' | 'unavailable' | 'off' | 'waiting' | 'open';

export interface MyHostMode {
  state: HostModeState;
  available: boolean;
  accepted: boolean;
  serverTime: string;
  windowClosesAt: string | null;
}

export interface HootzaHost {
  id: string;
  fullName: string;
}

export interface Hootza {
  id: string;
  /** Null for an organization's Hootza when the viewer is not one of its leads (the lead's personal id stays private). */
  hostUserId: string | null;
  title: string;
  description: string | null;
  venueType: VenueType;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  startTime: string;
  scheduledEndTime: string | null;
  actualEndTime: string | null;
  coverChargeAmount: number | null;
  coverChargeDescription: string | null;
  status: HootzaStatus;
  cancellationReason: string | null;
  cancelledAt: string | null;
  checkInQrCode: string | null;
  createdAt: string;
  host?: HootzaHost;
  hostMode?: HostModeConfig[] | HostModeConfig | null;
  myHostMode?: MyHostMode;
  rsvps?: Array<{ count: number }>;
  checkins?: Array<{ count: number }>;
  /** Server-computed from canonical statuses: going and maybe RSVPs, and check-ins. */
  goingCount?: number;
  maybeCount?: number;
  checkedInCount?: number;
  /** Host, or a lead of the hosting organization, or SUPER ADMIN. */
  canManage?: boolean;
  /** False when a lead manages an organization Hootza that is posted under another lead: the award is not theirs. */
  awardGoesToYou?: boolean;
  organizationId?: string | null;
  /** Set when an organization hosts it; the page then reads as the organization's. */
  organization?: { id: string; name: string } | null;
  endGraceMinutes?: number | null;
  /** Optional host-set advisory (off by default, RULES §28.18). */
  adultsOnly?: boolean;
  /** Host-activated group chat (off by default, RULES §28.19). */
  chatEnabled?: boolean;
  /** Visible only to people who can be in the room. */
  chatMessageCount?: number | null;
  /** The caller's own persisted RSVP and check-in. */
  myRsvp?: { status: 'going' | 'maybe' | 'not_going'; optedOutOfHostMode: boolean } | null;
  myCheckin?: { scannedAt: string } | null;
  /** True when a private residence's address is withheld until the viewer is eligible. */
  addressWithheld?: boolean;
  /** Host award read from the points ledger after the Hootza ended. */
  hostAward?: { pointsAwarded: number; basePoints: number; perAttendeePoints: number; attendeeCount: number } | null;
  /** Current server-configured projection, not an earned ledger balance. */
  hostPointsProjection?: {
    completionPoints: number;
    pointsPerCheckin: number;
    checkins: number;
    projectedPoints: number;
  } | null;
}

export interface HootzaComment {
  id: string;
  hootzaId: string;
  userId: string;
  content: string;
  createdAt: string;
  /** The host badge is the only role marker on a comment. */
  fromHost?: boolean;
  user?: { id: string; fullName: string };
}

export interface CreateHootzaInput {
  title: string;
  description?: string;
  venueType: VenueType;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  startTime: string;
  scheduledEndTime?: string | null;
  endGraceMinutes?: number | null;
  coverChargeAmount?: number;
  coverChargeDescription?: string;
  adultsOnly?: boolean;
  chatEnabled?: boolean;
  hostMode?: {
    intervalMinutes: number;
    windowLengthMinutes: number;
  };
}

export interface UpdateHootzaInput {
  title?: string;
  description?: string | null;
  venueType?: VenueType;
  locationName?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  startTime?: string;
  scheduledEndTime?: string | null;
  endGraceMinutes?: number | null;
  coverChargeAmount?: number | null;
  coverChargeDescription?: string | null;
  adultsOnly?: boolean;
  chatEnabled?: boolean;
}

export interface HootzaNotice {
  id: string;
  kind: 'cancelled' | 'changed';
  /** For kind 'changed': which of time / place moved (never the new values). */
  changedFields?: Array<'time' | 'place'> | null;
  createdAt: string;
  hootza: { id: string; title: string; startTime: string; cancellationReason: string | null } | null;
}

export interface PostAgainTemplate {
  title: string;
  description: string | null;
  venueType: VenueType;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  coverChargeAmount: number | null;
  coverChargeDescription: string | null;
  /** Set when the source was an organization Hootza: post it again through that organization's event route. */
  organizationId?: string | null;
}

function countFromRelation(rows?: Array<{ count: number }>): number {
  return rows?.[0]?.count ?? 0;
}

export function getRsvpCount(hootza: Hootza): number {
  return hootza.goingCount ?? countFromRelation(hootza.rsvps);
}

export function getCheckinCount(hootza: Hootza): number {
  return hootza.checkedInCount ?? countFromRelation(hootza.checkins);
}

export function getHostModeConfig(hootza: Hootza): HostModeConfig | null {
  if (!hootza.hostMode) return null;
  if (Array.isArray(hootza.hostMode)) {
    return hootza.hostMode[0] ?? null;
  }
  return hootza.hostMode;
}

export async function getHootza(id: string) {
  return api.get<{ hootza: Hootza }>(`/api/hootzas/${id}`);
}

export async function saveHostMode(id: string, intervalMinutes: number, windowLengthMinutes: number) {
  return api.post<{ hostMode: HostModeConfig }>(`/api/hootzas/${id}/host-mode`, { intervalMinutes, windowLengthMinutes });
}

export async function createHootza(input: CreateHootzaInput) {
  return api.post<{ hootza: Hootza }>('/api/hootzas', input);
}

export async function updateHootza(id: string, patch: UpdateHootzaInput) {
  return api.patch<{ ok: true }>(`/api/hootzas/${id}`, patch);
}

export async function getHootzaAttendees(id: string) {
  return api.get<{ attendees: Array<{ name: string | null; scannedAt: string }>; cleared: boolean }>(`/api/hootzas/${id}/attendees`);
}

export async function getMyHootzaNotices() {
  return api.get<{ notices: HootzaNotice[] }>('/api/hootzas/my/notices');
}

export async function markHootzaNoticeDelivered(noticeId: string) {
  return api.post<{ ok: true }>(`/api/hootzas/my/notices/${noticeId}/delivered`, {});
}

export async function rsvpHootza(id: string, status: RsvpStatus) {
  return api.post<{ rsvp: { status?: string } | null }>(`/api/hootzas/${id}/rsvp`, { status });
}

export async function checkInHootza(id: string, qrCode: string, acceptHostMode?: boolean) {
  return api.post<{ checkin: unknown; hostModeRequested: boolean }>(
    `/api/hootzas/${id}/checkin`,
    { qrCode, acceptHostMode: acceptHostMode ?? false }
  );
}

export async function endHootza(id: string) {
  return api.post<{ message: string; pointsAwarded: number }>(`/api/hootzas/${id}/end`, {});
}

/**
 * No push sender is configured: rsvpsNotified is 0. The server queues an in-app notice for every
 * going and maybe RSVP (noticesQueued); they read it through getMyHootzaNotices.
 */
export async function cancelHootza(id: string, reason?: string) {
  return api.post<{ message: string; rsvpsNotified: number; rsvpsAwaitingNotification: number; noticesQueued?: number }>(
    `/api/hootzas/${id}/cancel`,
    { reason }
  );
}

export async function getHootzaComments(id: string) {
  return api.get<{ comments: HootzaComment[]; canManage?: boolean }>(`/api/hootzas/${id}/comments`);
}

export async function addHootzaComment(id: string, content: string) {
  return api.post<{ comment: HootzaComment }>(`/api/hootzas/${id}/comments`, { content });
}

/** Host, organization lead or SUPER ADMIN. The comment is stamped removed, not deleted (RULES §35.10). */
export async function removeHootzaComment(id: string, commentId: string) {
  return api.delete<{ removed: boolean }>(`/api/hootzas/${id}/comments/${commentId}`);
}

export async function postHootzaAgain(id: string) {
  return api.post<{ template: PostAgainTemplate }>(`/api/hootzas/${id}/post-again`, {});
}

export async function saveHostModeParticipation(id: string, accepted: boolean) {
  return api.post<{ checkin: unknown }>(`/api/hootzas/${id}/host-mode-participation`, { accepted });
}

/** Hootza group chat (RULES §28.19; members only; read-only once the Hootza ends). */
export interface HootzaChatMessage {
  id: string;
  body: string;
  createdAt: string;
  senderName?: string | null;
  fromHost: boolean;
  mine: boolean;
}
export interface HootzaChatRoom {
  hootzaId: string;
  title: string;
  open: boolean;
  closesAt: string | null;
  turnedOnBy: string | null;
  canManage: boolean;
}
export const getHootzaChat = (id: string) =>
  api.get<{ chat: HootzaChatRoom; messages: HootzaChatMessage[] }>(`/api/hootzas/${encodeURIComponent(id)}/chat`);
export const sendHootzaChatMessage = (id: string, body: string) =>
  api.post<{ message: HootzaChatMessage }>(`/api/hootzas/${encodeURIComponent(id)}/chat/messages`, { body });
export const removeHootzaChatMessage = (id: string, messageId: string) =>
  api.delete<{ removed: boolean }>(`/api/hootzas/${encodeURIComponent(id)}/chat/messages/${encodeURIComponent(messageId)}`);
