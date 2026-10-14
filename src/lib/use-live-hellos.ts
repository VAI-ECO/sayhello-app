/**
 * The live encounters that belong on the home tab, read from the server (GET /hellos):
 *
 *  - NUDGES   — a pending hello (Waverly-only shape, §10.6). It is the only thing that takes the
 *               top of the feed; the rest dims, so a nudge destroys nothing (Feed and Prizes frame).
 *  - REVEALS  — a Hello that has been revealed but not opened by this person yet (several = one card).
 *  - COUNTDOWNS — a mutually accepted hello whose reveal has not happened. While ANY is live the
 *               countdown replaces What's Happening as the default view (§10.13), and several
 *               stack (§10.14: hours + minutes, never seconds).
 *
 * The server is the authority for state and for the reveal time (revealScheduledAt); this only
 * derives what to show and re-reads the clock each minute. There is no push yet (provider not
 * connected), so it re-reads the server every minute and whenever the app returns to the
 * foreground — a reveal that landed while the phone slept appears on the next read. Nothing here
 * ever states a reason for a missing hello (§10.21).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getHellos, type EncounterHello } from '../api/hellos';

export interface LiveCountdown {
  hello: EncounterHello;
  /** Milliseconds to the reveal; ≤ 0 when the reveal is due. */
  msRemaining: number;
}

const POLL_MS = 60_000;

export function deriveLive(hellos: EncounterHello[], now: number) {
  const nudges = hellos.filter((h) => h.status === 'pending');
  // A missed connection's countdown runs too (§10.25): Icebreakers still arrive at the same reveal time.
  const countdowns: LiveCountdown[] = hellos
    .filter((h) => (h.status === 'accepted' || h.status === 'missed') && !h.revealedAt && h.revealScheduledAt)
    .map((hello) => ({ hello, msRemaining: new Date(hello.revealScheduledAt as string).getTime() - now }))
    .filter((c) => Number.isFinite(c.msRemaining))
    // Soonest first: the one that lands next is the one on top.
    .sort((a, b) => a.msRemaining - b.msRemaining || a.hello.id.localeCompare(b.hello.id));
  // Revealed, and this person has not opened it yet: it stays on top of Home until they do (063).
  // Missed ones count too - Waverly still hands over the name and Icebreakers (§10.24).
  const reveals = hellos.filter(
    (h) => (h.status === 'accepted' || h.status === 'missed') && Boolean(h.revealedAt) && h.revealSeen === false,
  );
  return { nudges, countdowns, reveals };
}

export function useLiveHellos() {
  const [hellos, setHellos] = useState<EncounterHello[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [now, setNow] = useState(() => Date.now());
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    let res: Awaited<ReturnType<typeof getHellos>> | undefined;
    try {
      res = await getHellos();
    } catch {
      res = undefined;
    }
    if (id !== loadId.current) return;
    setNow(Date.now());
    if (!res || res.error || !res.data) {
      // A failed read keeps what was already known: an encounter does not vanish on a bad signal.
      setState((s) => (s === 'ready' ? s : 'error'));
      return;
    }
    setHellos(res.data.hellos as unknown as EncounterHello[]);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const timer = setInterval(() => { void load(); }, POLL_MS);
    const sub = AppState.addEventListener('change', (next) => { if (next === 'active') void load(); });
    return () => { clearInterval(timer); sub.remove(); };
  }, [load]);

  const { nudges, countdowns, reveals } = deriveLive(hellos, now);
  return { state, nudges, countdowns, reveals, now, reload: load };
}
