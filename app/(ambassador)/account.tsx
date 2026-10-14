/**
 * AMBASSADOR ACCOUNT — CANON-RL-03-SN-34. Role settings only: who this account is as an Ambassador, the payout chain,
 * the code, the book held, and the way out (Stop being an Ambassador → the opt-out screen, never an action here).
 * Bank, schedule and tax belong to the payout provider (§14.12-14.15), which is not connected: the screen says so and
 * shows no bank digits. The design's "held of {cap}" needs an Ambassador cap that no canon figure sets, so only the
 * number held is shown.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getAmbassadorHangouts, getAmbassadorMe, type AmbassadorMe } from '../../src/api/ambassador';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';
import { dayMonthYear } from '../../src/lib/ambassador-format';

export default function AmbassadorAccountScreen() {
  const router = useRouter();
  const [me, setMe] = useState<AmbassadorMe | null>(null);
  const [held, setHeld] = useState<number | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    const [m, h] = await Promise.all([getAmbassadorMe(), getAmbassadorHangouts()]);
    if (m?.error || !m?.data) { setState('error'); return; }
    setMe(m.data.me);
    setHeld(h?.data ? h.data.hangouts.filter((x) => x.youService).length : null);
    setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const row = (label: string, value: string, id: string) => (
    <View style={s.row}><Text style={s.label}>{label}</Text><Text style={s.value} testID={id}>{value}</Text></View>
  );
  return (
    <AmbassadorShell title={t('ambRole.account.title')} subtitle={me?.displayName ? `${me.displayName} · ${t('ambRole.account.role')}` : t('ambRole.account.role')} onBack={() => router.back()} testID="ambassador-account">
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' ? (
        <Card tone="error"><TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="account-retry"><Text accessibilityRole="alert" style={s.body}>{t('ambRole.loadFailed')} {t('ambRole.retry')}</Text></TouchableOpacity></Card>
      ) : null}
      {state === 'ready' && me ? (
        <>
          <Card testID="account-paid">
            <Text style={s.head}>{t('ambRole.account.gettingPaid')}</Text>
            {row(t('ambRole.account.bank'), t('ambRole.account.bankNone'), 'account-bank')}
            {row(t('ambRole.account.schedule'), t('ambRole.account.scheduleNone'), 'account-schedule')}
            {row(t('ambRole.account.tax'), t(me.w9Collected ? 'ambRole.account.taxOn' : 'ambRole.account.taxOff'), 'account-tax')}
          </Card>
          <Card testID="account-role">
            <Text style={s.head}>{t('ambRole.account.thisRole')}</Text>
            <TouchableOpacity onPress={() => router.push('/(ambassador)/my-code')} accessibilityRole="button" testID="account-code-link">
              {row(t('ambRole.account.yourCode'), me.ambassadorCode ?? '—', 'account-code')}
            </TouchableOpacity>
            {held !== null ? row(t('ambRole.account.held'), String(held), 'account-held') : null}
            {me.since ? row(t('ambRole.account.since'), dayMonthYear(me.since), 'account-since') : null}
          </Card>
          <TouchableOpacity onPress={() => router.push('/(ambassador)/opt-out')} accessibilityRole="button" testID="account-stop">
            <Card><Text style={s.head}>{t('ambRole.account.stop')}</Text></Card>
          </TouchableOpacity>
          <Text style={s.small}>{t('ambRole.account.note')}</Text>
        </>
      ) : null}
    </AmbassadorShell>
  );
}

const s = StyleSheet.create({
  head: { fontSize: 16.5, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  label: { fontSize: 15, color: Colors.Muted, flexShrink: 1 },
  value: { fontSize: 15, fontWeight: '700', color: Colors.Ink, flexShrink: 1, textAlign: 'right' },
});
