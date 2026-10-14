import { openState, isValidClock } from '../hangout-hours';

// Local-time dates: 2026-09-21 is a Monday.
const at = (day: number, h: number, m = 0) => new Date(2026, 8, 21 + day, h, m);

describe('Hello Hangout hours — "open now" in the viewer\'s local time (§17.17)', () => {
  const hours = {
    mon: { closed: false, open: '16:00', close: '02:00' }, // runs past midnight
    tue: { closed: true },
    wed: { closed: false, open: '09:00', close: '17:00' },
  };

  it('is open inside the day\'s hours and says when it closes', () => {
    expect(openState(hours, at(0, 18))).toEqual({ open: true, closesAt: '02:00' });
    expect(openState(hours, at(2, 9))).toEqual({ open: true, closesAt: '17:00' });
  });

  it('carries Monday\'s late hours into early Tuesday, even though Tuesday is closed', () => {
    expect(openState(hours, at(1, 1, 30))).toEqual({ open: true, closesAt: '02:00' });
    expect(openState(hours, at(1, 2, 0))).toEqual({ open: false });
  });

  it('is closed before opening, at closing time, and on a day with no hours', () => {
    expect(openState(hours, at(0, 15, 59))).toEqual({ open: false });
    expect(openState(hours, at(2, 17))).toEqual({ open: false });
    expect(openState(hours, at(3, 12))).toEqual({ open: false });
  });

  it('returns null when no hours were published, so nothing is claimed', () => {
    expect(openState(null)).toBeNull();
    expect(openState({})).toBeNull();
  });

  it('accepts only 24-hour HH:MM', () => {
    expect(isValidClock('09:00')).toBe(true);
    expect(isValidClock('23:59')).toBe(true);
    expect(isValidClock('24:00')).toBe(false);
    expect(isValidClock('4pm')).toBe(false);
    expect(isValidClock(null)).toBe(false);
  });
});
