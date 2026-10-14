/**
 * H12 DEAL REDEMPTION — CANON-RL-02-SN-06 (P delivered; T/D in batch-03). "Redeeming".
 * POST /hello-hangouts/:id/redeem records the DEAL and the TIME, never the person — so a second
 * attempt with the same claim key reads as a time ("Already used · 14:02"), not a name. Only a
 * Special that is live now can be redeemed (both clocks, §17.6); only the owner's active Hello
 * Hangout can redeem. The member-side claim QR is not designed/built: redemption here is the tap
 * ("Scan it, or tap Redeem" — the tap is built, the scan is not).
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getManage } from '../../src/api/directory';
import { getRedemptions, redeemDeal } from '../../src/api/hangout-business';

type Deal = { id: string; title: string };

function clock(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function DealRedemptionScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [used, setUsed] = useState<number | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const [m, r] = await Promise.all([getManage(helloHangoutId), getRedemptions(helloHangoutId)]);
    if (m.error || !m.data) { setState('error'); return; }
    setActive(m.data.helloHangout.status === 'active');
    const live = m.data.onNow.filter((p) => p.postType === 'special').map((p) => ({ id: p.id, title: p.title }));
    setDeals(live);
    setPick((cur) => (cur && live.some((d) => d.id === cur) ? cur : live[0]?.id ?? null));
    setUsed(r.data?.redemptions.thisMonth ?? null);
    setState('ready');
  }, [helloHangoutId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function redeem() {
    if (!helloHangoutId || !pick || busy) return;
    setBusy(true);
    setResult(null);
    const res = await redeemDeal(helloHangoutId, pick);
    setBusy(false);
    if (res.error) {
      const body = res.error.body as { redeemedAt?: string } | undefined;
      setResult(
        res.error.code === 'already_used' && body?.redeemedAt ? t('hangoutBiz.redeem.already', { time: clock(body.redeemedAt) })
          : res.error.code === 'deal_not_live' ? t('hangoutBiz.redeem.notLive')
            : res.error.code === 'not_active' ? t('hangoutBiz.redeem.notActive')
              : t('hangoutBiz.redeem.failed'),
      );
      if (res.error.code === 'deal_not_live') void load();
      return;
    }
    setResult(t('hangoutBiz.redeem.redeemed', { time: clock(res.data!.redeemed.redeemedAt) }));
    void load();
  }

  const chosen = deals.find((d) => d.id === pick) ?? null;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.backText}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.kicker}>{t('hangoutBiz.redeem.title')}</Text>
        <Text style={styles.title}>{chosen?.title ?? t('hangoutBiz.redeem.title')}</Text>
        <Text style={styles.muted}>{t('hangoutBiz.redeem.sub')}</Text>

        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="redeem-error">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangoutBiz.loadFailed')} {t('hangoutBiz.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && !active ? <Text style={styles.note} testID="redeem-inactive">{t('hangoutBiz.redeem.notActive')}</Text> : null}
        {state === 'ready' && active && deals.length === 0 ? <Text style={styles.muted} testID="redeem-none-live">{t('hangoutBiz.redeem.noneLive')}</Text> : null}
        {state === 'ready' && active && deals.length > 0 ? (
          <>
            {deals.length > 1 ? (
              <View style={styles.picker}>
                <Text style={styles.label}>{t('hangoutBiz.redeem.pick')}</Text>
                {deals.map((d) => (
                  <TouchableOpacity key={d.id} onPress={() => setPick(d.id)} style={[styles.pickRow, pick === d.id && styles.pickOn]} accessibilityRole="button" accessibilityState={{ selected: pick === d.id }}>
                    <Text style={[styles.pickText, pick === d.id && styles.pickTextOn]}>{d.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <Text style={styles.muted}>{t('hangoutBiz.redeem.noteNoPerson')}</Text>
            <TouchableOpacity style={[styles.cta, busy && styles.ctaOff]} disabled={busy} onPress={() => void redeem()} accessibilityRole="button" testID="redeem-button">
              <Text style={styles.ctaText}>{t('hangoutBiz.redeem.redeem')}</Text>
            </TouchableOpacity>
          </>
        ) : null}
        {result ? <Text accessibilityRole="alert" style={styles.result} testID="redeem-result">{result}</Text> : null}
        {used !== null && state === 'ready' ? <Text style={styles.muted}>{t('hangoutBiz.redeem.todayCount', { n: used })}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  muted: { fontSize: 15, lineHeight: 21, color: Colors.Muted },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Muted },
  note: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 10, padding: 12 },
  picker: { gap: 6 },
  pickRow: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 10, padding: 12 },
  pickOn: { borderColor: Colors.DeepFern, backgroundColor: Colors.Bone },
  pickText: { fontSize: 15, color: Colors.Ink },
  pickTextOn: { fontWeight: '700' },
  cta: { backgroundColor: Colors.DeepFern, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: Colors.Chalk, fontSize: 17, fontWeight: '800' },
  result: { fontSize: 17, fontWeight: '800', color: Colors.Ink, textAlign: 'center' },
});
