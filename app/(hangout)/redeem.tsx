/**
 * H12 DEAL REDEMPTION — CANON-RL-02-SN-06 (P delivered; T/D in batch-03). "Redeeming".
 * POST /hello-hangouts/:id/redeem records the DEAL and the TIME, never the person — so a second
 * attempt with the same claim key reads as a time ("Already used · 14:02"), not a name. Only a
 * Special that is live now can be redeemed (both clocks, §17.6); only the owner's active Hello
 * Hangout can redeem. W11-8: the member opens a Special and gets a short-lived single-use claim
 * code (QR + typed). Here the owner scans it with the camera or types it; the server verifies and
 * consumes it atomically (POST /hello-hangouts/:id/redeem-claim). The tap stays as the fallback.
 */
import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getManage } from '../../src/api/directory';
import { dealCodeFromScan, getRedemptions, redeemClaim, redeemDeal, DEAL_QR_PREFIX } from '../../src/api/hangout-business';

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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [typed, setTyped] = useState('');
  const handled = useRef(false);

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

  function describe(code: string | undefined, body: { redeemedAt?: string } | undefined): string {
    return code === 'already_used' ? (body?.redeemedAt ? t('hangoutBiz.redeem.already', { time: clock(body.redeemedAt) }) : t('hangoutBiz.redeem.failed'))
      : code === 'code_expired' ? t('hangoutBiz.redeem.codeExpired')
        : code === 'deal_not_live' ? t('hangoutBiz.redeem.notLive')
          : code === 'wrong_place' ? t('hangoutBiz.redeem.wrongPlace')
            : code === 'not_active' ? t('hangoutBiz.redeem.notActive')
              : code === 'invalid_code' ? t('hangoutBiz.redeem.badCode')
                : t('hangoutBiz.redeem.failed');
  }

  async function submitCode(raw: string) {
    if (!helloHangoutId || !raw.trim() || busy) return;
    setBusy(true);
    setResult(null);
    const res = await redeemClaim(helloHangoutId, dealCodeFromScan(raw));
    setBusy(false);
    if (res.error) {
      setResult(describe(res.error.code, res.error.body as { redeemedAt?: string } | undefined));
      return;
    }
    setTyped('');
    setScanning(false);
    setResult(t('hangoutBiz.redeem.redeemed', { time: clock(res.data!.redeemed.redeemedAt) }));
    void load();
  }

  async function openCamera() {
    setResult(null);
    try {
      const p = permission?.granted ? permission : await requestPermission();
      if (p.granted) { handled.current = false; setScanning(true); } else setResult(t('hangoutBiz.redeem.cameraDenied'));
    } catch {
      setResult(t('hangoutBiz.redeem.cameraDenied'));
    }
  }

  function onScan(r: BarcodeScanningResult) {
    if (handled.current || busy || r.type !== 'qr') return;
    if (!r.data.trim().toUpperCase().startsWith(DEAL_QR_PREFIX)) { setResult(t('hangoutBiz.redeem.notHangoutQr')); return; }
    handled.current = true;
    void submitCode(r.data).finally(() => { handled.current = false; });
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
            {scanning && permission?.granted ? (
              <View style={styles.camera}>
                <CameraView testID="redeem-camera" style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} onMountError={() => { setScanning(false); setResult(t('hangoutBiz.redeem.cameraDenied')); }} />
              </View>
            ) : null}
            <TouchableOpacity style={styles.cta} onPress={() => { if (scanning) setScanning(false); else void openCamera(); }} accessibilityRole="button" testID="redeem-scan">
              <Text style={styles.ctaText}>{t(scanning ? 'hangoutBiz.redeem.scanStop' : 'hangoutBiz.redeem.scanOpen')}</Text>
            </TouchableOpacity>
            <Text style={styles.label}>{t('hangoutBiz.redeem.typeLabel')}</Text>
            <TextInput
              style={styles.input} value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false}
              placeholder={t('hangoutBiz.redeem.typePlaceholder')} maxLength={20} testID="redeem-code-input"
              onSubmitEditing={() => void submitCode(typed)} returnKeyType="done"
            />
            <TouchableOpacity style={[styles.cta, (busy || typed.trim().length < 8) && styles.ctaOff]} disabled={busy || typed.trim().length < 8} onPress={() => void submitCode(typed)} accessibilityRole="button" testID="redeem-code-submit">
              <Text style={styles.ctaText}>{t('hangoutBiz.redeem.typeSubmit')}</Text>
            </TouchableOpacity>
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
  camera: { height: 260, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000000' },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 10, padding: 12, fontSize: 20, letterSpacing: 2, color: Colors.Ink },
  result: { fontSize: 17, fontWeight: '800', color: Colors.Ink, textAlign: 'center' },
});
