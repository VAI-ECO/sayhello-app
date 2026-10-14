/**
 * WAVERLY'S PLACE, AMBASSADOR STANDS AND DRAWING STATUS — S3 stage 10 (API migrations 082-084).
 * Responses arrive camelCased. The app sends no price, discount, shipping figure or order status:
 * the server prices every order from settings and burns points only when the payment provider reports paid.
 */
import { api } from './client';

export type Shop = 'member' | 'ambassador';

export interface StoreCategory { id: string; parentId: string | null; name: string; sortOrder: number }
export interface StorePhoto { id: string; url: string | null; sortOrder: number }
export interface StoreProduct { id: string; categoryId: string | null; name: string; description: string | null; priceCents: number; imagePath: string | null; photos?: StorePhoto[] }
export interface StoreVariant { id: string; sizeLabel: string | null; garmentColor: string | null }
export interface CartLine {
  id: string; variantId: string; productName: string; sizeLabel: string | null; garmentColor: string | null; waverlyColor: string | null;
  quantity: number; pointsPerUnit: number; unitPriceCents: number;
}
export interface Cart {
  lines: CartLine[];
  unavailableLines: Array<{ id: string; productName: string }>;
  itemsCents: number;
  shippingCents: number | null;
  pointsInCart: number;
  balance: number;
  spendOptions: number[];
  checkout: { shippingConfigured: boolean; paymentsConfigured: boolean };
}
export interface ShipTo { name: string; line1: string; line2?: string; city: string; region?: string; postalCode: string; country: string; phone?: string }
export type OrderStatus = 'pending_payment' | 'cancelled' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'refunded';
export interface StoreOrder {
  id: string; audience: Shop; status: OrderStatus; itemsCents: number; discountCents: number; shippingCents: number; totalCents: number;
  pointsReserved: number; shipTo: ShipTo; carrier: string | null; trackingNumber: string | null; paidAt: string | null;
  shippedAt: string | null; deliveredAt: string | null; cancelledAt: string | null; refundedAt: string | null; createdAt: string;
  items?: Array<{ productName: string; sizeLabel: string | null; garmentColor: string | null; waverlyColor: string | null; quantity: number; unitPriceCents: number }>;
}

export const getStoreCategories = () => api.get<{ categories: StoreCategory[] }>('/store/categories');
export const getStoreProducts = (shop: Shop, categoryId?: string) =>
  api.get<{ products: StoreProduct[]; waverlyColors: string[] }>(
    `/store/products?audience=${shop}${categoryId ? `&category=${encodeURIComponent(categoryId)}` : ''}`);
export const getStoreProduct = (id: string) =>
  api.get<{ product: StoreProduct & { variants: StoreVariant[] }; waverlyColors: string[] }>(`/store/products/${encodeURIComponent(id)}`);
export const getCart = () => api.get<Cart>('/store/cart');
export const putCartItem = (body: { variantId: string; quantity: number; waverlyColor?: string | null; pointsPerUnit: number }) =>
  api.put<{ line: { id: string } }>('/store/cart/items', body);
export const removeCartItem = (id: string) => api.delete<{ ok: true }>(`/store/cart/items/${encodeURIComponent(id)}`);
export const createStoreOrder = (shipTo: ShipTo, audience: Shop, idempotencyKey?: string) =>
  api.post<{ order: Pick<StoreOrder, 'id' | 'status' | 'itemsCents' | 'discountCents' | 'shippingCents' | 'totalCents' | 'pointsReserved'>; replayed?: boolean }>(
    '/store/orders', { shipTo, audience, ...(idempotencyKey ? { idempotencyKey } : {}) });
export const payStoreOrder = (id: string) =>
  api.post<{ clientSecret: string; paymentIntentId: string; amountCents: number; provider?: string }>(`/store/orders/${encodeURIComponent(id)}/pay`);
export const cancelStoreOrder = (id: string) => api.post<{ status: 'cancelled' }>(`/store/orders/${encodeURIComponent(id)}/cancel`);
export const getStoreOrders = () => api.get<{ orders: StoreOrder[] }>('/store/orders');
export const getStoreOrder = (id: string) => api.get<{ order: StoreOrder }>(`/store/orders/${encodeURIComponent(id)}`);

// ── Drawings: status and freeze views only ──
export interface DrawingsView {
  balance: number;
  floor: number;
  plans: Array<{ id: string; title: string; summary: string | null; status: 'planned' | 'funded_and_dated'; datedFor: string | null; rulesUrl: string | null }>;
  freezes: Array<{ id: string; frozenAt: string | null; yourEntries: number | null }>;
}
export const getDrawings = () => api.get<DrawingsView>('/points/drawings');

// ── Ambassador stands ──
export type StandOrderStatus = 'requested' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export interface StandOrder {
  id: string; quantity: number; reason: 'new' | 'replacement'; replacesSerial: string | null; status: StandOrderStatus;
  carrier: string | null; trackingNumber: string | null; requestedAt: string; packedAt: string | null; shippedAt: string | null; deliveredAt: string | null;
}
export interface MyStand { serial: string; status: string; orderId: string | null; boundAt: string | null; businessName: string | null; lastScannedAt: string | null; customerScans: number; neverScanned: boolean }
export const getStands = () => api.get<{ orders: StandOrder[]; stands: MyStand[]; fulfilment: { automated: boolean } }>('/ambassador/stands');
export const requestStands = (body: { quantity: number; shipTo: ShipTo; reason: 'new' | 'replacement'; replacesSerial?: string; idempotencyKey?: string }) =>
  api.post<{ order: StandOrder }>('/ambassador/stands/orders', body);
export const confirmStandsReceived = (id: string) => api.post<{ status: 'delivered' }>(`/ambassador/stands/orders/${encodeURIComponent(id)}/received`);
export const cancelStandRequest = (id: string) => api.post<{ status: 'cancelled' }>(`/ambassador/stands/orders/${encodeURIComponent(id)}/cancel`);
