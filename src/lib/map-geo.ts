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

/**
 * Display framing for pan and zoom (degrees across the viewport). A UI limit that keeps the grid readable and the
 * viewport query bounded; not a product figure and never shown to the user (§8.12, §8.14).
 */
export const MIN_SPAN_DEG = 0.002;
export const MAX_SPAN_DEG = 2;

/** Zoom about the centre. factor < 1 zooms in, > 1 zooms out; the span stays within the display limits. */
export function zoomBbox(b: Bbox, factor: number): Bbox {
  const cLat = (b.minLat + b.maxLat) / 2;
  const cLng = (b.minLng + b.maxLng) / 2;
  const clamp = (span: number) => Math.min(MAX_SPAN_DEG, Math.max(MIN_SPAN_DEG, span));
  const halfLat = clamp((b.maxLat - b.minLat) * factor) / 2;
  const halfLng = clamp((b.maxLng - b.minLng) * factor) / 2;
  return recentre({ minLat: cLat - halfLat, maxLat: cLat + halfLat, minLng: cLng - halfLng, maxLng: cLng + halfLng });
}

/** Move the viewport by a fraction of its own size (+x east, +y north). */
export function panBbox(b: Bbox, fracX: number, fracY: number): Bbox {
  const dLng = (b.maxLng - b.minLng) * fracX;
  const dLat = (b.maxLat - b.minLat) * fracY;
  return recentre({ minLat: b.minLat + dLat, maxLat: b.maxLat + dLat, minLng: b.minLng + dLng, maxLng: b.maxLng + dLng });
}

/** Keep a viewport on the globe by sliding it back, not by squashing it. */
function recentre(b: Bbox): Bbox {
  const spanLat = b.maxLat - b.minLat;
  const spanLng = b.maxLng - b.minLng;
  const minLat = Math.min(90 - spanLat, Math.max(-90, b.minLat));
  const minLng = Math.min(180 - spanLng, Math.max(-180, b.minLng));
  return { minLat, maxLat: minLat + spanLat, minLng, maxLng: minLng + spanLng };
}

/** A finger drag of (dx, dy) pixels on a width × height canvas, as the viewport that follows it. */
export function bboxAfterDrag(b: Bbox, dx: number, dy: number, width: number, height: number): Bbox {
  if (width <= 0 || height <= 0) return b;
  // Dragging the map right reveals what is to the west; dragging it down reveals what is to the north.
  return panBbox(b, -dx / width, dy / height);
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
