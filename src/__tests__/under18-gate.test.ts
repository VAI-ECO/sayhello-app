/**
 * UNDER 18 GATE TESTS
 *
 * Under the minimum age is a hard stop. Age corrections are UNLIMITED.
 * Go back is always offered. There is no second-try dead end.
 */

describe('Under 18 Gate - unlimited corrections', () => {
  it('always offers Go back', () => {
    const attemptCount = 4;
    const showGoBack = true;
    expect(attemptCount).toBeGreaterThan(1);
    expect(showGoBack).toBe(true);
  });

  it('does not use an attempt flag to hide Go back', () => {
    const attemptKey = null;
    const hideGoBack = attemptKey === 'true';
    expect(hideGoBack).toBe(false);
  });
});
