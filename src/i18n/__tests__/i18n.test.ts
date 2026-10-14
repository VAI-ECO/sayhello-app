/**
 * I18N TESTS
 */

import { t, en } from '../index';

describe('i18n', () => {
  it('returns string for valid key', () => {
    expect(t('common.continue')).toBe('Continue');
  });

  it('returns string for nested key', () => {
    expect(t('onboarding.phone.title')).toBe('Your phone number');
  });

  it('replaces template parameters', () => {
    const result = t('onboarding.otp.subtitle', { phone: '555-1234' });
    expect(result).toContain('555-1234');
  });

  it('returns key for invalid key', () => {
    expect(t('invalid.key')).toBe('invalid.key');
  });

  it('has all required onboarding keys', () => {
    expect(en.onboarding.phone).toBeTruthy();
    expect(en.onboarding.otp).toBeTruthy();
    expect(en.onboarding.name).toBeTruthy();
    expect(en.onboarding.birthday).toBeTruthy();
    expect(en.onboarding.photo).toBeTruthy();
    expect(en.onboarding.color).toBeTruthy();
    expect(en.onboarding.location).toBeTruthy();
    expect(en.onboarding.notifications).toBeTruthy();
    expect(en.onboarding.welcome).toBeTruthy();
  });
});
