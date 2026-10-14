/**
 * HOST MODE DISPLAY TESTS
 * Tests timer calculations and server time offset
 */

import {
  calculateServerOffset,
  getCurrentServerTime,
  calculateHostModeTimer,
  isWindowExpired,
} from '../host-mode-display';

describe('calculateServerOffset', () => {
  it('calculates positive offset when server is ahead', () => {
    const now = new Date('2026-09-24T21:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const serverTime = '2026-09-24T21:05:00Z'; // 5 minutes ahead
    const offset = calculateServerOffset(serverTime);

    expect(offset).toBe(5 * 60 * 1000);
    jest.restoreAllMocks();
  });

  it('calculates negative offset when server is behind', () => {
    const now = new Date('2026-09-24T21:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const serverTime = '2026-09-24T20:55:00Z'; // 5 minutes behind
    const offset = calculateServerOffset(serverTime);

    expect(offset).toBe(-5 * 60 * 1000);
    jest.restoreAllMocks();
  });

  it('calculates zero offset when times match', () => {
    const now = new Date('2026-09-24T21:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const serverTime = '2026-09-24T21:00:00Z';
    const offset = calculateServerOffset(serverTime);

    expect(offset).toBe(0);
    jest.restoreAllMocks();
  });
});

describe('getCurrentServerTime', () => {
  it('returns current time plus offset', () => {
    const now = new Date('2026-09-24T21:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const offset = 5 * 60 * 1000; // 5 minutes
    const serverTime = getCurrentServerTime(offset);

    expect(serverTime).toBe(now.getTime() + offset);
    jest.restoreAllMocks();
  });
});

describe('calculateHostModeTimer', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T21:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when windowClosesAt is null', () => {
    const result = calculateHostModeTimer(null, 10, 0);
    expect(result).toBeNull();
  });

  it('calculates correct minutes left and progress at start', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z'; // 10 minutes from now
    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result).toEqual({
      minutesLeft: 10,
      progress: 0,
      expired: false,
    });
  });

  it('calculates correct minutes left and progress at halfway', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z'; // 10 minutes total
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T21:05:00Z').getTime()); // 5 minutes in

    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result).toEqual({
      minutesLeft: 5,
      progress: 0.5,
      expired: false,
    });
  });

  it('rounds minutes up: 9.1 min -> 10 min', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z';
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T21:00:10Z').getTime()); // 10 seconds in

    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result?.minutesLeft).toBe(10); // 9.83 minutes rounds to 10
  });

  it('returns expired when time is up', () => {
    const windowClosesAt = '2026-09-24T21:00:00Z'; // Now
    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result).toEqual({
      minutesLeft: 0,
      progress: 1,
      expired: true,
    });
  });

  it('returns expired when time is in the past', () => {
    const windowClosesAt = '2026-09-24T20:50:00Z'; // 10 minutes ago
    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result).toEqual({
      minutesLeft: 0,
      progress: 1,
      expired: true,
    });
  });

  it('clamps progress to 0..1', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z';
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T21:15:00Z').getTime()); // 5 minutes past close

    const result = calculateHostModeTimer(windowClosesAt, 10, 0);

    expect(result?.progress).toBe(1);
    expect(result?.expired).toBe(true);
  });

  it('uses server offset correctly', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z';
    const serverOffset = 2 * 60 * 1000; // Server is 2 minutes ahead

    const result = calculateHostModeTimer(windowClosesAt, 10, serverOffset);

    expect(result?.minutesLeft).toBe(8); // 10 - 2 = 8 minutes left from server perspective
    expect(result?.progress).toBe(0.2); // 2/10 elapsed
  });

  it('handles different window lengths', () => {
    const windowClosesAt = '2026-09-24T21:05:00Z'; // 5 minutes from now
    const result = calculateHostModeTimer(windowClosesAt, 5, 0);

    expect(result).toEqual({
      minutesLeft: 5,
      progress: 0,
      expired: false,
    });
  });
});

describe('isWindowExpired', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T21:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when windowClosesAt is null', () => {
    expect(isWindowExpired(null, 0)).toBe(true);
  });

  it('returns false when window has not expired', () => {
    const windowClosesAt = '2026-09-24T21:10:00Z'; // 10 minutes from now
    expect(isWindowExpired(windowClosesAt, 0)).toBe(false);
  });

  it('returns true when window has expired', () => {
    const windowClosesAt = '2026-09-24T20:50:00Z'; // 10 minutes ago
    expect(isWindowExpired(windowClosesAt, 0)).toBe(true);
  });

  it('returns true when window closes exactly now', () => {
    const windowClosesAt = '2026-09-24T21:00:00Z'; // Now
    expect(isWindowExpired(windowClosesAt, 0)).toBe(true);
  });

  it('uses server offset correctly', () => {
    const windowClosesAt = '2026-09-24T21:05:00Z'; // 5 minutes from local time
    const serverOffset = 6 * 60 * 1000; // Server is 6 minutes ahead

    // From server perspective, window closed 1 minute ago
    expect(isWindowExpired(windowClosesAt, serverOffset)).toBe(true);
  });

  it('prevents stale expired timestamp from resetting countdown', () => {
    const windowClosesAt = '2026-09-24T20:50:00Z'; // Already expired
    const serverOffset = 0;

    expect(isWindowExpired(windowClosesAt, serverOffset)).toBe(true);
  });
});
