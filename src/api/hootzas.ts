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

export interface HootzaHost {
  id: string;
  fullName: string;
}

export interface Hootza {
  id: string;
  hostUserId: string;
  title: string;
  description: string | null;
  venueType: VenueType;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  startTime: string;
  scheduledEndTime: string;
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
  rsvps?: Array<{ count: number }>;
  checkins?: Array<{ count: number }>;
}

export interface HootzaComment {
  id: string;
  hootzaId: string;
  userId: string;
  content: string;
  createdAt: string;
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
  scheduledEndTime: string;
  coverChargeAmount?: number;
  coverChargeDescription?: string;
  hostMode?: {
    intervalMinutes: number;
    windowLengthMinutes: number;
  };
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
}

function countFromRelation(rows?: Array<{ count: number }>): number {
  return rows?.[0]?.count ?? 0;
}

export function getRsvpCount(hootza: Hootza): number {
  return countFromRelation(hootza.rsvps);
}

export function getCheckinCount(hootza: Hootza): number {
  return countFromRelation(hootza.checkins);
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

export async function createHootza(input: CreateHootzaInput) {
  return api.post<{ hootza: Hootza }>('/api/hootzas', input);
}

export async function rsvpHootza(id: string, status: RsvpStatus) {
  return api.post<{ rsvp: unknown }>(`/api/hootzas/${id}/rsvp`, { status });
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

export async function cancelHootza(id: string, reason?: string) {
  return api.post<{ message: string; rsvpsNotified: number }>(`/api/hootzas/${id}/cancel`, {
    reason,
  });
}

export async function getHootzaComments(id: string) {
  return api.get<{ comments: HootzaComment[] }>(`/api/hootzas/${id}/comments`);
}

export async function addHootzaComment(id: string, content: string) {
  return api.post<{ comment: HootzaComment }>(`/api/hootzas/${id}/comments`, { content });
}

export async function postHootzaAgain(id: string) {
  return api.post<{ template: PostAgainTemplate }>(`/api/hootzas/${id}/post-again`, {});
}
