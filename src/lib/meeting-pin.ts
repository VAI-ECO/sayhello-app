/**
 * Placing the Hello pin from this phone's own position (RULES §8.3 "placing a pin at the QR scan", §10.8 the exact spot).
 *
 * Foreground only, only after mutual accept, only if location permission is ALREADY granted: this never prompts and never
 * blocks (limited mode, §26.5). It is not discovery (§8.2): the position is sent once, for this Hello's pin, and the server
 * keeps the first one it receives (POST /hellos/:id/pin, migration 261). Silent on every failure; nothing is shown to the user.
 * Dependencies are injected so the policy is testable without a device.
 */
import * as Location from 'expo-location';
import { placeHelloPin } from '../api/hellos';
import { addSessionChangeListener } from '../api/client';

export type PinOutcome = 'placed' | 'already' | 'no_position' | 'error';

export interface PinDeps {
  readPosition(): Promise<{ lat: number; lng: number } | null>;
  post(helloId: string, pin: { lat: number; lng: number }): Promise<{ placed: boolean } | null>;
}

/** Hellos this session has settled (placed, or the server already had a pin). Only 'no_position' / 'error' may retry. */
const settled = new Set<string>();
const inFlight = new Set<string>();

export function resetMeetingPinState(): void {
  settled.clear();
  inFlight.clear();
}

export async function refineMeetingPin(helloId: string, deps: PinDeps = realPinDeps): Promise<PinOutcome> {
  if (settled.has(helloId)) return 'already';
  if (inFlight.has(helloId)) return 'already';
  inFlight.add(helloId);
  try {
    const pos = await deps.readPosition();
    if (!pos) return 'no_position';
    const res = await deps.post(helloId, pos);
    if (!res) return 'error';
    settled.add(helloId); // placed now, or the server already holds the pin: either way, nothing more to send
    return res.placed ? 'placed' : 'already';
  } catch {
    return 'error';
  } finally {
    inFlight.delete(helloId);
  }
}

export const realPinDeps: PinDeps = {
  async readPosition() {
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) return null;
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      if (!pos || !Number.isFinite(pos.coords.latitude) || !Number.isFinite(pos.coords.longitude)) return null;
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  },
  async post(helloId, pin) {
    const r = await placeHelloPin(helloId, pin);
    return r.error || !r.data ? null : { placed: r.data.placed === true };
  },
};

// A new sign-in must not inherit the previous account's settled Hellos.
addSessionChangeListener?.(resetMeetingPinState);
