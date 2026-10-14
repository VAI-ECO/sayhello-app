/**
 * Picked-photo bytes for POST /users/me/photo.
 *
 * The server (sayhello-api src/lib/selfie-storage.ts) accepts JPEG, PNG, WebP
 * and HEIC/HEIF and refuses any request whose declared Content-Type does not
 * match the file's own leading bytes. The content type sent is therefore read
 * from those same bytes, never guessed from a file name or trusted from the
 * picker alone.
 */

export type PhotoMime = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic';

const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis'];

/** Decode the picker's base64 payload. Returns null when it is not valid base64. */
export function base64ToBytes(base64: string): Uint8Array | null {
  const clean = base64.replace(/\s/g, '');
  if (!clean || !/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) return null;
  let binary: string;
  try {
    binary = atob(clean);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...Array.from(bytes.subarray(start, end)));
}

/** Same signatures the server checks; null for anything it would refuse. */
export function imageMimeFromBytes(bytes: Uint8Array): PhotoMime | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp';
  if (ascii(bytes, 4, 8) === 'ftyp' && HEIC_BRANDS.includes(ascii(bytes, 8, 12))) return 'image/heic';
  return null;
}

/** An ArrayBuffer holding exactly these bytes (not a larger shared buffer). */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}
