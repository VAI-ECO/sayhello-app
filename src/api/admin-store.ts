/**
 * HELLO ADMIN API (wave 3) — Waverly's Place catalog, store-order and stand fulfilment, drawing plan rows.
 * Responses arrive camelCased. The app only asks; every route enforces its own permission on the server.
 */
import { api } from './client';

const B = '/admin/store';
const id = (x: string) => encodeURIComponent(x);

export interface StoreCategoryRow { id: string; parentId: string | null; name: string; sortOrder: number; retiredAt: string | null }
export interface StoreVariantRow { id: string; productId: string; sizeLabel: string | null; garmentColor: string | null; sku: string | null; available: boolean; sortOrder: number }
export interface StoreProductPhoto { id: string; url: string | null; sortOrder: number }
export interface StoreProductRow {
  id: string; categoryId: string | null; name: string; description: string | null; costCents: number; imagePath: string | null;
  audience: 'member' | 'ambassador' | 'both'; active: boolean; storeVariants: StoreVariantRow[]; photos?: StoreProductPhoto[];
}
export const getStoreCategories = () => api.get<{ categories: StoreCategoryRow[] }>(`${B}/categories`);
export const createStoreCategory = (name: string, parentId: string | null) => api.post<{ category: { id: string } }>(`${B}/categories`, { name, parentId });
export const setStoreCategoryRetired = (cid: string, retire: boolean) => api.post<{ ok: boolean }>(`${B}/categories/${id(cid)}/${retire ? 'retire' : 'restore'}`, {});
export const getStoreProducts = () => api.get<{ products: StoreProductRow[] }>(`${B}/products`);
export const createStoreProduct = (b: { name: string; costCents: number; audience: 'member' | 'ambassador' | 'both'; description?: string; categoryId?: string | null }) =>
  api.post<{ product: { id: string } }>(`${B}/products`, b);
export const updateStoreProduct = (pid: string, b: Partial<{ name: string; costCents: number; audience: 'member' | 'ambassador' | 'both'; description: string | null; active: boolean; categoryId: string | null }>) =>
  api.patch<{ ok: boolean }>(`${B}/products/${id(pid)}`, b);
export const createStoreVariant = (pid: string, b: { sizeLabel?: string; garmentColor?: string; sku?: string }) => api.post<{ variant: { id: string } }>(`${B}/products/${id(pid)}/variants`, b);
export const uploadStoreProductPhoto = (pid: string, bytes: ArrayBuffer, contentType: string) =>
  api.postBytes<{ photo: { id: string; sortOrder: number } }>(`${B}/products/${id(pid)}/photos`, bytes, contentType);
export const deleteStoreProductPhoto = (photoId: string) => api.delete<{ ok: boolean }>(`${B}/photos/${id(photoId)}`);
export const reorderStoreProductPhotos = (pid: string, photoIds: string[]) => api.put<{ ok: boolean }>(`${B}/products/${id(pid)}/photos/order`, { photoIds });
export const setStoreVariantAvailable = (vid: string, available: boolean) => api.patch<{ ok: boolean }>(`${B}/variants/${id(vid)}`, { available });

export type StoreOrderStatus = 'pending_payment' | 'cancelled' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'refunded';
export interface StoreOrderItemRow { id: string; productName: string; sizeLabel: string | null; garmentColor: string | null; waverlyColor: string | null; quantity: number }
export interface StoreOrderRow {
  id: string; audience: 'member' | 'ambassador'; status: StoreOrderStatus; itemsCents: number; discountCents: number; shippingCents: number; totalCents: number;
  pointsReserved: number; shipTo: Record<string, unknown>; carrier: string | null; trackingNumber: string | null; paidAt: string | null; shippedAt: string | null;
  deliveredAt: string | null; refundedAt: string | null; reviewFlags: string[]; createdAt: string; storeOrderItems: StoreOrderItemRow[];
}
export const getStoreOrders = (status?: StoreOrderStatus) => api.get<{ orders: StoreOrderRow[] }>(`${B}/orders${status ? `?status=${status}` : ''}`);
export const setStoreOrderStatus = (oid: string, b: { status: 'packed' | 'shipped' | 'delivered'; carrier?: string; trackingNumber?: string }) => api.post<{ ok: boolean }>(`${B}/orders/${id(oid)}/status`, b);

