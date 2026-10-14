/**
 * STOP BEING AN AMBASSADOR — CANON-RL-03-SN-24 ("Opt out — type to confirm"; RULES §14.16-14.20). A declared action, never
 * inferred. Shows what is kept (EARNED), what stops (BUILDING) and what happens to the places; the Ambassador types
 * OPT OUT to confirm. The server holds the position for the hold setting (MONEY Part 6, 48 hours) before anything is
 * reassigned and the Ambassador can reinstate in that time.
 * Dollar amounts appear only when the server sends them (MA-05 / feature_earnings_figures_cleared): until then the
 * counts show and the amounts do not. NOT built here, recorded: the job that confirms the opt-out when the hold ends,
 * returns the places to the queue and emails the copy (§14.19) — the screen starts the hold and shows its state.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { formatCents } from '../../src/lib/money-format';
import { getOptOutPreview, optOut, reinstate, type OptOutPreview } from '../../src/api/ambassador-role';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';

export default function OptOutScreen() {
  const router = useRouter();
  const [p, setP] = useState<OptOutPreview | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await getOptOutPreview();
    if (r?.error || !r?.data) { setState('error'); return; }
    setP(r.data); setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function confirm() {
    if (busy || !p || p.alreadyOptedOut) return;
    setBusy(true); setMessage(null);
    const r = await optOut(typed.trim());
    setBusy(false);
    if (r?.error) { setMessage(r.error.code === 'confirmation_mismatch' ? t('ambRole.optOut.mismatch') : t('ambRole.optOut.failed')); return; }
    setTyped(''); await load();
  }
  async function keepGoing() {
    if (busy) return;
    setBusy(true); setMessage(null);
    const r = await reinstate();
    setBusy(false);
    if (r?.error) { setMessage(t('ambRole.optOut.failed')); return; }
    setMessage(t('ambRole.optOut.reinstated')); await load();
  }

  const when = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  return (
    <AmbassadorShell title={t('ambRole.optOut.title')} subtitle={t('ambRole.optOut.lead')} onBack={() => router.back()} testID="ambassador-opt-out">
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' ? (
        <Card tone="error"><TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="opt-out-retry"><Text accessibilityRole="alert" style={s.body}>{t('ambRole.loadFailed')} {t('ambRole.retry')}</Text></TouchableOpacity></Card>
      ) : null}
      {state === 'ready' && p && p.alreadyOptedOut ? (
        <Card testID="opt-out-held">
          {p.confirmed ? (
            <><Text style={s.head}>{t('ambRole.optOut.confirmedTitle')}</Text><Text style={s.body}>{t('ambRole.optOut.confirmedBody')}</Text></>
          ) : p.reinstated ? (
            <Text style={s.head}>{t('ambRole.optOut.reinstated')}</Text>
          ) : (
            <>
              <Text style={s.head}>{t('ambRole.optOut.heldTitle')}</Text>
              <Text style={s.body}>{t('ambRole.optOut.heldBody', { when: when(p.holdExpiresAt) })}</Text>
              <TouchableOpacity onPress={() => void keepGoing()} disabled={busy} accessibilityRole="button" style={s.outline} testID="opt-out-reinstate"><Text style={s.outlineText}>{t('ambRole.optOut.reinstate')}</Text></TouchableOpacity>
            </>
          )}
        </Card>
      ) : null}
      {state === 'ready' && p && !p.alreadyOptedOut ? (
        <>
          <Card><Text style={s.kicker}>{t('ambRole.optOut.keepTitle')}</Text><Text style={s.head}>{t('ambRole.optOut.keepHead')}</Text><Text style={s.body}>{t('ambRole.optOut.keepBody')}</Text></Card>
          <Card testID="opt-out-stops"><Text style={s.kicker}>{t('ambRole.optOut.stopsTitle')}</Text><Text style={s.head}>{t('ambRole.optOut.stopsHead')}</Text><Text style={s.body}>{t('ambRole.optOut.stopsBody', { count: p.buildingCount })}</Text></Card>
          <Card><Text style={s.kicker}>{t('ambRole.optOut.placesTitle')}</Text><Text style={s.body}>{t('ambRole.optOut.placesBody')}</Text></Card>
          <Text style={s.body} testID="opt-out-figures">
            {p.figuresWithheld || p.payoutPerHangoutPerYear === undefined || p.payoutYears === undefined
              ? t('ambRole.optOut.figuresWithheld')
              : t('ambRole.optOut.figures', { rate: formatCents(p.payoutPerHangoutPerYear), years: p.payoutYears, count: p.originatedCount })}
          </Text>
          <Text style={s.body}>{t('ambRole.optOut.holdBody', { hours: p.holdHours })}</Text>
          <Text style={s.kicker}>{t('ambRole.optOut.type', { phrase: p.confirmationRequired })}</Text>
          <TextInput value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false} accessibilityLabel={t('ambRole.optOut.type', { phrase: p.confirmationRequired })} style={s.input} testID="opt-out-input" />
          {message ? <Text accessibilityRole="alert" style={s.error} testID="opt-out-message">{message}</Text> : null}
          <TouchableOpacity onPress={() => void confirm()} disabled={busy || typed.trim().toUpperCase() !== p.confirmationRequired} accessibilityRole="button"
            style={[s.primary, (busy || typed.trim().toUpperCase() !== p.confirmationRequired) && s.off]} testID="opt-out-confirm">
            <Text style={s.primaryText}>{t('ambRole.optOut.confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={s.outline} testID="opt-out-keep"><Text style={s.outlineText}>{t('ambRole.optOut.keepGoing')}</Text></TouchableOpacity>
        </>
      ) : null}
      {message && state === 'ready' && p?.alreadyOptedOut && !p.reinstated ? <Text style={s.body}>{message}</Text> : null}
    </AmbassadorShell>
  );
}

const s = StyleSheet.create({
  kicker: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Faint },
  head: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 14.5, lineHeight: 20, color: Colors.SignalRed },
  input: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 12, paddingHorizontal: 14, minHeight: 52, fontSize: 18, fontWeight: '700', letterSpacing: 2, color: Colors.Ink },
  primary: { backgroundColor: Colors.Ink, borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Colors.Chalk, fontSize: 16, fontWeight: '800' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 16, fontWeight: '700' },
  off: { opacity: 0.4 },
});
