/**
 * A Hello Hangout claim link opened while signed out (ledger 83). The one-time token is a credential, so it is held in
 * memory only: never AsyncStorage, never SecureStore, never logged. It survives in-app sign-in; an app restart drops it
 * and the emailed link still works. Whatever finishes sign-in takes it and sends the owner back to the claim screen with
 * `resume=1` (see INTEGRATION-NOTES: the sign-in success path needs that one hook).
 */
let pending: string | null = null;

export function rememberPendingClaim(token: string): void {
  pending = token;
}

/** Returns the remembered token once and forgets it. */
export function takePendingClaim(): string | null {
  const token = pending;
  pending = null;
  return token;
}

export function hasPendingClaim(): boolean {
  return pending !== null;
}

/** The route the sign-in success path should open when a claim is waiting; null when none is. */
export function claimResumeRoute(): { pathname: '/(hangout)/claim'; params: { token: string; resume: '1' } } | null {
  const token = takePendingClaim();
  return token ? { pathname: '/(hangout)/claim', params: { token, resume: '1' } } : null;
}
