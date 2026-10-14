/**
 * DISCOVERY API (W8-A) - sayhello-api routes/discovery.ts and routes/hello-ble.ts. Built OFF on the server:
 * every call answers 409 discovery_off unless the owner has switched hello_producer_mode to gps_ble.
 * The app sends a coarse cell only (never coordinates) and never shows a distance (RULES 8.12).
 */
import { api } from './client';

export type DiscoveryConfig = { active: false } | { active: true; precision: number; intervalSeconds: number; ttlSeconds: number };

export function getDiscoveryConfig() {
  return api.get<DiscoveryConfig>('/discovery/config');
}

export function postHeartbeat(cell: string) {
  return api.post<{ ok: true; ttlSeconds: number; intervalSeconds: number }>('/discovery/heartbeat', { cell });
}

export function deleteHeartbeat() {
  return api.delete<{ ok: true }>('/discovery/heartbeat');
}

export interface BleToken {
  ownToken: string;
  appMarker: string;
  validUntil: string;
  enterRssiDbm: number;
  exitRssiDbm: number;
  sampleIntervalSeconds: number;
  outOfRangeSamples: number;
  graceMinutes: number;
  /** Out-of-range samples count only from this moment (grace after mutual accept). */
  graceUntil?: string;
}

export function getBleToken(helloId: string) {
  return api.get<BleToken>(`/hellos/${encodeURIComponent(helloId)}/ble-token`);
}

export interface BleProofResult { confirmed: boolean; alreadyScanned?: boolean }

export function postBleProof(helloId: string, heard: Array<{ token: string; rssi: number }>, pin?: { lat: number; lng: number }) {
  return api.post<BleProofResult>(`/hellos/${encodeURIComponent(helloId)}/ble-proof`, pin ? { heard, pin } : { heard });
}

export interface BleLostResult { closed: boolean; waverly?: string }

/** Phase 1, lost (RULES 10.23): the phone's count of consecutive out-of-range samples. The server decides. */
export function postBleLost(helloId: string, outOfRangeSamples: number) {
  return api.post<BleLostResult>(`/hellos/${encodeURIComponent(helloId)}/ble-lost`, { outOfRangeSamples });
}
