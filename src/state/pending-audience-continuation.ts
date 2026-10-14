/**
 * The audience a creator link was tapped for — the `to` on /r/:code (member/business/ambassador,
 * the only three the link redirect serves). This is post-auth NAVIGATION state and is deliberately
 * separate from the creator code: the code is referral attribution and is spent at OTP verify
 * (the server applies it only when that call creates the account), while the door it opened must
 * survive the code being cleared, an app restart, an OTP error/retry and the shared age/profile/
 * onboarding steps. Written at the OTP boundary (api client) or when a signed-in person taps a link
 * (no OTP will ever run for them), consumed once when the app prepares the actual navigation to the
 * role's existing entry door. 'member' — the default door — needs no continuation at all and clears
 * whatever was stored; anything unrecognised is 'member'. Ages out like the code (14 days), so a link
 * tapped long ago is not a destination today. Never auto-grants a role: it only routes to the same
 * additive role entries a person could open themselves (ROLE_ROUTES). Session-bound: the api client
 * clears it on sign-out / 401 / account change, and restore() is generation-guarded so a late storage
 * read can never resurrect an audience that was just cleared or overwritten (logout, account switch,
 * newer link).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROLE_ROUTES, type RoleKey } from './pending-role';

const KEY = 'sayhello.audience-continuation.v1';
/** A link tapped long ago is not a destination today. */
const MAX_AGE_MS = 14 * 86_400_000;

export type CreatorAudience = 'member' | 'business' | 'ambassador';

/** The existing additive role entry each audience opens; member (and anything unknown) opens nothing extra. */
const AUDIENCE_ROLE: Record<CreatorAudience, RoleKey | null> = {
  member: null,
  business: 'hangout',
  ambassador: 'ambassador',
};

let pending: CreatorAudience | null = null;

/** A raw `to` from a link or a stored copy is valid only at the server's three audiences; anything else is 'member'. */
export function normalizeAudience(raw: unknown): CreatorAudience {
  return raw === 'member' || raw === 'business' || raw === 'ambassador' ? raw : 'member';
}

function persist(value: CreatorAudience | null): void {
  try {
    const write = value
      ? AsyncStorage.setItem(KEY, JSON.stringify({ audience: value, at: Date.now() }))
      : AsyncStorage.removeItem(KEY);
    void Promise.resolve(write).catch(() => undefined);
  } catch { /* storage unavailable: memory only */ }
}

/**
 * Bumped on every synchronous mutation (remember/clear). restore() captures it before awaiting
 * storage: a mutation that lands while the read is in flight means memory already holds the newer
 * state, so the late-read result must never overwrite it (stale-resurrect guard).
 */
let generation = 0;

/**
 * Remember which door a creator link opened. Called at the OTP boundary and on a signed-in link tap.
 * 'member' is the normal member journey, so it clears any stored continuation instead of storing one.
 */
export function rememberAudienceContinuation(raw: unknown): CreatorAudience {
  const audience = normalizeAudience(raw);
  generation++;
  if (AUDIENCE_ROLE[audience] === null) {
    pending = null;
    persist(null);
    return audience;
  }
  pending = audience;
  persist(audience);
  return audience;
}

/** The in-memory copy, for a screen already running in the session that wrote it. */
export function peekAudienceContinuation(): CreatorAudience | null {
  return pending;
}

/** The stored copy (cold start after the OTP/restart/link-tap that wrote it). Stale copies are dropped. */
export async function restoreAudienceContinuation(): Promise<CreatorAudience | null> {
  if (pending) return pending;
  const seen = generation;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { audience?: unknown; at?: unknown };
    // A clear or a newer link landed while storage was being read: memory already reflects the
    // newer state, and the late read must not resurrect what was just cleared or overwritten.
    if (seen !== generation) return pending;
    const fresh = typeof saved.at === 'number' && Date.now() - saved.at < MAX_AGE_MS;
    if (fresh && normalizeAudience(saved.audience) === saved.audience && AUDIENCE_ROLE[saved.audience as CreatorAudience]) {
      pending = saved.audience as CreatorAudience;
      return pending;
    }
    void Promise.resolve(AsyncStorage.removeItem(KEY)).catch(() => undefined);
  } catch { /* unreadable: no continuation */ }
  return null;
}

export function clearAudienceContinuation(): void {
  generation++;
  pending = null;
  persist(null);
}

/** The existing role entry for an audience ('member' and unknown → null). Pure mapping; touches no state. */
export function audienceDoorRoute(audience: CreatorAudience): string | null {
  const role = AUDIENCE_ROLE[audience];
  return role ? ROLE_ROUTES[role] : null;
}

/**
 * Consume the continuation and return the role entry for its audience, or null for member/none.
 * Call only while preparing the real navigation: taking it is what stops a later sign-in on this
 * device from inheriting a previous person's destination.
 */
export async function takeAudienceDoor(): Promise<string | null> {
  const audience = await restoreAudienceContinuation();
  if (!audience || AUDIENCE_ROLE[audience] === null) return null;
  clearAudienceContinuation();
  return ROLE_ROUTES[audience === 'business' ? 'hangout' : 'ambassador'];
}
