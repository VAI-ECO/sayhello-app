/**
 * The creator-link audience (`to`: member/business/ambassador) as post-auth navigation state.
 * Covers validation/fallback, persistence across a cold start, expiry, and consume-once semantics.
 */

import {
  audienceDoorRoute,
  clearAudienceContinuation,
  normalizeAudience,
  peekAudienceContinuation,
  rememberAudienceContinuation,
  restoreAudienceContinuation,
  takeAudienceDoor,
} from '../pending-audience-continuation';

const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    removeItem: jest.fn(async (k: string) => { delete store[k]; }),
  },
}));

const stored = () => store['sayhello.audience-continuation.v1'];

describe('pending audience continuation', () => {
  beforeEach(() => {
    clearAudienceContinuation();
    for (const k of Object.keys(store)) delete store[k];
  });

  it('accepts only the three real audiences; anything else is member', () => {
    expect(normalizeAudience('member')).toBe('member');
    expect(normalizeAudience('business')).toBe('business');
    expect(normalizeAudience('ambassador')).toBe('ambassador');
    expect(normalizeAudience('admin')).toBe('member');
    expect(normalizeAudience('')).toBe('member');
    expect(normalizeAudience(undefined)).toBe('member');
    expect(normalizeAudience({ to: 'business' })).toBe('member');
  });

  it('remembers business and ambassador with a storage mirror', () => {
    rememberAudienceContinuation('business');
    expect(peekAudienceContinuation()).toBe('business');
    expect(stored()).toContain('business');
    expect(audienceDoorRoute('business')).toBe('/(hangout)/signup');
    expect(audienceDoorRoute('ambassador')).toBe('/ambassador');
  });

  it('member is the normal journey: it stores nothing and clears what was stored', () => {
    rememberAudienceContinuation('business');
    rememberAudienceContinuation('member');
    expect(peekAudienceContinuation()).toBeNull();
    expect(stored()).toBeUndefined();
    expect(audienceDoorRoute('member')).toBeNull();
  });

  it('an unsupported audience falls back to member safely', () => {
    rememberAudienceContinuation('business');
    rememberAudienceContinuation('not-a-door');
    expect(peekAudienceContinuation()).toBeNull();
    expect(stored()).toBeUndefined();
  });

  it('survives a cold start (memory empty, storage kept)', async () => {
    // What a previous session wrote before the process died: memory is gone, the mirror stays.
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'ambassador', at: Date.now() });
    expect(peekAudienceContinuation()).toBeNull();
    expect(await restoreAudienceContinuation()).toBe('ambassador');
  });

  it('drops a stored continuation older than 14 days', async () => {
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'business', at: Date.now() - 15 * 86_400_000 });
    expect(await restoreAudienceContinuation()).toBeNull();
    expect(stored()).toBeUndefined();
  });

  it('rejects a malformed stored value', async () => {
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: '..//', at: Date.now() });
    expect(await restoreAudienceContinuation()).toBeNull();
    expect(stored()).toBeUndefined();
  });

  it('take returns the door exactly once, then nothing', async () => {
    rememberAudienceContinuation('business');
    expect(await takeAudienceDoor()).toBe('/(hangout)/signup');
    expect(await takeAudienceDoor()).toBeNull();
    expect(peekAudienceContinuation()).toBeNull();
    expect(stored()).toBeUndefined();
  });

  it('take with no continuation is a safe null, never an invented route', async () => {
    expect(await takeAudienceDoor()).toBeNull();
  });
});
