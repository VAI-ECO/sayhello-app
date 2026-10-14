/**
 * The hello the encounter screens are working on, plus what THIS phone did in
 * it this session. The server is the authority for state; this only holds what
 * the server does not return to this viewer:
 *  - which hello is open (entry from the Hellos list sets it),
 *  - failed scan attempts (§10.38 — counted here, threshold from the server),
 *  - the local preview of the selfie this phone uploaded (never re-downloaded),
 *  - the last award the server reported for an action on this phone.
 * In memory only; lost on restart, when screens reload from the server.
 */

import * as client from '../api/client';

export type AwardKind = 'accept' | 'selfie' | 'continue';

interface HelloSession {
  failedScans: number;
  selfiePreviewUri: string | null;
  awards: Partial<Record<AwardKind, number>>;
}

let activeHelloId: string | null = null;
const sessions = new Map<string, HelloSession>();

function session(helloId: string): HelloSession {
  let s = sessions.get(helloId);
  if (!s) {
    s = { failedScans: 0, selfiePreviewUri: null, awards: {} };
    sessions.set(helloId, s);
  }
  return s;
}

export function setActiveHelloId(helloId: string | null): void {
  activeHelloId = helloId;
}

export function getActiveHelloId(): string | null {
  return activeHelloId;
}

export function recordFailedScan(helloId: string): number {
  const s = session(helloId);
  s.failedScans += 1;
  return s.failedScans;
}

export function getFailedScans(helloId: string): number {
  return sessions.get(helloId)?.failedScans ?? 0;
}

export function setSelfiePreview(helloId: string, uri: string): void {
  session(helloId).selfiePreviewUri = uri;
}

export function getSelfiePreview(helloId: string): string | null {
  return sessions.get(helloId)?.selfiePreviewUri ?? null;
}

/** Record only a number the server returned. */
export function recordAward(helloId: string, kind: AwardKind, points: unknown): void {
  if (typeof points === 'number' && Number.isSafeInteger(points) && points >= 0) {
    session(helloId).awards[kind] = points;
  }
}

export function getAward(helloId: string, kind: AwardKind): number | null {
  return sessions.get(helloId)?.awards[kind] ?? null;
}

export function resetActiveHello(): void {
  activeHelloId = null;
  sessions.clear();
}

// Sign-in, sign-out or a 401 replaces the session: nothing from one account's
// encounter (open id, preview, awards, failed scans) may reach the next one.
// Screens then reload from the server for the new account.
// (Optional call: some test doubles of the client do not provide it.)
client.addSessionChangeListener?.(resetActiveHello);
