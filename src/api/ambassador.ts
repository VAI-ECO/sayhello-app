/**
 * AMBASSADOR API
 * Backend mounts: /ambassador/queue, /ambassador/payouts, /ambassador/opt-out
 */

import { api } from './client';

export interface QueueHangout {
  id: string;
  businessName: string;
  address?: string;
  city?: string;
  state?: string;
  originatingAmbassadorId?: string;
  paymentAmountCents?: number;
}

export interface QueueOffer {
  id: string;
  hangoutId: string;
  status: string;
  offeredAt: string;
  expiresAt: string;
  whyAvailable?: string;
  lastVisitAt?: string | null;
  lastCustomerScanAt?: string | null;
  renewalDate?: string | null;
  offerSequence?: number;
  hangouts?: QueueHangout | QueueHangout[];
}

export interface QueueResponse {
  eligible: boolean;
  reason?: string;
  message?: string;
  offers: QueueOffer[];
}

export interface PayoutBalance {
  earned: number;
  building: number;
  paidOut: number;
  available: number;
  minimumWithdrawal: number;
}

export interface PayoutRequest {
  id: string;
  amountCents: number;
  status: string;
  requestedAt?: string;
  createdAt?: string;
}

export function getQueueOffer() {
  return api.get<QueueResponse>('/ambassador/queue');
}

export function respondToQueueOffer(offerId: string, response: 'accept' | 'decline') {
  return api.post<{ accepted?: boolean; declined?: boolean; message?: string }>(
    `/ambassador/queue/${offerId}/respond`,
    { response }
  );
}

export function setAwayMode(enabled: boolean) {
  return api.post<{ awayMode: boolean; message: string }>('/ambassador/queue/away-mode', {
    enabled,
  });
}

export function getPayoutBalance() {
  return api.get<PayoutBalance>('/ambassador/payouts/balance');
}

export function getPayoutHistory() {
  return api.get<{ payouts: PayoutRequest[] }>('/ambassador/payouts/history');
}

export function requestPayout(amountCents: number) {
  return api.post<{ requestId: string; amount: number; status: string; message: string }>(
    '/ambassador/payouts/request',
    { amountCents }
  );
}

export function submitW9() {
  return api.post<{ w9Collected: boolean; collectedAt: string; message: string }>(
    '/ambassador/payouts/w9',
    {}
  );
}

export function firstHangoutFromOffer(offer: QueueOffer): QueueHangout | null {
  if (!offer.hangouts) return null;
  if (Array.isArray(offer.hangouts)) return offer.hangouts[0] ?? null;
  return offer.hangouts;
}

export interface AmbassadorHangout {
  id: string;
  name?: string;
  address?: string;
  status?: string;
  tier?: string;
  [key: string]: unknown;
}

export function getAmbassadorHangouts() {
  return api.get<{ hangouts: AmbassadorHangout[] }>('/ambassador/hangouts');
}

export interface AmbassadorVisit {
  id: string;
  hangout_id?: string | null;
  hello_hangout_id?: string | null;
  visited_at: string;
  visit_window?: number | null;
  qr_scan_verified?: boolean;
  qr_stand_serial?: string | null;
}

export function checkInVisit(body: {
  helloHangoutId?: string;
  hangoutId?: string;
  lat: number;
  lng: number;
  qrStandSerial?: string;
  visitNotes?: string;
}) {
  return api.post<{
    visit: AmbassadorVisit;
    windows: { window1Months: number; window2Months: number };
  }>('/ambassador/visits/check-in', body);
}

export function getAmbassadorVisits() {
  return api.get<{ visits: AmbassadorVisit[] }>('/ambassador/visits');
}

