/**
 * Deciding whether the map has to move before a pin opened from elsewhere (a Connections row) can be seen.
 * Pure; the map screen does the loading. No distance is computed or shown (RULES §8.12): this only asks whether a
 * point lies inside the box the map is already showing.
 */
import type { Bbox } from '../api/map';

/** True when the pin has a usable position and the current view either does not exist yet or does not contain it. */
export function pinNeedsFraming(bbox: Bbox | null, lat: unknown, lng: unknown): lat is number {
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!bbox) return true;
  return lat < bbox.minLat || lat > bbox.maxLat || lng < bbox.minLng || lng > bbox.maxLng;
}
