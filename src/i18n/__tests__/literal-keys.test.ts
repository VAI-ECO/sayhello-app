import { execFileSync } from 'child_process';
import path from 'path';

// Every literal t('a.b.c') key used in app/ and src/ must resolve to a string in the English bundle.
// (A mis-nested block in s3-admin-en once left the Ambassador, Overrides, Coupons and locked-shop screens showing raw keys.)
describe('i18n literal keys', () => {
  it('has no missing keys', () => {
    const out = execFileSync('node', [path.join(__dirname, '../../../scripts/audit-i18n-keys.cjs')], { encoding: 'utf8' });
    expect(out.trim()).toBe('0 missing');
  });
});
