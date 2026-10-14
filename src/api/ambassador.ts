/**
 * AMBASSADOR API
 * Backend mounts (sayhello-api): /ambassador/me, /ambassador/applications,
 * /ambassador/hangouts (book, door signup, deferred coupon), /ambassador/visits,
 * /ambassador/earnings, /ambassador/queue, /ambassador/payouts.
 * Responses arrive camelCased from the client.
 *
 * Nothing here sends an owner, a role, a tier-as-price or an amount: the server sets
 * originator, servicer and price from the signed-in user and the live settings.
 */

import { api } from './client';

// ── Access and onboarding ────────────────────────────────────────────────────────
export interface AmbassadorApplication {
  id: string;
  status: 'submitted' | 'approved' | 'declined' | 'withdrawn';
  createdAt: string;
  reviewedAt?: string | null;
}

export interface AmbassadorEligibility {
  eligible: boolean;
  reason: 'no_signed_hangouts' | 'visit_overdue' | null;
  gateMonths: number;
  behind: { id: string; name: string }[];
}

export interface AmbassadorMe {
  isAmbassador: boolean;
  applicationsAvailable: boolean;
  application: AmbassadorApplication | null;
  payoutProvider: { name: string; connected: boolean };
  w9Collected: boolean;
  awayMode: boolean;
  eligibility: AmbassadorEligibility | null;
  /** Role settings (S3 wave 3): the Ambassador's own code, name, approval date and ring radius. */
  ambassadorCode?: string | null;
  displayName?: string | null;
  since?: string | null;
  ringRadiusMiles?: number | null;
}

export function getAmbassadorMe() {
  return api.get<{ me: AmbassadorMe }>('/ambassador/me');
}

export function applyAsAmbassador(body: {
  fullName: string;
  workArea: string;
  phone: string;
  startingPlaces: string;
  /** The Creator code the sign-up link carried (attribution only, §2.15 stream B). */
  referredByCode?: string;
}) {
  return api.post<{ application: AmbassadorApplication }>('/ambassador/applications', body);
}

// ── Queue ────────────────────────────────────────────────────────────────────────
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

/** An offer on the hello_hangouts model (needs migration 058 on the server). */
export interface HelloQueueOffer {
  id: string;
  helloHangoutId: string;
  status: string;
  offeredAt: string;
  expiresAt: string;
  whyAvailable?: string;
  lastVisitAt?: string | null;
  lastCustomerScanAt?: string | null;
  renewalDate?: string | null;
  helloHangout?: { id: string; name: string; address: string; lat: number; lng: number } | null;
}

export interface QueueResponse {
  eligible: boolean;
  reason?: string;
  message?: string;
  behind?: { id: string; name: string }[];
  offers: QueueOffer[];
  helloOffers?: HelloQueueOffer[];
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

export function firstHangoutFromOffer(offer: QueueOffer): QueueHangout | null {
  if (!offer.hangouts) return null;
  if (Array.isArray(offer.hangouts)) return offer.hangouts[0] ?? null;
  return offer.hangouts;
}

// ── The book (My Hello Hangouts) ─────────────────────────────────────────────────
export type BookState =
  | 'awaiting_payment'
  | 'needs_visit'
  | 'complete'
  | 'overdue'
  | 'no_schedule'
  | 'lapsed'
  | 'cancelled';

export interface TermWindow {
  starts: string;
  ends: string;
  visited: boolean;
}

export interface AmbassadorHangout {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pinSet: boolean;
  status: string;
  founding: boolean;
  tier: string;
  youService: boolean;
  youOriginated: boolean;
  originatedAt: string;
  paidAt: string | null;
  renewsAt: string | null;
  state: BookState;
  window: number | null;
  dueBy: string | null;
  term: { starts: string; ends: string; window1: TermWindow; window2: TermWindow } | null;
  lastVisitAt: string | null;
  verifiedVisits: number;
}

export function getAmbassadorHangouts() {
  return api.get<{ hangouts: AmbassadorHangout[] }>('/ambassador/hangouts');
}

export interface LookupMatch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pinSet: boolean;
  inBook: boolean;
}

/** A8: what is already in Say Hello (name/address/pin only). */
export function lookupBusinesses(q: string) {
  return api.get<{ matches: LookupMatch[] }>(`/ambassador/hangouts/lookup?q=${encodeURIComponent(q)}`);
}

export type SignupCoupon = 'founding' | 'none';

export interface PricingOption {
  listPriceCents: number;
  couponOffCents: number;
  priceCents: number;
}

