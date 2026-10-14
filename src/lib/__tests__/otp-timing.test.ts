import {
  DEFAULT_OTP_LENGTH, codeLengthFromParam, codeLengthFromReply, codeLengthParams,
  lifetimeMinutes, retryAfterFromError, timingFromParams, timingFromReply, timingParams,
} from '../otp-timing';

describe('otp code length (server setting otp_length)', () => {
  it('reads the length from the reply and round-trips it as a route param', () => {
    expect(codeLengthFromReply({ codeLength: 8 })).toBe(8);
    expect(codeLengthParams({ codeLength: 8 })).toEqual({ codeLength: '8' });
    expect(codeLengthFromParam('8')).toBe(8);
    expect(codeLengthFromParam(['8'])).toBe(8);
  });
  it('says nothing when the server did not, and the screen then uses the ruled default of 6', () => {
    expect(codeLengthFromReply(undefined)).toBeNull();
    expect(codeLengthFromReply({})).toBeNull();
    expect(codeLengthParams({})).toEqual({});
    expect(DEFAULT_OTP_LENGTH).toBe(6);
    expect(codeLengthFromParam(undefined)).toBe(6);
  });
  it('ignores junk instead of trusting it', () => {
    for (const bad of [0, -1, 6.5, 15, 'six', '', null, {}]) {
      expect(codeLengthFromReply({ codeLength: bad })).toBeNull();
      expect(codeLengthFromParam(bad)).toBe(6);
    }
  });
});

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
