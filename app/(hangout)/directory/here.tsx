/**
 * VENUE PRESENCE — a member scans a Hello Hangout's QR with the live camera and is counted as here (RULES §9.1, W-052).
 * POST /venue-presence/scan (API migration 265). No picker and no upload: the camera is the only way to read the code (§14.5 spirit).
 * Nothing about position is read or sent. The answer is the venue, how long the member is counted as here, and a past-tense count of
 * scans — never who (§9.6). Rescanning extends it and is asked for, never required (§9.3); nothing chases it (§9.4) and nothing renews
 * it by itself (§9.5). With the camera off the app still works: this screen simply says so and offers Settings (§26.5, limited mode).
 * No design exists for this screen; it follows the Hootza check-in screen's camera handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Button, ScreenContainer } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { getMyVenuePresence, leaveVenuePresence, scanVenueCode, type VenuePresence } from '../../../src/api/venue-presence';

function clockTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const REFUSALS: Record<string, string> = {
  unknown_code: 'l03.presence.unknownCode',
  venue_not_active: 'l03.presence.venueNotActive',
  not_eligible: 'l03.presence.notEligible',
  venue_presence_unavailable: 'l03.presence.unavailable',
};

export default function VenuePresenceScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VenuePresence | null>(null);
  const [current, setCurrent] = useState<VenuePresence | null>(null);
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const busy = useRef(false);
  const scanHandled = useRef(false);
  const mounted = useRef(true);
  const active = useRef(focused && foreground);
  active.current = focused && foreground;

  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
      if (state !== 'active') { scanHandled.current = true; setScanning(false); }
    });
    return () => { mounted.current = false; active.current = false; sub.remove(); };
  }, []);
  useEffect(() => { if (!focused) { scanHandled.current = true; setScanning(false); } }, [focused]);

  // What the member is already counted as: read from the server, never remembered on the phone (§9.5: every session starts with a scan).
  const loadCurrent = useCallback(async () => {
    const res = await getMyVenuePresence();
    if (!mounted.current) return;
    setCurrent(res.error ? null : res.data?.presence ?? null);
  }, []);
  useEffect(() => { void loadCurrent(); }, [loadCurrent]);

  async function submit(payload: string) {
    const value = payload.trim();
    if (!value || busy.current) return;
    busy.current = true;
    scanHandled.current = true;
    setScanning(false);
    setSending(true);
    setError(null);
    const res = await scanVenueCode(value);
    busy.current = false;
    if (!mounted.current) return;
    setSending(false);
    if (res.error || !res.data?.presence) {
      const key = REFUSALS[res.error?.code ?? ''];
      setError(t(key ?? 'l03.presence.failed'));
      return;
    }
    setResult(res.data.presence);
    setCurrent(res.data.presence);
  }

  async function openCamera() {
    if (requestingCamera || busy.current) return;
    setRequestingCamera(true);
    setError(null);
    try {
      const granted = permission?.granted ? permission : await requestPermission();
      if (!mounted.current || !active.current) return;
      if (granted.granted) { scanHandled.current = false; setScanning(true); }
      else setError(t('l03.presence.cameraDenied'));
    } catch {
      if (mounted.current) setError(t('l03.presence.cameraFailed'));
    } finally {
      if (mounted.current) setRequestingCamera(false);
    }
  }

  function onScan(scan: BarcodeScanningResult) {
    if (!active.current || scanHandled.current || busy.current || scan.type !== 'qr' || !scan.data.trim()) return;
    scanHandled.current = true;
    void submit(scan.data);
  }

  async function leave() {
    const res = await leaveVenuePresence();
    if (!mounted.current) return;
    if (res.error) { setError(t('l03.presence.failed')); return; }
    setResult(null);
    setCurrent(null);
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12} testID="presence-back">
          <Text style={styles.back}>{t('l03.presence.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title} accessibilityRole="header">{t('l03.presence.title')}</Text>
        <Text style={styles.sub}>{t('l03.presence.body')}</Text>

        {result ? (
          <View style={styles.card} testID="presence-done">
            <Text style={styles.done} testID="presence-done-title">{t('l03.presence.done', { name: result.venue.name })}</Text>
            {typeof result.hereCount === 'number' && result.hereCount > 0 ? (
              <Text style={styles.sub} testID="presence-count">{t('l03.presence.count', { count: result.hereCount })}</Text>
            ) : null}
            <Text style={styles.sub}>{t('l03.presence.until', { time: clockTime(result.expiresAt) })}</Text>
            <Text style={styles.sub}>{t('l03.presence.scanAgain')}</Text>
          </View>
        ) : current ? (
          <Text style={styles.sub} testID="presence-current">
            {t('l03.presence.current', { name: current.venue.name, time: clockTime(current.expiresAt) })}
          </Text>
        ) : null}

        {sending ? (
          <View style={styles.row}>
            <ActivityIndicator color={Colors.Ink} />
            <Text style={styles.sub}>{t('l03.presence.sending')}</Text>
          </View>
        ) : scanning && focused && foreground && permission?.granted ? (
          <>
            <CameraView
              testID="presence-camera"
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onScan}
              onMountError={() => { scanHandled.current = true; setScanning(false); setError(t('l03.presence.cameraFailed')); }}
            />
            <Button title={t('l03.presence.stopCamera')} variant="secondary" onPress={() => { scanHandled.current = true; setScanning(false); }} />
          </>
        ) : (
          <Button title={t('l03.presence.openCamera')} onPress={openCamera} loading={requestingCamera} disabled={!permission} testID="presence-open-camera" />
        )}

        {permission && !permission.granted && !permission.canAskAgain ? (
          <Button
            title={t('l03.presence.openSettings')}
            variant="secondary"
            onPress={() => { void Linking.openSettings().catch(() => setError(t('l03.presence.cameraFailed'))); }}
            testID="presence-open-settings"
          />
        ) : null}

        {error ? <Text accessibilityRole="alert" style={styles.error} testID="presence-error">{error}</Text> : null}

        {current ? <Button title={t('l03.presence.leave')} variant="secondary" onPress={() => void leave()} testID="presence-leave" /> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 16, paddingVertical: 24 },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 24, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 16, lineHeight: 22, color: Colors.Muted },
  done: { fontSize: 20, fontWeight: '700', color: Colors.Ink },
  card: { gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.Ink },
  camera: { height: 260 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  error: { fontSize: 15, color: Colors.Ink },
});
