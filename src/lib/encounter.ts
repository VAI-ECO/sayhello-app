/**
 * Encounter helpers: which screen a server hello belongs on, the countdown
 * format (§10.14 — hours + minutes, never seconds) and the design's colour
 * blend (identity colour at 35% over Midnight #1E2B63, RULES §34.4).
 */

import type { EncounterHello } from '../api/hellos';

export type EncounterRoute =
  | '/(encounter)/nudge'
  | '/(encounter)/scan'
  | '/(encounter)/countdown'
  | '/(encounter)/reveal'
  | '/(encounter)/missed-connection';

/** The screen for the server's current state of this hello. */
export function routeForHello(hello: EncounterHello): EncounterRoute {
  if (hello.status === 'missed') return '/(encounter)/missed-connection';
  if (hello.status === 'accepted') {
    if (hello.revealedAt) return '/(encounter)/reveal';
    return hello.qrScanned ? '/(encounter)/countdown' : '/(encounter)/scan';
  }
  return '/(encounter)/nudge';
}

/** "2h 47m" from milliseconds left; whole minutes rounded down, never seconds. */
export function formatHoursMinutes(msRemaining: number): string {
  const totalMinutes = Math.max(0, Math.floor(msRemaining / 60000));
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

const MIDNIGHT = '#1E2B63';

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `color` at `alpha` over Midnight; Midnight itself if the colour is unreadable. */
export function blendOverMidnight(color: string, alpha = 0.35): string {
  const top = parseHex(color);
  const base = parseHex(MIDNIGHT)!;
  if (!top) return MIDNIGHT;
  const mix = top.map((c, i) => Math.round(c * alpha + base[i] * (1 - alpha)));
  return `#${mix.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
