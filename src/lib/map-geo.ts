/**
 * Map viewport helpers. A viewport is the visible map area; it is never shown
 * or offered as a distance or radius (§8.12, §8.14 "change the town, not a
 * radius").
 *
 * There is no map tile provider in the app, so pins are drawn on the delivered
 * design's grid canvas by a plain equirectangular projection of their real
 * coordinates into the current viewport.
 */

import type { Bbox } from '../api/map';

/**
 * Display framing: how much map the viewport shows around a centre (degrees
 * of latitude/longitude). A UI zoom level, not a product figure and never
 * shown to the user.
 */
export const VIEWPORT_SPAN_DEG = 0.08;
/** Framing around a single Hello Hangout's area. */
export const PLACE_SPAN_DEG = 0.02;

export function bboxAround(lat: number, lng: number, span = VIEWPORT_SPAN_DEG): Bbox {
  const half = span / 2;
  return {
    minLat: Math.max(-90, lat - half),
    maxLat: Math.min(90, lat + half),
    minLng: Math.max(-180, lng - half),
    maxLng: Math.min(180, lng + half),
  };
}

/** The smallest viewport holding every point, padded; null for no points. */
export function bboxFitting(points: Array<{ lat: number; lng: number }>, pad = 0.15): Bbox | null {
  if (points.length === 0) return null;
  if (points.length === 1) return bboxAround(points[0].lat, points[0].lng);
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const dLat = Math.max(maxLat - minLat, 0.005) * pad;
  const dLng = Math.max(maxLng - minLng, 0.005) * pad;
  return {
    minLat: Math.max(-90, minLat - dLat),
    maxLat: Math.min(90, maxLat + dLat),
    minLng: Math.max(-180, minLng - dLng),
    maxLng: Math.min(180, maxLng + dLng),
  };
}

/** Position within a width × height canvas, or null if outside the viewport. */
export function project(lat: number, lng: number, box: Bbox, width: number, height: number): { x: number; y: number } | null {
  if (lat < box.minLat || lat > box.maxLat || lng < box.minLng || lng > box.maxLng) return null;
  const x = ((lng - box.minLng) / (box.maxLng - box.minLng)) * width;
  const y = ((box.maxLat - lat) / (box.maxLat - box.minLat)) * height;
  return { x, y };
}

/** Start of the current calendar year in the user's local time ("This year"). */
export function startOfThisYearIso(now = new Date()): string {
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export function bboxToParams(b: Bbox): Record<string, string> {
  return { minLat: String(b.minLat), maxLat: String(b.maxLat), minLng: String(b.minLng), maxLng: String(b.maxLng) };
}

export function bboxFromParams(p: Record<string, string | string[] | undefined>): Bbox | null {
  const n = (k: string) => Number(Array.isArray(p[k]) ? p[k]?.[0] : p[k]);
  const b = { minLat: n('minLat'), maxLat: n('maxLat'), minLng: n('minLng'), maxLng: n('maxLng') };
  return Object.values(b).every(Number.isFinite) && b.minLat < b.maxLat && b.minLng < b.maxLng ? b : null;
}
