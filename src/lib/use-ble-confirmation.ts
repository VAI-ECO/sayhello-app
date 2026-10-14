/**
 * Runs BLE fine confirmation for one Hello while an encounter screen is mounted and the app is in the foreground
 * (W8-A, RULES 8.11). Several encounter screens (accepted, arrow, scan) can use it in turn: one confirmer per Hello is
 * shared and kept alive across the navigation between them, and stopped shortly after the last one unmounts.
 *
 * `onConfirmed` fires once when the server accepts the proof; the caller reloads the Hello and the existing flow
 * moves on. `onLost` fires once when enough consecutive out-of-range samples closed the encounter (10.23): the Hello is
 * now missed, and Waverly's lost line is waiting in state/lost-phrase. Every other outcome is silent (8.13). `unsupported` is reported so web can say, honestly, to use the code.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createBleConfirmer, type BleOutcome } from './ble-confirm';
import { realBleDeps } from './ble-native';
import { getDiscoveryConfig } from '../api/discovery';
import { setLostPhrase } from '../state/lost-phrase';

type Entry = { confirmer: ReturnType<typeof createBleConfirmer>; refs: number; listeners: Set<(o: BleOutcome) => void>; stopTimer: ReturnType<typeof setTimeout> | null; outcome: BleOutcome | null };
const entries = new Map<string, Entry>();
const RELEASE_GRACE_MS = 1500; // bridges a screen-to-screen navigation

function acquire(helloId: string, listener: (o: BleOutcome) => void): () => void {
  let e = entries.get(helloId);
  if (!e) {
    const confirmer = createBleConfirmer(realBleDeps);
    e = { confirmer, refs: 0, listeners: new Set(), stopTimer: null, outcome: null };
    entries.set(helloId, e);
    const made = e;
    void confirmer.start(helloId).then((outcome) => {
      made.outcome = outcome;
      if (outcome === 'lost') setLostPhrase(helloId, confirmer.lostPhrase);
      for (const l of made.listeners) l(outcome);
      // A finished run is dropped so a later mount can try again (e.g. after the app returns to the foreground).
      if (entries.get(helloId) === made && outcome !== 'confirmed' && outcome !== 'lost') entries.delete(helloId);
    });
  }
  e.refs++;
  e.listeners.add(listener);
  if (e.stopTimer) { clearTimeout(e.stopTimer); e.stopTimer = null; }
  if (e.outcome) listener(e.outcome);
  const mine = e;
  return () => {
    mine.listeners.delete(listener);
    mine.refs--;
    if (mine.refs <= 0 && !mine.stopTimer) {
      mine.stopTimer = setTimeout(() => {
        if (mine.refs <= 0) { mine.confirmer.stop(); if (entries.get(helloId) === mine) entries.delete(helloId); }
      }, RELEASE_GRACE_MS);
    }
  };
}

export function useBleConfirmation(opts: { helloId: string | null; active: boolean; onConfirmed: () => void; onLost?: () => void }): { unsupported: boolean } {
  const { helloId, active, onConfirmed, onLost } = opts;
  const [unsupported, setUnsupported] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const cb = useRef(onConfirmed);
  cb.current = onConfirmed;
  const lostCb = useRef(onLost);
  lostCb.current = onLost;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!helloId || !active || !foreground) return;
    return acquire(helloId, (o) => {
      if (o === 'confirmed') cb.current();
      else if (o === 'lost') lostCb.current?.();
      // Say so only when discovery is actually on: with it off there is nothing to be unsupported about.
      else if (o === 'unsupported') void getDiscoveryConfig().then((r) => { if (r.data?.active) setUnsupported(true); });
    });
  }, [helloId, active, foreground]);

  return { unsupported };
}
