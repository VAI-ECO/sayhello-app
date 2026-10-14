/**
 * Open to Hellos, as this device last learned it (W8-A). The map screen owns the switch; the discovery reporter
 * listens here so turning it on starts reporting, and turning it off stops at once.
 */
type Listener = (open: boolean) => void;
let current: boolean | null = null;
const listeners = new Set<Listener>();

export function getKnownOpen(): boolean | null { return current; }
export function setKnownOpen(open: boolean): void {
  current = open;
  for (const l of listeners) { try { l(open); } catch { /* a listener must not break the switch */ } }
}
export function subscribeOpen(l: Listener): () => void { listeners.add(l); return () => { listeners.delete(l); }; }
export function resetKnownOpen(): void { current = null; }
