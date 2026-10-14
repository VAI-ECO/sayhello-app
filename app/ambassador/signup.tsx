/**
 * GETTING PAID — CANON-RL-03-SN-18 "Payout account · W-9 and Trolley".
 *
 * The W-9, identity checks and the payout rails all belong to the payout provider (§14.12–
 * 14.15); nothing custom is built. The provider is not connected, so this screen states the
 * chain and the one external step that unblocks it — it does NOT mark a tax form collected
 * (the server refuses POST /ambassador/payouts/w9 with 503). State comes from GET /ambassador/me.
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getAmbassadorMe, type AmbassadorMe } from '../../src/api/ambassador';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';

export default function GettingPaidScreen() {
  const router = useRouter();
  const [me, setMe] = useState<AmbassadorMe | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    const res = await getAmbassadorMe();
    if (id !== loadId.current) return;
    if (res.error || !res.data) {
      setState('error');
      return;
    }
    setMe(res.data.me);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const steps = me
    ? [
        {
          key: 'application',
          title: t('ambassador.signup.stepApplication'),
          note: t(me.isAmbassador ? 'ambassador.signup.stepApplicationDone' : 'ambassador.signup.stepApplicationOpen'),
          done: me.isAmbassador,
        },
        { key: 'tax', title: t('ambassador.signup.stepTax'), note: t('ambassador.signup.stepTaxNote'), done: me.w9Collected },
        { key: 'account', title: t('ambassador.signup.stepAccount'), note: t('ambassador.signup.stepAccountNote'), done: false },
      ]
    : [];

  return (
    <AmbassadorShell title={t('ambassador.signup.title')} testID="ambassador-getting-paid">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="signup-loading" />
      ) : state === 'error' ? (
        <Card tone="error" testID="signup-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.signup.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="signup-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <View style={styles.list} testID="payout-steps">
            {steps.map((s, index) => (
              <View key={s.key} style={[styles.step, index > 0 && styles.stepBorder]} testID={`payout-step-${s.key}`}>
                <View style={[styles.dot, s.done && styles.dotDone]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepNote}>{s.note}</Text>
                </View>
                <Text style={styles.stepState}>{t(s.done ? 'ambassador.signup.stepDone' : 'ambassador.signup.stepWaiting')}</Text>
              </View>
            ))}
          </View>
          <View style={styles.dashed}>
            <Text style={styles.stepNote}>{t('ambassador.signup.providerNote')}</Text>
          </View>
          <View
            style={styles.inert}
            accessible
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            accessibilityLabel={t('ambassador.signup.cta')}
            testID="signup-setup-payouts"
          >
            <Text style={styles.inertText}>{t('ambassador.signup.cta')}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/ambassador/earned-building')} accessibilityRole="button" style={styles.outline} testID="signup-earned-link">
            <Text style={styles.outlineText}>{t('ambassador.signup.earningsCta')}</Text>
          </TouchableOpacity>
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, overflow: 'hidden' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  stepBorder: { borderTopWidth: 1, borderTopColor: Colors.Hairline },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.Line },
  dotDone: { backgroundColor: Colors.DeepFern, borderColor: Colors.DeepFern },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  stepNote: { fontSize: 13.5, lineHeight: 20, color: Colors.Muted },
  stepState: { fontSize: 13, fontWeight: '700', color: Colors.Faint },
  dashed: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#D7D2CB', borderRadius: 12, padding: 14 },
  inert: { backgroundColor: '#EFEDEA', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  inertText: { color: Colors.Faint, fontSize: 16, fontWeight: '700' },
});
