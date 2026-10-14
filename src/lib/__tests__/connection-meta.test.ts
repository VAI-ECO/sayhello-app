import { connectionDay, connectionInitial, connectionPlaceDay } from '../connection-meta';

const NOW = Date.parse('2026-10-03T03:00:00Z');

describe('connectionPlaceDay', () => {
  it('is null before reveal: no place and no date leak (§10.6)', () => {
    expect(connectionPlaceDay({ revealedAt: null, locationName: 'The Tavern' }, NOW)).toBeNull();
    expect(connectionPlaceDay({}, NOW)).toBeNull();
  });
  it('joins place and day once revealed', () => {
    const line = connectionPlaceDay({ revealedAt: '2026-08-01T10:00:00Z', locationName: 'The Tavern' }, NOW)!;
    expect(line.startsWith('The Tavern · ')).toBe(true);
  });
  it('falls back to the day alone, or the place alone', () => {
    expect(connectionPlaceDay({ revealedAt: '2026-08-01T10:00:00Z' }, NOW)).toBe(connectionDay('2026-08-01T10:00:00Z', NOW));
    expect(connectionPlaceDay({ revealedAt: 'not a date', locationName: 'The Tavern' }, NOW)).toBe('The Tavern');
  });
});

describe('connectionDay', () => {
  it('returns an empty string for missing or invalid input', () => {
    expect(connectionDay(null, NOW)).toBe('');
    expect(connectionDay('nope', NOW)).toBe('');
  });
});

describe('connectionInitial', () => {
  it('uppercases the first letter and tolerates empty names', () => {
    expect(connectionInitial('  mara')).toBe('M');
    expect(connectionInitial('')).toBe('');
    expect(connectionInitial(null)).toBe('');
  });
});
