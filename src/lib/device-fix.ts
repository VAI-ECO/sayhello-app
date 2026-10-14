/**
 * A live device location reading (expo-location, Expo 57).
 *
 * Used where a real reading is the point — the Ambassador's visit check-in (§14.5 needs GPS
 * AND the venue's scan) and door signup pin. It NEVER falls back to a made-up coordinate: when
 * there is no reading the caller gets a reason and a way forward, not 0/0.
 *
 *  - permission asked with requestForegroundPermissionsAsync → { granted, canAskAgain };
 *  - `denied`  = refused but can be asked again;  `blocked` = refused for good → open Settings;
 *  - `services_off` = Location Services are off (hasServicesEnabledAsync);
 *  - `mocked` is Android-only on LocationObject; iOS leaves it undefined → null.
 * No accuracy threshold is applied here: the reading and its accuracy are reported as they are.
 */

import * as Location from 'expo-location';

export type FixProblem = 'denied' | 'blocked' | 'services_off' | 'failed';

export interface DeviceFix {
  lat: number;
  lng: number;
  accuracyM: number | null;
  mocked: boolean | null;
}

export type FixResult = { ok: true; fix: DeviceFix } | { ok: false; problem: FixProblem };

export async function readDeviceFix(): Promise<FixResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, problem: permission.canAskAgain === false ? 'blocked' : 'denied' };
    }
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, problem: 'services_off' };
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude, accuracy } = position.coords;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { ok: false, problem: 'failed' };
    }
    return {
      ok: true,
      fix: {
        lat: latitude,
        lng: longitude,
        accuracyM: typeof accuracy === 'number' && Number.isFinite(accuracy) ? accuracy : null,
        mocked: typeof position.mocked === 'boolean' ? position.mocked : null,
      },
    };
  } catch {
    return { ok: false, problem: 'failed' };
  }
}

/** Great-circle distance in metres — for showing the Ambassador where they stand (§8.12 does not govern this panel). */
export function metresBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
