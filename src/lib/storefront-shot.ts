/**
 * The storefront photo is taken at step 3, before the Hello Hangout exists (it is created at the
 * price step). The bytes wait here, in memory only, until the signed Hello Hangout's id is known;
 * `take()` hands them over once and clears them. Never persisted, never put in a route param.
 */
import type { PhotoMime } from './photo-bytes';

let held: { bytes: Uint8Array; mime: PhotoMime } | null = null;

export function holdStorefrontShot(shot: { bytes: Uint8Array; mime: PhotoMime } | null): void {
  held = shot;
}
export function takeStorefrontShot(): { bytes: Uint8Array; mime: PhotoMime } | null {
  const out = held;
  held = null;
  return out;
}
