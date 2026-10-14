/**
 * The Creator code from a tapped link (sayhello://r/CODE, sayhello.world/CODE, /join?code=). Held in memory and mirrored
 * to device storage so it survives the app being closed between the link tap and the OTP step. The OTP verify call
 * sends it once (api.auth.verifyOTP); the server attributes it only when that call CREATES the account, and this module
 * is cleared after any successful sign-in. The CODE is the attribution, `to` only says which door the link opened
 * (member/ambassador/business). Codes carry credit, never price (RULES 2.10).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sayhello.creator-code.v1';
/** A link tapped long ago is not a sign-up on that creator's channel. */
const MAX_AGE_MS = 14 * 86_400_000;
const CODE = /^[a-zA-Z0-9]{1,40}$/;

let pending: { code: string; to: string } | null = null;

export function setPendingCreatorCode(code: string | null | undefined, to = 'member'): void {
  pending = code && CODE.test(code) ? { code, to } : null;
  try {
    const write = pending ? AsyncStorage.setItem(KEY, JSON.stringify({ ...pending, at: Date.now() })) : AsyncStorage.removeItem(KEY);
    void Promise.resolve(write).catch(() => undefined);
  } catch { /* storage unavailable: memory only */ }
}

export function peekPendingCreatorCode(): { code: string; to: string } | null {
  return pending;
}

/** The pending code, loading the saved copy when memory is empty (cold start after the link tap). */
export async function restorePendingCreatorCode(): Promise<{ code: string; to: string } | null> {
  if (pending) return pending;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { code?: unknown; to?: unknown; at?: unknown };
    const fresh = typeof saved.at === 'number' && Date.now() - saved.at < MAX_AGE_MS;
    if (fresh && typeof saved.code === 'string' && CODE.test(saved.code)) {
      pending = { code: saved.code, to: typeof saved.to === 'string' ? saved.to : 'member' };
      return pending;
    }
    void Promise.resolve(AsyncStorage.removeItem(KEY)).catch(() => undefined);
  } catch { /* unreadable: no code */ }
  return null;
}

export function clearPendingCreatorCode(): void {
  pending = null;
  try { void Promise.resolve(AsyncStorage.removeItem(KEY)).catch(() => undefined); } catch { /* ignore */ }
}

export function takePendingCreatorCode(): { code: string; to: string } | null {
  const value = pending;
  clearPendingCreatorCode();
  return value;
}
