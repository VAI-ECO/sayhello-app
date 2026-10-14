import { lifetimeMinutes, retryAfterFromError, timingFromParams, timingFromReply, timingParams } from '../otp-timing';

describe('otp-timing', () => {
  it('reads the server figures from the reply and round-trips them as route params', () => {
    const t = timingFromReply({ expiresIn: 600, resendAfter: 30 });
    expect(t).toEqual({ expiresIn: 600, resendAfter: 30 });
    expect(timingFromParams(timingParams(t))).toEqual(t);
  });
  it('has no figure when the server gave none', () => {
    expect(timingFromReply(undefined)).toEqual({ expiresIn: null, resendAfter: null });
    expect(timingParams({ expiresIn: null, resendAfter: null })).toEqual({});
  });
  it('rounds the lifetime up to whole minutes', () => {
    expect(lifetimeMinutes(600)).toBe(10);
    expect(lifetimeMinutes(90)).toBe(2);
    expect(lifetimeMinutes(null)).toBeNull();
  });
  it('reads Retry-After seconds from a 429 body', () => {
    expect(retryAfterFromError({ retryAfterSeconds: 25 })).toBe(25);
    expect(retryAfterFromError(undefined)).toBeNull();
  });
});
