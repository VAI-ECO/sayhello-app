/**
 * COUPON ENTRY on the Hello Hangout membership (MONEY Part 5, RULES §1.1). A coupon lowers the membership price and
 * nothing else; the server validates the code, applies the limits and the commission guard, and returns the price.
 * Nothing here computes a figure. A coupon is not an Ambassador or creator code (those only give credit).
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { t } from '../../i18n';
import { s3AdminEn } from '../../i18n/s3-admin-en';
import { Colors } from '../../theme/tokens';
import { formatCents } from '../../lib/money-format';
import { applyMembershipCoupon, getMembershipCoupon, removeMembershipCoupon, type AppliedCoupon } from '../../api/hangout-business';

export function CouponEntry({ helloHangoutId, onChanged }: { helloHangoutId: string; onChanged: () => void }) {
  const [current, setCurrent] = useState<AppliedCoupon | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const r = await getMembershipCoupon(helloHangoutId);
    if (r.data) setCurrent(r.data.coupon);
    setReady(true);
  }, [helloHangoutId]);
  useEffect(() => { void load(); }, [load]);

  const words = (c?: string) => (c && c in s3AdminEn.couponEntry.errors ? t(`couponEntry.errors.${c}`) : t('couponEntry.errors.fallback'));

  async function apply() {
    if (busy || !code.trim()) return;
    setBusy(true); setError(null);
    const r = await applyMembershipCoupon(helloHangoutId, code.trim());
    setBusy(false);
    if (r.error || !r.data) { setError(words(r.error?.code)); return; }
    setCurrent(r.data.coupon); setCode('');
    onChanged();
  }
  async function remove() {
    if (busy) return;
    setBusy(true); setError(null);
    const r = await removeMembershipCoupon(helloHangoutId);
    setBusy(false);
    if (r.error) { setError(words(r.error.code)); return; }
    setCurrent(null);
    onChanged();
  }

  if (!ready) return <ActivityIndicator color={Colors.Ink} />;
  return (
    <View style={styles.card} testID="coupon-entry">
      <Text style={styles.label}>{t('couponEntry.title')}</Text>
      {current ? (
        <>
          <Text style={styles.body} testID="coupon-applied">{t('couponEntry.applied', { name: current.name, off: formatCents(current.offCents) })}</Text>
          <TouchableOpacity onPress={() => void remove()} disabled={busy} accessibilityRole="button" testID="coupon-remove">
            <Text style={styles.link}>{t('couponEntry.remove')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder={t('couponEntry.placeholder')}
            placeholderTextColor={Colors.Faint} style={styles.input} accessibilityLabel={t('couponEntry.placeholder')} testID="coupon-code" />
          <TouchableOpacity onPress={() => void apply()} disabled={busy || !code.trim()} accessibilityRole="button" style={[styles.btn, (busy || !code.trim()) && styles.off]} testID="coupon-apply">
            {busy ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.btnText}>{t('couponEntry.apply')}</Text>}
          </TouchableOpacity>
        </>
      )}
      {error ? <Text accessibilityRole="alert" style={styles.error} testID="coupon-error">{error}</Text> : null}
      <Text style={styles.small}>{t('couponEntry.notTheSameAsCode')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 14, gap: 10 },
  label: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: Colors.Faint },
  body: { fontSize: 15.5, lineHeight: 22, color: Colors.Ink },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 16, color: Colors.Ink },
  btn: { backgroundColor: Colors.Ink, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  off: { opacity: 0.45 },
  link: { fontSize: 15, fontWeight: '700', color: Colors.Ink, textDecorationLine: 'underline' },
  error: { fontSize: 14.5, lineHeight: 20, color: Colors.SignalRed },
});
