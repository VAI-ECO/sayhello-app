import { encodeGeohash } from '../geohash';

describe('geohash encoder', () => {
  it('matches the standard reference values', () => {
    expect(encodeGeohash(57.64911, 10.40744, 11)).toBe('u4pruydqqvj');
    expect(encodeGeohash(42.605, -5.603, 5)).toBe('ezs42');
  });
  it('returns exactly the requested length, nothing more precise', () => {
    expect(encodeGeohash(37.7749, -122.4194, 7)).toHaveLength(7);
    expect(encodeGeohash(37.7749, -122.4194, 5)).toBe(encodeGeohash(37.7749, -122.4194, 7).slice(0, 5));
  });
});
