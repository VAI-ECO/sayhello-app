/**
 * HELLO HANGOUT money — create + checkout. Amounts come from the server.
 */

import { api } from './client';

// Self-signup supports founding and regular only. The deferred coupon is earned by an
// Ambassador's second visit (api §1.3); the server refuses it at signup, so it is not
// a requestable tier here.
export type HangoutTier = 'regular' | 'founding';

export interface CreateHangoutBody {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category_id?: string | null;
  tier: HangoutTier;
  code?: string | null;
}

export interface HelloHangout {
  id: string;
  name: string;
  status: string;
  tier: string;
  price_cents: number;
  [key: string]: unknown;
}

export interface CreateHangoutResponse {
  helloHangout: HelloHangout;
  pricing: {
    listPriceCents: number;
    couponOffCents: number;
    priceCents: number;
  };
}

export function createHelloHangout(body: CreateHangoutBody) {
  return api.post<CreateHangoutResponse>('/hello-hangouts', body);
}

export function createHangoutCheckout(hangoutId: string) {
  return api.post<{
    clientSecret: string;
    paymentIntentId: string;
    amountCents: number;
    provider: string;
  }>(`/hello-hangouts/${hangoutId}/checkout`, {});
}

export function getHelloHangout(hangoutId: string) {
  return api.get<{ helloHangout: HelloHangout }>(`/hello-hangouts/${hangoutId}`);
}

export function listMyHelloHangouts() {
  return api.get<{ helloHangouts: HelloHangout[] }>('/hello-hangouts');
}

/** The printed venue code an Ambassador scans to prove a visit (owner only; never sent to Ambassadors). */
export function getVenueCode(hangoutId: string) {
  return api.get<{ venueCode: { payload: string; name: string } }>(`/hello-hangouts/${encodeURIComponent(hangoutId)}/venue-code`);
}
