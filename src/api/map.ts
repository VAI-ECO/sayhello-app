/**
 * HELLO MAP API (sayhello-api src/routes/map.ts). Keys arrive camelCased.
 *
 * Pins exist on the map only after reveal (§10.41). Areas are map viewports,
 * never a distance or radius (§8.12, §8.14). Search returns Hello Hangouts
 * only — a person is never a search result.
 */

import { api } from './client';

export interface Bbox { minLat: number; maxLat: number; minLng: number; maxLng: number }

export interface MapPin {
  id: string;
  locationLat: number;
  locationLng: number;
  hangoutId: string | null;
  mine: boolean;
  color: string | null;
}

export interface MapHangout {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  founding: boolean;
}

export interface PinDetail {
  id: string;
  viewerIsParticipant: boolean;
  /** Where the pin is (GET /map/pins/:id already returns it); used to frame the map on a pin opened from Connections. */
  locationLat?: number | null;
  locationLng?: number | null;
  people: Array<{ displayName: string; identityColor: string | null }>;
  locationName: string | null;
  hangoutName: string | null;
  metAt: string | null;
  /** The Hello Hangout page this pin's venue opens, or null when the venue has no page. */
  directoryId?: string | null;
  hasSelfie: boolean;
  selfieUrl: string | null;
}

export interface AreaSummary {
  hellos: number;
  thisMonth: number;
  helloHangouts: number;
  recent: Array<{ id: string; mine: boolean; color: string | null }>;
}

function bboxQuery(b: Bbox): string {
  return `minLat=${b.minLat}&maxLat=${b.maxLat}&minLng=${b.minLng}&maxLng=${b.maxLng}`;
}

export async function getMapPins(params: { scope: 'mine' | 'all'; bbox?: Bbox | null; since?: string | null }) {
  const parts = [`scope=${params.scope}`];
  if (params.bbox) parts.push(bboxQuery(params.bbox));
  if (params.since) parts.push(`since=${encodeURIComponent(params.since)}`);
  return api.get<{ pins: MapPin[]; truncated: boolean }>(`/map/pins?${parts.join('&')}`);
}

export async function getMapHangouts(bbox: Bbox) {
  return api.get<{ hangouts: MapHangout[] }>(`/map/hangouts?${bboxQuery(bbox)}`);
}

export async function getPinDetail(id: string) {
  return api.get<{ pin: PinDetail }>(`/map/pins/${encodeURIComponent(id)}`);
}

export async function getAreaSummary(bbox: Bbox) {
  return api.get<{ area: AreaSummary }>(`/map/area?${bboxQuery(bbox)}`);
}

export async function searchHangouts(q: string) {
  return api.get<{ hangouts: MapHangout[] }>(`/map/search?q=${encodeURIComponent(q)}`);
}

// ---- Stage 04: one viewport query for every pin type ----

export type PinKind = 'hello' | 'hangout' | 'hootza' | 'org_event' | 'holla' | 'discount';
export const ALL_PIN_KINDS: PinKind[] = ['hello', 'hangout', 'hootza', 'org_event', 'holla', 'discount'];

/** The persisted entity a tap opens. */
export interface PinDestination { type: 'pin' | 'directory' | 'hootza'; id: string; postId?: string }

export interface ViewportItem {
  kind: PinKind;
  id: string;
  lat: number;
  lng: number;
  title: string | null;
  founding?: boolean;
  mine?: boolean;
  color?: string | null;
  startsAt?: string | null;
  orgName?: string | null;
  destination: PinDestination;
}

export interface ViewportCluster {
  count: number;
  lat: number;
  lng: number;
  bounds: Bbox;
  /** Listed when small enough, so a cluster that cannot be zoomed apart is still reachable. */
  members: ViewportItem[] | null;
}

export interface ViewportResult {
  items: ViewportItem[];
  clusters: ViewportCluster[];
  truncated: Partial<Record<PinKind, boolean>>;
}

export async function getViewport(params: { bbox: Bbox; kinds?: PinKind[]; since?: string | null; mine?: boolean; cells?: number }) {
  const parts = [bboxQuery(params.bbox)];
  if (params.kinds?.length) parts.push(`kinds=${params.kinds.join(',')}`);
  if (params.since) parts.push(`since=${encodeURIComponent(params.since)}`);
  if (params.mine) parts.push('mine=1');
  if (params.cells) parts.push(`cells=${params.cells}`);
  return api.get<ViewportResult>(`/map/viewport?${parts.join('&')}`);
}

export interface MapProviderStatus {
  provider: string;
  geocoding: { configured: boolean };
  basemap: { configured: boolean; renderer: 'grid' };
}
export function getMapProviderStatus() {
  return api.get<MapProviderStatus>('/map/provider');
}

export interface OpenToHellos { open: boolean; updatedAt: string | null; discoveryActive: boolean }
export function getOpenToHellos() {
  return api.get<OpenToHellos>('/map/open-to-hellos');
}
export function setOpenToHellos(open: boolean) {
  return api.put<OpenToHellos>('/map/open-to-hellos', { open });
}

export interface PlaceResult { name: string; address: string; lat: number; lng: number }
export interface HootzaSearchResult { id: string; title: string; locationName: string | null; lat: number; lng: number; kind: 'hootza' | 'org_event'; startsAt: string }
export interface FullSearch {
  hangouts: MapHangout[];
  hootzas: HootzaSearchResult[];
  places: { configured: boolean; results: PlaceResult[]; error: string | null };
}
export function searchMap(q: string, bias?: { lat: number; lng: number } | null) {
  const extra = bias ? `&lat=${bias.lat}&lng=${bias.lng}` : '';
  return api.get<FullSearch>(`/map/search?q=${encodeURIComponent(q)}${extra}`);
}

export function geocodeAddress(q: string) {
  return api.get<{ configured: boolean; results: PlaceResult[]; error: string | null }>(`/map/geocode?q=${encodeURIComponent(q)}`);
}
