import type { ConnectionHello } from '../api/hellos';

export interface MapDisplayPin {
  id: string;
  person1Name: string;
  person2Name: string;
  locationName: string;
  timestamp: string;
  pinNumber: string;
}

const text = (value: unknown, fallback: string) => typeof value === 'string' && value.trim() ? value : fallback;

/** Handle reveal-gated connection rows without guessing a person's identity. */
export function toMapDisplayPin(row: ConnectionHello): MapDisplayPin | null {
  if (['pending', 'missed', 'closed'].includes(row.status ?? '')) return null;
  // The connection endpoint may intentionally omit meeting details until reveal.
  // Never turn an incomplete connection into a fabricated map pin.
  if (typeof row.metAt !== 'string' || !row.metAt) return null;
  return {
    id: row.id,
    person1Name: text(row.user1FullName, 'a Say Hello member'),
    person2Name: text(row.user2FullName, 'a Say Hello member'),
    locationName: text(row.locationName, 'Location unavailable'),
    timestamp: row.metAt,
    pinNumber: text(row.helloCode, ''),
  };
}
