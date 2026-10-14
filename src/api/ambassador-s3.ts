/**
 * AMBASSADOR / CREATOR COMPLETION — S3 stage 07 (API migration 081).
 * /ambassador/commissions, owner-claim link, storefront photo, release, payout gates, owner redeem.
 * Responses arrive camelCased. Nothing here sends an owner, a role or an amount.
 */
import { api } from './client';

export type CommissionWhere = 'paid' | 'owed' | 'building_waiting_payment' | 'building_waiting_visit';
export interface CommissionRow {
  id: string;
  helloHangoutId: string;
  venue: string | null;
  route: 'signed_by_you' | 'taken_over';
  termYear: number | null;
  amountCents: number | null;
  rateAppliedCents: number | null;
  where: CommissionWhere;
  visit: { state: string; window: number | null; dueBy: string | null } | null;
}
export interface Commissions {
  figuresCleared: boolean;
  totals: { paidCents: number | null; owedCents: number | null; buildingCount: number };
  earned: CommissionRow[];
  building: CommissionRow[];
  reversed: Array<{ id: string; venue: string | null; termYear: number | null; amountCents: number | null }>;
}
export const getCommissions = () => api.get<{ commissions: Commissions }>('/ambassador/commissions');

export interface PayoutGates {
  open: boolean;
  blockers: string[];
  onboardingStatus: string;
  taxFormStatus: string;
  minimumCents: number | null;
  owedCents: number | null;
}
export const getPayoutGates = () => api.get<{ payouts: PayoutGates }>('/ambassador/payouts/status');

const book = (id: string) => `/ambassador/hangouts/${encodeURIComponent(id)}`;
export const getOwnerClaim = (id: string) =>
  api.get<{ hasOwner: boolean; openLink: { createdAt: string; expiresAt: string | null } | null }>(`${book(id)}/owner-claim`);
export const createOwnerClaim = (id: string) =>
  api.post<{ claim: { token: string; url: string; expiresAt: string | null } }>(`${book(id)}/owner-claim`, {});
export const releaseHangout = (id: string) => api.post<{ released: boolean; already?: boolean }>(`${book(id)}/release`, {});
export const uploadStorefront = (id: string, bytes: ArrayBuffer, contentType: string) =>
  api.postBytes<{ stored: boolean }>(`${book(id)}/storefront`, bytes, contentType);

export const claimHelloHangout = (token: string) =>
  api.post<{ claimed: boolean; helloHangout: { helloHangoutId: string; name: string } }>('/hello-hangouts/claim', { token });
