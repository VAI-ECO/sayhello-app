/**
 * Coarse-location heartbeat (W8-A, RULES 8.10, FLOW-14 step 1), built OFF.
 *
 * Runs only while ALL of these hold: the app is in the FOREGROUND (RULES 8.6: never background location), Open to
 * Hellos is on, and the server says discovery is active (hello_producer_mode = gps_ble, which is never the
 * default). Otherwise it does nothing: no permission prompt, no location read, no request after the config check.
 *
 * The position becomes a geohash cell ON THE DEVICE; only the cell leaves the phone, at the length the server asks
 * for. The reporter never states or stores a distance, and a refusal is silent (limited mode, never a wall).
 * Dependencies are injected so the policy is testable without a device.
 */
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { getOpenToHellos } from '../api/map';
import { deleteHeartbeat, getDiscoveryConfig, postHeartbeat, type DiscoveryConfig } from '../api/discovery';
import { encodeGeohash } from './geohash';
import { getKnownOpen, setKnownOpen, subscribeOpen } from '../state/open-to-hellos';

export type HeartbeatOutcome = 'ok' | 'off' | 'not_open' | 'wrong_precision' | 'error';
export type CellRead = { ok: true; cell: string } | { ok: false; problem: 'denied' | 'failed' };

export interface ReporterDeps {
  getConfig(): Promise<DiscoveryConfig | null>;
  getOpen(): Promise<boolean | null>;
  readCell(precision: number): Promise<CellRead>;
  heartbeat(cell: string): Promise<HeartbeatOutcome>;
  clear(): Promise<void>;
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
}

const CONFIG_RECHECK_MS = 5 * 60_000;
const RETRY_MS = 30_000;

export function createDiscoveryReporter(deps: ReporterDeps) {
  let foreground = false;
  let open: boolean | null = null;
  let config: Extract<DiscoveryConfig, { active: true }> | null = null;
  let configAt = 0;
  let timer: unknown = null;
  let running = false;
  let heartbeatSent = false;
  let generation = 0;

  const cancelTimer = () => { if (timer !== null) { deps.clearTimer(timer); timer = null; } };
  const schedule = (ms: number) => { cancelTimer(); timer = deps.setTimer(() => { void tick(); }, ms); };

  async function stop(clear: boolean) {
    generation++;
    running = false;
    cancelTimer();
    if (clear && heartbeatSent) { heartbeatSent = false; try { await deps.clear(); } catch { /* the TTL deletes it anyway */ } }
  }

  async function tick() {
    if (!foreground || open === false) return;
    const mine = ++generation;
    const live = () => mine === generation && foreground && open !== false;

    if (!config || Date.now() - configAt > CONFIG_RECHECK_MS) {
      const c = await deps.getConfig();
      if (!live()) return;
      if (!c || !c.active) { config = null; running = false; return; }
      config = c; configAt = Date.now();
    }
    if (open === null) {
      const o = await deps.getOpen();
      if (mine !== generation || !foreground) return;
      if (o === null) { schedule(RETRY_MS); return; } // could not read it: try again, assume nothing
      open = o;
      if (!o) { running = false; return; }
    }

    const read = await deps.readCell(config.precision);
    if (!live()) return;
    if (!read.ok) {
      if (read.problem === 'denied') { running = false; return; } // limited mode: quiet, asked again next foreground
      schedule(RETRY_MS);
      return;
    }
    const outcome = await deps.heartbeat(read.cell);
    if (!live()) return;
    if (outcome === 'ok') { heartbeatSent = true; schedule(config.intervalSeconds * 1000); return; }
    if (outcome === 'off') { config = null; running = false; return; }
    if (outcome === 'not_open') { open = false; running = false; return; }
    if (outcome === 'wrong_precision') { configAt = 0; schedule(1000); return; }
    schedule(RETRY_MS);
  }

  function refresh() {
    if (foreground && open !== false) {
      if (!running) { running = true; void tick(); }
    } else {
      void stop(open === false || !foreground);
    }
  }

  return {
    setForeground(next: boolean) { foreground = next; refresh(); },
    setOpen(next: boolean | null) {
      open = next;
      if (next === true) { configAt = 0; if (running) { cancelTimer(); void tick(); } else refresh(); } else refresh();
    },
    stop: () => stop(true),
    /** test visibility only */
    get state() { return { foreground, open, running, heartbeatSent }; },
  };
}

// ---- real wiring ---------------------------------------------------------------------------------------------

export const realReporterDeps: ReporterDeps = {
  async getConfig() {
    const r = await getDiscoveryConfig();
    return r.error || !r.data ? null : r.data;
  },
  async getOpen() {
    const r = await getOpenToHellos();
    if (r.error || !r.data) return null;
    return r.data.open;
  },
  async readCell(precision) {
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return { ok: false, problem: 'denied' };
      if (!(await Location.hasServicesEnabledAsync())) return { ok: false, problem: 'denied' };
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { ok: false, problem: 'failed' };
      return { ok: true, cell: encodeGeohash(latitude, longitude, precision) };
    } catch {
      return { ok: false, problem: 'failed' };
    }
  },
  async heartbeat(cell) {
    const r = await postHeartbeat(cell);
    if (!r.error) return 'ok';
    if (r.error.code === 'discovery_off') return 'off';
    if (r.error.code === 'not_open' || r.error.code === 'not_eligible') return 'not_open';
    if (r.error.code === 'wrong_precision') return 'wrong_precision';
    return 'error';
  },
  async clear() { await deleteHeartbeat(); },
  setTimer: (fn, ms) => setTimeout(fn, ms),
  clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

/** Wires the reporter to AppState and the Open to Hellos switch. Returns the teardown. */
export function startDiscoveryReporting(deps: ReporterDeps = realReporterDeps): () => void {
  const reporter = createDiscoveryReporter(deps);
  const known = getKnownOpen();
  if (known !== null) reporter.setOpen(known);
  const unsub = subscribeOpen((o) => reporter.setOpen(o));
  const sub = AppState.addEventListener('change', (s) => reporter.setForeground(s === 'active'));
  reporter.setForeground(AppState.currentState === 'active');
  return () => { sub.remove(); unsub(); void reporter.stop(); };
}

export { setKnownOpen };
