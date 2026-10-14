/**
 * HELLO HANGOUT BUSINESS — S3 stage 06 (API migration 080).
 * Photos, category, billing, renew / cancel, hardship, redeem, saved venues. Amounts are integer
 * cents from the server; ownership and payment state are decided server-side.
 */

import { api } from './client';

const hh = (id: string) => `/hello-hangouts/${encodeURIComponent(id)}`;

export interface BusinessPhoto { id: string; url: string | null; altText: string | null }

export const listPhotos = (id: string) => api.get<{ photos: BusinessPhoto[]; max: number | null }>(`${hh(id)}/photos`);
export const uploadPhoto = (id: string, bytes: ArrayBuffer, contentType: string) =>
  api.postBytes<{ photo: { id: string } }>(`${hh(id)}/photos`, bytes, contentType);
export const deletePhoto = (id: string, photoId: string) => api.delete<{ deleted: boolean }>(`${hh(id)}/photos/${encodeURIComponent(photoId)}`);

export interface CategoryNode { id: string; name: string; children: Array<{ id: string; name: string }> }
export const listCategories = (inUse = false) => api.get<{ categories: CategoryNode[] }>(`/business-categories${inUse ? '?inUse=1' : ''}`);
export const setCategory = (id: string, categoryId: string | null) => api.put<{ categoryId: string | null }>(`${hh(id)}/category`, { categoryId });

export interface Billing {
  status: string; tier: string; founding: boolean;
  listPriceCents: number; priceCents: number; couponOffCents: number; lockedUntil: string | null;
  paidAt: string | null; renewsAt: string | null; autoRenew: boolean; cancelRequestedAt: string | null;
  canRenew: boolean; paymentsConfigured: boolean;
  payments: Array<{ amountCents: number; paidAt: string; periodStart: string | null; periodEnd: string | null }>;
  hardship: { status: 'pending' | 'approved' | 'declined' | 'withdrawn'; requestedAt: string; decidedAt: string | null } | null;
}
export const getBilling = (id: string) => api.get<{ billing: Billing }>(`${hh(id)}/billing`);
export const renewMembership = (id: string) =>
  api.post<{ clientSecret: string; paymentIntentId: string; amountCents: number; provider: string }>(`${hh(id)}/renew`, {});
export const cancelMembership = (id: string) => api.post<{ status: string; autoRenew?: boolean; endsOn?: string | null }>(`${hh(id)}/cancel`, {});
export const resumeMembership = (id: string) => api.post<{ autoRenew: boolean }>(`${hh(id)}/resume`, {});
export const petitionHardship = (id: string, note: string) => api.post<{ hardship: { id: string; status: string } }>(`${hh(id)}/hardship`, { note });
export const withdrawHardship = (id: string) => api.delete<{ withdrawn: boolean }>(`${hh(id)}/hardship`);

export const redeemDeal = (id: string, postId: string, claimKey?: string) =>
  api.post<{ redeemed: { postId: string; title: string; redeemedAt: string } }>(`${hh(id)}/redeem`, { postId, claimKey });
export const getRedemptions = (id: string) =>
  api.get<{ redemptions: { total: number; thisMonth: number; byPost: Array<{ postId: string; count: number }> } }>(`${hh(id)}/redemptions`);

export const putOnFeed = (id: string, hootzaId: string) =>
  api.post<{ already: boolean; feedPostedAt: string }>(`${hh(id)}/hootzas/${encodeURIComponent(hootzaId)}/feed`, {});

export interface SavedVenue { id: string; name: string; address: string; founding: boolean }
export const listSaved = () => api.get<{ saved: SavedVenue[] }>('/saved-hangouts');
export const saveVenue = (id: string) => api.put<{ saved: boolean }>(`/saved-hangouts/${encodeURIComponent(id)}`, {});
export const unsaveVenue = (id: string) => api.delete<{ saved: boolean }>(`/saved-hangouts/${encodeURIComponent(id)}`);

export interface OwnerHootza { id: string; title: string; startTime: string; onFeed: boolean }
export const listOwnerHootzas = (id: string) => api.get<{ hootzas: OwnerHootza[]; feedPlacement: boolean }>(`${hh(id)}/hootzas`);

// ── Membership coupon (S3 wave 3, API 085) — the server validates and prices; the app only presents the code ──
export interface AppliedCoupon { name: string; offCents: number }
export const getMembershipCoupon = (id: string) => api.get<{ coupon: AppliedCoupon | null }>(`${hh(id)}/coupon`);
export const applyMembershipCoupon = (id: string, code: string) =>
  api.post<{ coupon: AppliedCoupon; pricing: { listPriceCents: number; couponOffCents: number; priceCents: number } }>(`${hh(id)}/coupon`, { code });
export const removeMembershipCoupon = (id: string) => api.delete<{ removed: boolean }>(`${hh(id)}/coupon`);

// W11-8 (API migration 112): a member's single-use claim code for a Special, and the owner's redemption of it.
export const DEAL_QR_PREFIX = 'SAYHELLO-DEAL:';
export const dealQrValue = (code: string) => `${DEAL_QR_PREFIX}${code}`;
/** The claim code inside a scanned QR, or the typed text as-is (the server forgives case, spaces, dashes). */
export function dealCodeFromScan(data: string): string {
  const d = data.trim();
  return d.toUpperCase().startsWith(DEAL_QR_PREFIX) ? d.slice(DEAL_QR_PREFIX.length).trim() : d;
}
export const claimSpecial = (postId: string) =>
  api.post<{ claim: { code: string; expiresAt: string; ttlSeconds: number; title: string } }>(`/specials/${encodeURIComponent(postId)}/claim`, {});
export const redeemClaim = (id: string, code: string) =>
  api.post<{ redeemed: { postId: string; title: string; redeemedAt: string } }>(`${hh(id)}/redeem-claim`, { code });
