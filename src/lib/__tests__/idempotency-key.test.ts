import { newIdempotencyKey } from '../idempotency-key';

// The server (api routes/store.ts and ambassador-stands.ts) accepts 8-100 characters of letters, digits and _ . : -
const SERVER_PATTERN = /^[A-Za-z0-9_.:-]+$/;

describe('newIdempotencyKey', () => {
  it('always satisfies the server key pattern and length', () => {
    for (let i = 0; i < 500; i += 1) {
      const key = newIdempotencyKey();
      expect(key).toMatch(SERVER_PATTERN);
      expect(key.length).toBeGreaterThanOrEqual(8);
      expect(key.length).toBeLessThanOrEqual(100);
    }
  });

  it('does not repeat across attempts', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 2000; i += 1) keys.add(newIdempotencyKey());
    expect(keys.size).toBe(2000);
  });
});
