/**
 * Make every picked/captured photo something the API accepts: JPEG or PNG, at a sane size.
 *
 * iPhone photos are HEIC. expo-image-picker and expo-camera already hand back JPEG when quality < 1 / imageType 'jpg',
 * so this is the safety net: if the bytes are anything but JPEG/PNG (HEIC, WebP) or very large, re-encode through
 * expo-image-manipulator as JPEG (long edge <= MAX_EDGE). Never throws; returns null when the photo cannot be read.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { base64ToBytes, imageMimeFromBytes, type PhotoMime } from './photo-bytes';

/** Long-edge cap. 2048 keeps a profile/storefront photo sharp and well under the 8 MB server limit. */
export const MAX_EDGE = 2048;
/** Re-encode anything above this even when it is already JPEG (server limit is 8 MB). */
export const MAX_PASS_THROUGH_BYTES = 6 * 1024 * 1024;

export interface UploadablePhoto {
  bytes: Uint8Array;
  mime: 'image/jpeg' | 'image/png';
}

export function needsReencode(mime: PhotoMime | null, byteLength: number): boolean {
  return mime === null || mime === 'image/heic' || mime === 'image/webp' || byteLength > MAX_PASS_THROUGH_BYTES;
}

export async function toUploadablePhoto(
  asset: { uri: string; base64?: string | null; width?: number; height?: number },
): Promise<UploadablePhoto | null> {
  const original = asset.base64 ? base64ToBytes(asset.base64) : null;
  const mime = original && original.length > 0 ? imageMimeFromBytes(original) : null;
  if (original && original.length > 0 && !needsReencode(mime, original.length) && (mime === 'image/jpeg' || mime === 'image/png')) {
    return { bytes: original, mime };
  }
  try {
    const ctx = ImageManipulator.manipulate(asset.uri);
    const { width = 0, height = 0 } = asset;
    if (width > MAX_EDGE || height > MAX_EDGE || (!width && !height)) {
      ctx.resize(width >= height && width ? { width: MAX_EDGE } : { height: MAX_EDGE });
    }
    const ref = await ctx.renderAsync();
    const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
    const bytes = saved.base64 ? base64ToBytes(saved.base64) : null;
    if (!bytes || imageMimeFromBytes(bytes) !== 'image/jpeg') return null;
    return { bytes, mime: 'image/jpeg' };
  } catch {
    return null;
  }
}
