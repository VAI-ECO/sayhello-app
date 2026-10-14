/**
 * The terms accept happens on the phone screen (RULES 36.2), before the account exists. The account is created by
 * the OTP verify call, so this module carries "accepted" from that screen to api.auth.verifyOTP, which sends it once
 * and the server records it (migration 303). Memory only, on purpose: if the app is closed between the two steps the
 * person starts again at the phone screen and accepts again, so a stale acceptance can never ride along on a later
 * sign-in, and no expiry figure has to be invented.
 */
let accepted = false;

export function markTermsAccepted(): void {
  accepted = true;
}

export function hasAcceptedTerms(): boolean {
  return accepted;
}

/** Cleared after a successful sign-in: the acceptance has been delivered. */
export function clearTermsAccepted(): void {
  accepted = false;
}