/** The counter step's figures — all server-owned; Founding is null when its window is closed. */
export function getSignupPricing() {
  return api.get<{
    pricing: { regular: PricingOption; founding: PricingOption | null; foundingWindowOpen: boolean };
  }>('/ambassador/hangouts/pricing');
}

export interface SignBusinessBody {
  name: string;
  address: string;
  lat: number;
  lng: number;
  coupon: SignupCoupon;
  contactName?: string;
  contactPhone?: string;
}

export interface SignBusinessResult {
  helloHangout: { id: string; name: string; address: string; tier: string; status: string; createdAt: string };
  pricing: { listPriceCents: number; couponOffCents: number; priceCents: number };
  contactSaved: boolean;
}

export function signBusiness(body: SignBusinessBody) {
  return api.post<SignBusinessResult>('/ambassador/hangouts', body);
}

export function deferCoupon(helloHangoutId: string) {
  return api.post<{ helloHangout: { id: string; tier: string } }>(
    `/ambassador/hangouts/${encodeURIComponent(helloHangoutId)}/defer`,
    {}
  );
}

// ── Visits ───────────────────────────────────────────────────────────────────────
export interface AmbassadorVisit {
  id: string;
  helloHangoutId?: string | null;
  hangoutId?: string | null;
  visitedAt: string;
  visitWindow?: number | null;
  subscriptionYear?: number | null;
  qrScanVerified?: boolean;
  qrStandSerial?: string | null;
  venue?: string | null;
  address?: string | null;
}

export interface CheckInBody {
  helloHangoutId: string;
  /** The payload the live camera read from the venue's code. Never typed. */
  scan: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
  mocked?: boolean;
  visitNotes?: string;
}

export interface CheckInResult {
  visit: { id: string; visitedAt: string; visitWindow: number | null; qrScanVerified: boolean };
  kind: 'service' | 'origination';
  venue: { id: string; name: string };
  proof: 'printed_code' | 'stand';
  gps: { distanceM: number | null; accuracyM: number | null; pinSet: boolean; mocked: boolean | null };
  windowCounted: number | null;
  becameServicer: boolean;
}

export function checkInVisit(body: CheckInBody) {
  return api.post<CheckInResult>('/ambassador/visits/check-in', body);
}

/** §14.10 installing a stand is a verified visit (needs migration 058 on the server). */
export function installStand(body: CheckInBody) {
  return api.post<CheckInResult>('/ambassador/visits/install', body);
}

export function getAmbassadorVisits() {
  return api.get<{ visits: AmbassadorVisit[] }>('/ambassador/visits');
}

// ── Earned and Building ──────────────────────────────────────────────────────────
export interface EarningRow {
  id: string;
  helloHangoutId: string;
  venue: string | null;
  reason: string | null;
  /** null until MA-05 clears earnings figures — the server withholds them (RULES §31). */
  rateAppliedCents: number | null;
  rateRule: string | null;
  amountCents: number | null;
  payoutStatus: string;
  state: 'earned' | 'building_waiting_visit' | 'reversed';
  createdAt: string;
}

export interface BuildingUnpaid {
  helloHangoutId: string;
  venue: string;
  state: 'building_waiting_payment';
  signedAt: string;
}

export interface Earnings {
  earned: EarningRow[];
  building: (BuildingUnpaid | EarningRow)[];
  reversed: EarningRow[];
  figuresCleared: boolean;
  withdrawals: {
    open: boolean;
    reason: string;
    settlementHoldSet: boolean;
    fulfilmentWindowSet: boolean;
  };
}

export function getEarnings() {
  return api.get<{ earnings: Earnings }>('/ambassador/earnings');
}

// ── Payouts (Trolley is not connected — every write is refused by the server) ────
export interface PayoutRequest {
  id: string;
  amountCents: number;
  status: string;
  requestedAt?: string;
  createdAt?: string;
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

/** Opens this person's Trolley recipient. 503 `payouts_not_configured` until Trolley credentials exist. */
export function createPayoutAccount(input: { firstName: string; lastName: string; email: string; country: string }) {
  return api.post<{ onboardingStatus: string }>('/ambassador/payouts/account', input);
}

export function submitW9() {
  return api.post<{ w9Collected: boolean; collectedAt: string; message: string }>(
    '/ambassador/payouts/w9',
    {}
  );
}

/** Superseded by getEarnings: it counted pending rows as both Earned and Building. */
export interface PayoutBalance {
  earned: number;
  building: number;
  paidOut: number;
  available: number;
  minimumWithdrawal: number;
}

export function getPayoutBalance() {
  return api.get<PayoutBalance>('/ambassador/payouts/balance');
}
