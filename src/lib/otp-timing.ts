/**
 * The OTP lifetime and resend countdown come from the server (admin settings otp_lifetime_minutes and
 * otp_resend_cooldown_seconds), never from a figure in the app. They arrive on the request-otp reply and travel
 * to the code screen as route params. Until a reply supplies them the screen shows no number.
 */
export interface OtpTiming {
  /** seconds the code lasts, or null if the server has not said */
  expiresIn: number | null;
  /** seconds before another code may be requested, or null if the server has not said */
  resendAfter: number | null;
}

function toSeconds(v: unknown): number | null {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/** Reads the server timing from a request-otp reply body. */
export function timingFromReply(data: unknown): OtpTiming {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return { expiresIn: toSeconds(d.expiresIn), resendAfter: toSeconds(d.resendAfter) };
}

/** Route params for the code screen. */
export function timingParams(t: OtpTiming): Record<string, string> {
  const p: Record<string, string> = {};
  if (t.expiresIn !== null) p.expiresIn = String(t.expiresIn);
  if (t.resendAfter !== null) p.resendAfter = String(t.resendAfter);
  return p;
}

/** Reads the timing back from route params. */
export function timingFromParams(params: { expiresIn?: unknown; resendAfter?: unknown }): OtpTiming {
  return { expiresIn: toSeconds(params.expiresIn), resendAfter: toSeconds(params.resendAfter) };
}

/** Whole minutes for "lasts N minutes" (rounded up, at least 1), or null if unknown. */
export function lifetimeMinutes(expiresIn: number | null): number | null {
  return expiresIn === null ? null : Math.max(1, Math.ceil(expiresIn / 60));
}

/** Seconds to wait from a 429 reply (error body retryAfterSeconds), or null. */
export function retryAfterFromError(body: unknown): number | null {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return toSeconds(b.retryAfterSeconds);
}
