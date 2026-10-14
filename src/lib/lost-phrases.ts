/**
 * Waverly's lost-connection lines (RULES 12.2). The server's admin-managed library is the source; the phone fetches
 * the active list and keeps it for the session. The three approved-to-start lines below are the OFFLINE FALLBACK
 * only: used when the server named no line for a lost Hello and the list cannot be fetched.
 */
import { api } from '../api/client';

export const LOST_PHRASES_FALLBACK = [
  'We lost the connection. Nothing to do with you.',
  "Signal's gone. Waverly's already looking for the next one.",
  'Connection went out of range.',
] as const;

let cached: string[] | null = null;

export async function fetchLostPhrases(): Promise<string[]> {
  if (cached) return cached;
  try {
    const r = await api.get<{ phrases: string[] }>('/public/lost-phrases');
    const list = (r?.data?.phrases ?? []).filter((p) => typeof p === 'string' && p.trim());
    if (list.length) { cached = list; return list; }
  } catch { /* offline: fall through */ }
  return [...LOST_PHRASES_FALLBACK];
}

/** Stable per Hello, varied across Hellos. */
export function pickLostPhrase(helloId: string, list: readonly string[]): string {
  let n = 0;
  for (const ch of helloId) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return list[n % list.length];
}

export function resetLostPhrasesCache(): void { cached = null; }
