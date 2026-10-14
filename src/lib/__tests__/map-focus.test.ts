import { pinNeedsFraming } from '../map-focus';

const box = { minLat: 36.1, maxLat: 36.2, minLng: -86.8, maxLng: -86.7 };

describe('pinNeedsFraming', () => {
  it('is false for a pin inside the current view, including its edges', () => {
    expect(pinNeedsFraming(box, 36.15, -86.75)).toBe(false);
    expect(pinNeedsFraming(box, 36.1, -86.8)).toBe(false);
  });
  it('is true for a pin outside the current view on any side', () => {
    expect(pinNeedsFraming(box, 36.3, -86.75)).toBe(true);
    expect(pinNeedsFraming(box, 36.0, -86.75)).toBe(true);
    expect(pinNeedsFraming(box, 36.15, -86.6)).toBe(true);
    expect(pinNeedsFraming(box, 36.15, -86.9)).toBe(true);
  });
  it('is true when there is no view yet, and false when the pin has no usable position', () => {
    expect(pinNeedsFraming(null, 36.15, -86.75)).toBe(true);
    expect(pinNeedsFraming(box, undefined, undefined)).toBe(false);
    expect(pinNeedsFraming(box, null, -86.75)).toBe(false);
    expect(pinNeedsFraming(box, NaN, -86.75)).toBe(false);
  });
});
