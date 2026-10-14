/**
 * W11-8 MEMBER CLAIM CODE — a member opens a Special and gets a short-lived single-use code, as a QR
 * plus the typed fallback. The server issues it (API migration 112) and the owner scans or types it
 * on the Redeem screen. Nothing about the member travels with it.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components';
import { ScannableCode } from '../../../src/components/qr-code';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { claimSpecial, dealQrValue } from '../../../src/api/hangout-business';

type Claim = { code: string; expiresAt: string; title: string };

function left(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ClaimScreen() {
  const router = useRouter();
  const { postId, title } = useLocalSearchParams<{ postId?: string; title?: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notLive' | 'notSet' | 'error'>('loading');
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    if (!postId) { setState('error'); return; }
    setState('loading');
    const res = await claimSpecial(postId);
    if (res.error || !res.data) {
      const code = res.error?.code;
      setState(code === 'deal_not_live' || code === 'not_found' ? 'notLive' : code === 'claim_lifetime_not_set' ? 'notSet' : 'error');
      return;
    }
    setClaim(res.data.claim);
    setState('ready');
  }, [postId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [state]);

  const remaining = claim ? new Date(claim.expiresAt).getTime() - now : 0;
  const expired = state === 'ready' && remaining <= 0;

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.body}>
        <Text style={styles.kicker}>{t('hangoutBiz.claim.title')}</Text>
        <Text style={styles.title}>{claim?.title ?? title ?? ''}</Text>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'notLive' ? <Text accessibilityRole="alert" style={styles.muted} testID="claim-not-live">{t('hangoutBiz.claim.notLive')}</Text> : null}
        {state === 'notSet' ? <Text accessibilityRole="alert" style={styles.muted} testID="claim-not-set">{t('hangoutBiz.claim.notSet')}</Text> : null}
        {state === 'error' ?<Text accessibilityRole="alert" style={styles.muted} testID="claim-error">{t('hangoutBiz.claim.failed')}</Text> : null}
        {state === 'ready' && claim && !expired ? (
          <View style={styles.card} testID="claim-card">
            <ScannableCode value={dealQrValue(claim.code)} size={220} label={t('hangoutBiz.claim.qrLabel')} fallback={t('hangoutBiz.claim.qrFallback')} />
            <Text style={styles.label}>{t('hangoutBiz.claim.code')}</Text>
            <Text style={styles.code} selectable testID="claim-code">{claim.code}</Text>
            <Text style={styles.muted}>{t('hangoutBiz.claim.expires', { time: left(remaining) })}</Text>
          </View>
        ) : null}
        {expired ? <Text accessibilityRole="alert" style={styles.muted} testID="claim-expired">{t('hangoutBiz.claim.expired')}</Text> : null}
        {(expired || state === 'error' || state === 'notLive') && state !== 'notLive' ? (
          <TouchableOpacity style={styles.cta} onPress={() => void load()} accessibilityRole="button" testID="claim-again">
            <Text style={styles.ctaText}>{t('hangoutBiz.claim.again')}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.back}>{t('hangoutBiz.claim.back')}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  body: { padding: 22, gap: 14, alignItems: 'center' },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink, textAlign: 'center' },
  card: { alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Muted },
  code: { fontSize: 32, fontWeight: '900', letterSpacing: 3, color: Colors.Ink },
  muted: { fontSize: 15, lineHeight: 21, color: Colors.Muted, textAlign: 'center' },
  cta: { backgroundColor: Colors.DeepFern, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 },
  ctaText: { color: Colors.Chalk, fontSize: 16, fontWeight: '800' },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
});