export type StandOrderStatus = 'requested' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export interface StandOrderRow {
  id: string; ambassadorId: string; quantity: number; reason: 'new' | 'replacement'; replacesSerial: string | null; shipTo: Record<string, unknown>;
  status: StandOrderStatus; carrier: string | null; trackingNumber: string | null; adminNote: string | null; requestedAt: string;
}
export const getStandOrders = (status?: StandOrderStatus) => api.get<{ orders: StandOrderRow[] }>(`${B}/stands/orders${status ? `?status=${status}` : ''}`);
export const assignStandSerials = (oid: string, serials: string[]) => api.post<{ status: string }>(`${B}/stands/orders/${id(oid)}/assign`, { serials });
export const shipStandOrder = (oid: string, b: { carrier?: string; trackingNumber?: string }) => api.post<{ status: string }>(`${B}/stands/orders/${id(oid)}/ship`, b);

export interface DrawingPlanRow { id: string; title: string; summary: string | null; status: 'planned' | 'funded_and_dated'; rulesUrl: string | null; datedFor: string | null; published: boolean; createdAt: string }
export interface DrawingPlanInput { title: string; summary?: string | null; status?: 'planned' | 'funded_and_dated'; datedFor?: string | null; rulesUrl?: string | null; published?: boolean }
export const getDrawingPlans = () => api.get<{ plans: DrawingPlanRow[] }>(`${B}/drawing-plans`);
export const createDrawingPlan = (b: DrawingPlanInput) => api.post<{ plan: { id: string } }>(`${B}/drawing-plans`, b);
export const updateDrawingPlan = (pid: string, b: Partial<DrawingPlanInput>) => api.patch<{ ok: boolean }>(`${B}/drawing-plans/${id(pid)}`, b);

// ── Price overrides (API 087) ─────────────────────────────────────────────────
export interface PriceOverrideRow {
  id: string; helloHangoutId: string; name: string; address: string; priceCents: number; previousPriceCents: number; reason: string;
  setBy: string | null; setAt: string; status: 'active' | 'removed' | 'superseded'; closedAt: string | null; closedReason: string | null; annualCostCents: number;
}
export interface PriceOverrides { listPriceCents: number; commissionCents: number; active: PriceOverrideRow[]; log: PriceOverrideRow[]; totalAnnualCostCents: number }
export interface FoundHangout { id: string; name: string; address: string; status: string; priceCents: number }
export const getPriceOverrides = () => api.get<PriceOverrides>('/admin/price-overrides');
export const findHangoutsForOverride = (q: string) => api.get<{ hangouts: FoundHangout[] }>(`/admin/price-overrides/find?q=${encodeURIComponent(q)}`);
export const setPriceOverride = (b: { helloHangoutId: string; priceCents: number; reason: string }) => api.post<{ override: { id: string } }>('/admin/price-overrides', b);
export const removePriceOverride = (oid: string, reason: string) => api.post<{ removed: boolean; restoredPriceCents: number }>(`/admin/price-overrides/${id(oid)}/remove`, { reason });

// ── Venue links (API 103): operator-set legacy hangout <-> Hello Hangout ─────
export interface VenueHelloRow { id: string; name: string; address: string; status: string; linkedLegacy: { id: string; name: string; address: string } | null }
export interface VenueLegacyRow { id: string; name: string; address: string; status: string; linkedHello: { id: string; name: string } | null }
export interface VenueLinkLogRow { id: string; action: 'linked' | 'cleared'; reason: string; at: string; helloName: string; legacyName: string; by: string | null }
export const searchVenueHello = (q: string) => api.get<{ hangouts: VenueHelloRow[] }>(`/admin/venue-links/hello?q=${encodeURIComponent(q)}`);
export const searchVenueLegacy = (q: string) => api.get<{ legacy: VenueLegacyRow[] }>(`/admin/venue-links/legacy?q=${encodeURIComponent(q)}`);
export const getVenueLinkLog = () => api.get<{ log: VenueLinkLogRow[] }>('/admin/venue-links/log');
export const setVenueLink = (b: { helloHangoutId: string; legacyHangoutId: string; reason: string }) => api.post<{ linked: boolean }>('/admin/venue-links', b);
export const clearVenueLink = (helloHangoutId: string, reason: string) => api.post<{ cleared: boolean }>('/admin/venue-links/clear', { helloHangoutId, reason });
