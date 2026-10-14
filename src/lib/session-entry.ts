/**
 * Where a signed-in person lands. The account is created at OTP verification (RULES 26.2) with age_verified false;
 * the name-and-birthday step is what verifies it (PATCH /users/me → minimum_age, 24.1/24.5). Someone who left
 * before that step and signs in again is returned to it — not dropped into the app — so nobody loses their place
 * (26.7) and the age check is not skipped by closing the app. Corrections stay unlimited (24.17): the step can be
 * retried as often as needed.
 *
 * Only an explicit `ageVerified === false` sends someone back. A server that does not return the field says nothing
 * about age, so it never gates (and nothing is guessed).
 */
export type SignedInDestination = '/(onboarding)/name' | '/(tabs)/home';

export function destinationAfterSignIn(profile: unknown): SignedInDestination {
  const ageVerified = profile && typeof profile === 'object' ? (profile as { ageVerified?: unknown }).ageVerified : undefined;
  return ageVerified === false ? '/(onboarding)/name' : '/(tabs)/home';
}
