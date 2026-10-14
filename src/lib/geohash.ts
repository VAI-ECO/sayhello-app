/**
 * Geohash encoder for the coarse proximity cell (W8-A). The phone turns its position into a short cell ON THE DEVICE
 * and sends only the cell; the server never receives a coordinate (sayhello-api docs/design/DISCOVERY-GPS-BLE.md).
 * The cell length is the server's `precision`, never a client constant.
 */
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat: number, lng: number, precision: number): string {
  let latMin = -90, latMax = 90, lngMin = -180, lngMax = 180;
  let out = '', bits = 0, bit = 0, even = true;
  while (out.length < precision) {
    if (even) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) { bit = (bit << 1) | 1; lngMin = mid; } else { bit = bit << 1; lngMax = mid; }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) { bit = (bit << 1) | 1; latMin = mid; } else { bit = bit << 1; latMax = mid; }
    }
    even = !even;
    if (++bits === 5) { out += BASE32[bit]; bits = 0; bit = 0; }
  }
  return out;
}
