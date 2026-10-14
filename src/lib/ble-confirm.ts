/**
 * BLE fine confirmation (W8-A, RULES 8.10-8.11, FLOW-14 step 4), built OFF. Core policy only: the native radio sits
 * behind `BleDeps` (ble-native.ts on phones, a no-op on web).
 *
 * After MUTUAL accept, in the FOREGROUND, this phone advertises its own per-Hello token (a 128-bit service UUID the
 * API issued) and scans for the other phone's. Hearing the other phone's token at or above the server's enter
 * threshold is posted as proof; the server decides. QR and the typed code stay as the fallback, always.
 * Failure is silent: no distance, no reason, no failure screen (8.12, 8.13, 10.21). Never runs in the background.
 *
 * LOST (10.23, MONEY Part 6): once the grace after mutual accept has passed, the phone samples every
 * `sampleIntervalSeconds`. A sample is in range when another app token was heard at or above the EXIT threshold within
 * that interval (hysteresis: it takes the stronger enter level to prove a meeting, the weaker exit level to stay
 * connected). `outOfRangeSamples` CONSECUTIVE misses are reported; the server closes the encounter. Only runs while an
 * encounter screen holds the confirmer, i.e. foregrounded.
 */
import type { BleToken } from '../api/discovery';

export type BleOutcome = 'confirmed' | 'lost' | 'timeout' | 'unsupported' | 'unavailable' | 'stopped';
export type TokenResult = { status: 'ok'; token: BleToken } | { status: 'off' | 'closed' | 'error' };
export type ProofResult = { status: 'confirmed' | 'miss' | 'closed' | 'off' | 'error' };

/** open = server not convinced (keep sampling); closed = the encounter closed as lost; ended = proven/closed already. */
export type LostResult = { status: 'closed'; waverly?: string } | { status: 'open' | 'ended' | 'off' | 'error' };

export interface BleDevice { serviceUUIDs?: string[]; rssi?: number }

export interface BleDeps {
  supported: boolean;
  getToken(helloId: string): Promise<TokenResult>;
  ensurePermissions(): Promise<boolean>;
  startAdvertising(uuid: string): void;
  stopAdvertising(): void;
  startScan(): void;
  stopScan(): void;
  onDevice(cb: (d: BleDevice) => void): () => void;
  postProof(helloId: string, heard: Array<{ token: string; rssi: number }>, pin?: { lat: number; lng: number }): Promise<ProofResult>;
  postLost(helloId: string, outOfRangeSamples: number): Promise<LostResult>;
  readPin(): Promise<{ lat: number; lng: number } | undefined>;
  now(): number;
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
}

/** Debounce between proof posts for the same Hello (a technical throttle, not a business figure). */
const POST_THROTTLE_MS = 2500;
const MAX_HEARD = 20;

export function normalizeUuid(raw: string): string {
  return raw.trim().replace(/[{}]/g, '').toLowerCase();
}

export function createBleConfirmer(deps: BleDeps) {
  let lostPhrase: string | null = null;
  let cleanup: (() => void) | null = null;
  let finish: ((o: BleOutcome) => void) | null = null;

  async function start(helloId: string): Promise<BleOutcome> {
    if (cleanup) return 'stopped'; // one run at a time
    if (!deps.supported) return 'unsupported';

    const t = await deps.getToken(helloId);
    if (t.status !== 'ok') return 'unavailable';
    const token = t.token;
    const own = normalizeUuid(token.ownToken);
    const marker = normalizeUuid(token.appMarker);
    const until = new Date(token.validUntil).getTime();
    if (!Number.isFinite(until) || until <= deps.now()) return 'unavailable';
    if (!(await deps.ensurePermissions())) return 'unavailable';

    return new Promise<BleOutcome>((resolve) => {
      const heard = new Map<string, number>();
      let posting = false;
      let lastPost = 0;
      let done = false;
      let timer: unknown = null;
      let sampleTimer: unknown = null;
      let lastInRangeAt: number | null = null;
      let misses = 0;
      let unsub: (() => void) | null = null;

      const end = (outcome: BleOutcome) => {
        if (done) return;
        done = true;
        if (timer !== null) deps.clearTimer(timer);
        if (sampleTimer !== null) deps.clearTimer(sampleTimer);
        try { unsub?.(); } catch { /* ignore */ }
        try { deps.stopScan(); } catch { /* ignore */ }
        try { deps.stopAdvertising(); } catch { /* ignore */ }
        cleanup = null; finish = null;
        resolve(outcome);
      };
      cleanup = () => end('stopped');
      finish = end;

      timer = deps.setTimer(() => end('timeout'), Math.max(0, until - deps.now()));

      const tryPost = async () => {
        if (posting || done || deps.now() - lastPost < POST_THROTTLE_MS) return;
        posting = true; lastPost = deps.now();
        try {
          // Only marker-prefixed tokens are ever uploaded; no other nearby device leaves the phone.
          const list = [...heard.entries()].slice(0, MAX_HEARD).map(([tok, rssi]) => ({ token: tok, rssi }));
          const pin = await deps.readPin();
          const r = await deps.postProof(helloId, list, pin);
          if (r.status === 'confirmed') end('confirmed');
          else if (r.status === 'closed' || r.status === 'off') end('unavailable');
        } catch { /* silent: keep listening */ }
        finally { posting = false; }
      };

      const intervalMs = Math.max(1, token.sampleIntervalSeconds) * 1000;
      const graceEnd = token.graceUntil && Number.isFinite(new Date(token.graceUntil).getTime())
        ? new Date(token.graceUntil).getTime()
        : deps.now() + token.graceMinutes * 60_000;
      const sample = async () => {
        if (done) return;
        const inRange = lastInRangeAt !== null && deps.now() - lastInRangeAt <= intervalMs;
        misses = inRange ? 0 : misses + 1;
        if (misses >= token.outOfRangeSamples) {
          try {
            const r = await deps.postLost(helloId, misses);
            if (done) return;
            if (r.status === 'closed') { lostPhrase = r.waverly ?? null; end('lost'); return; }
            if (r.status === 'ended' || r.status === 'off') { end('unavailable'); return; }
          } catch { /* silent: keep sampling */ }
        }
        if (!done) sampleTimer = deps.setTimer(() => { void sample(); }, intervalMs);
      };
      sampleTimer = deps.setTimer(() => { void sample(); }, Math.max(0, graceEnd - deps.now()) + intervalMs);

      unsub = deps.onDevice((d) => {
        if (done) return;
        const rssi = typeof d.rssi === 'number' ? d.rssi : null;
        if (rssi === null) return;
        for (const raw of d.serviceUUIDs ?? []) {
          const u = normalizeUuid(raw);
          if (u === own || !u.startsWith(marker)) continue;
          if (rssi >= token.exitRssiDbm) lastInRangeAt = deps.now();
          const prev = heard.get(u);
          if (prev === undefined || rssi > prev) heard.set(u, rssi);
          if (rssi >= token.enterRssiDbm) void tryPost();
        }
      });
      try {
        deps.startAdvertising(own);
        deps.startScan();
      } catch {
        end('unavailable');
      }
    });
  }

  return {
    start,
    stop() { cleanup?.(); },
    get running() { return cleanup !== null; },
    /** Waverly's lost line from the server (RULES 12.2), set when the outcome is 'lost'. */
    get lostPhrase() { return lostPhrase; },
  };
}
