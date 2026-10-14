/**
 * INFLUENCER (Creator) API — /influencer/* and /codes/*. Responses arrive camelCased.
 * Access is a record (a code row), not a role value; nothing here sends a role, an owner id or a
 * price. Codes carry credit, never price (§2.10). Flat dollars only (§2.12).
 */

import { api } from './client';

export interface InfluencerApplication {
  id: string;
  status: 'submitted' | 'approved' | 'declined' | 'withdrawn';
  createdAt: string;
  reviewedAt?: string | null;
}

export interface InfluencerMe {
  isInfluencer: boolean;
  applicationsAvailable: boolean;
  application: InfluencerApplication | null;
  canPickCode: boolean;
  code: { code: string; locked: boolean; attributions: number } | null;
}

export function getInfluencerMe() {
  return api.get<{ me: InfluencerMe }>('/influencer/me');
}

export function applyAsInfluencer(body: { fullName: string; channel: string; phone: string }) {
  return api.post<{ application: InfluencerApplication }>('/influencer/applications', body);
}

export type Stream = 'direct' | 'via_ambassador';

export interface InfluencerEarningRow {
  id: string;
  helloHangoutId: string;
  venue: string | null;
  stream: Stream;
  state: 'earned' | 'reversed';
  /** null until MA-05 clears earnings figures — the server withholds them. */
  amountCents: number | null;
  createdAt: string;
}

export interface InfluencerBuildingRow {
  helloHangoutId: string;
  venue: string;
  stream: Stream;
  state: 'building_waiting_payment';
  signedAt: string;
}

export interface InfluencerEarnings {
  earned: InfluencerEarningRow[];
  building: InfluencerBuildingRow[];
  reversed: InfluencerEarningRow[];
  figuresCleared: boolean;
  flatRateCents: number | null;
  payout: { provider: string; connected: boolean };
}

export function getInfluencerEarnings() {
  return api.get<{ earnings: InfluencerEarnings }>('/influencer/earnings');
}

export interface ChannelAmbassador {
  id: string;
  name: string;
  helloHangouts: number;
}

export function getChannelAmbassadors() {
  return api.get<{ ambassadors: ChannelAmbassador[]; available?: boolean }>('/influencer/ambassadors');
}

export interface InfluencerLinks {
  code: string;
  locked: boolean;
  attributions: number;
  tapsTracked: boolean;
  /** Taps in the last `tapsWindowDays` days; null when tracking is not set up on the server. */
  tapsRecent?: number | null;
  tapsWindowDays?: number;
  tapsRecentByDestination?: { ambassador: number; business: number; member: number } | null;
}

export function getInfluencerLinks() {
  return api.get<{ links: InfluencerLinks }>('/influencer/links');
}

/** Opens this creator's Trolley recipient. 503 `payouts_not_configured` until Trolley credentials exist. */
export function createCreatorPayoutAccount(input: { firstName: string; lastName: string; email: string; country: string }) {
  return api.post<{ onboarding_status: string }>('/influencer/payouts/account', input);
}
