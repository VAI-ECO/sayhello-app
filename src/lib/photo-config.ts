/**
 * The owner-set photo size cap (`photo_max_dimension_px`, GET /public/config). Fetched once and cached; any failure
 * or an unset value yields null so the caller falls back to the built-in cap. Never throws.
 */
import { getPublicConfig } from '../api/account';

let cached: number | null | undefined;

export async function getPhotoMaxEdge(): Promise<number | null> {
  if (cached !== undefined) return cached;
  try {
    const res = await getPublicConfig();
    const v = res.data?.photoMaxDimensionPx;
    if (res.data) cached = typeof v === 'number' && v > 0 ? v : null;
    return typeof v === 'number' && v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function resetPhotoMaxEdgeCache(): void { cached = undefined; }
