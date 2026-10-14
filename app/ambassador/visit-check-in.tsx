/**
 * A4 VISIT CHECK-IN — CANON-RL-03-SN-04 (at the door) · SN-05 (wrong venue's code).
 *
 * A visit needs BOTH signals (RULES §14.5): a live GPS reading AND a scan of THAT Hello
 * Hangout's own code, read by the live camera — no picker, no upload, no typing. GPS is
 * "monitored, not tight; the scan is the real proof" (§14.6): the reading and its distance
 * from the pin are recorded and shown, not judged against a tolerance (MONEY gives a range,
 * not one figure). If the device gives no reading the visit does not proceed — the app never
 * sends 0/0 or a guessed coordinate. Nothing is marked from a button press: the server
 * records the visit only when the scanned payload verifies for this venue.
 *
 * Reads: GET /ambassador/hangouts (the venue is looked up in THIS Ambassador's book by id).
 * Writes: POST /ambassador/visits/check-in · /install (§14.10 installing a stand is a visit).
 *
 * Design conflict recorded: the drawn A4 lets GPS sit amber and "the visit still completes";
 * §14.5 requires both, and RULES outranks artwork — so a missing reading blocks, and says why.
 */

import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, AppState, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  checkInVisit,
  getAmbassadorHangouts,
  installStand,
  type AmbassadorHangout,
  type CheckInResult,
} from '../../src/api/ambassador';
import { AmbassadorShell, Card, Eyebrow } from '../../src/components/ambassador/AmbassadorShell';
import { metresBetween, readDeviceFix, type DeviceFix, type FixProblem, type FixResult } from '../../src/lib/device-fix';

type Mode = 'visit' | 'install';
type Phase =
  | { kind: 'loading' }
  | { kind: 'load_error' }
  | { kind: 'no_venue' }
  | { kind: 'idle' }
  | { kind: 'scanning'; mode: Mode }
  | { kind: 'sending' }
  | { kind: 'gps_problem'; problem: FixProblem }
  | { kind: 'wrong'; other: { id: string; name: string } | null }
  | { kind: 'done'; result: CheckInResult };

const GPS_PROBLEM_KEY: Record<FixProblem, string> = {
  denied: 'ambassador.visitCheckIn.gpsDenied',
  blocked: 'ambassador.visitCheckIn.gpsBlocked',
  services_off: 'ambassador.visitCheckIn.gpsServicesOff',
  failed: 'ambassador.visitCheckIn.gpsFailed',
};

export default function VisitCheckInScreen() {
  const router = useRouter();
  const navigation = useContext(NavigationContext);
  const params = useLocalSearchParams<{ helloHangoutId?: string }>();
  const startId = typeof params.helloHangoutId === 'string' ? params.helloHangoutId : null;

  const [targetId, setTargetId] = useState<string | null>(startId);
  const [venues, setVenues] = useState<AmbassadorHangout[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: startId ? 'loading' : 'no_venue' });
  const [fix, setFix] = useState<DeviceFix | null>(null);
  const [gpsState, setGpsState] = useState<'idle' | 'reading' | 'ready' | FixProblem>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const scanHandled = useRef(true);
  const busy = useRef(false);
  const pending = useRef<{ payload: string; mode: Mode } | null>(null);
  const wrongScan = useRef<{ payload: string; mode: Mode } | null>(null);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const venue = venues.find((v) => v.id === targetId) ?? null;

  const loadBook = useCallback(async () => {
    const res = await getAmbassadorHangouts();
    if (!mounted.current) return;
    if (res.error || !res.data) {
      setPhase({ kind: 'load_error' });
      return;
    }
    setVenues(res.data.hangouts);
    setPhase(res.data.hangouts.some((h) => h.id === targetId) ? { kind: 'idle' } : { kind: 'no_venue' });
  }, [targetId]);

  useEffect(() => {
    if (startId) void loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The camera stops when the screen is left or the app goes to the background.
  useEffect(() => {
    const stop = () => {
      scanHandled.current = true;
      setPhase((p) => (p.kind === 'scanning' ? { kind: 'idle' } : p));
    };
    const sub = AppState.addEventListener('change', (state) => { if (state !== 'active') stop(); });
    const blur = navigation?.addListener('blur', stop);
    return () => { sub.remove(); blur?.(); };
  }, [navigation]);

  /** null only when the screen has gone; otherwise the reading or the reason there is none. */
  async function readGps(): Promise<FixResult | null> {
    setGpsState('reading');
    const result = await readDeviceFix();
    if (!mounted.current) return null;
    if (!result.ok) {
      setGpsState(result.problem);
      return result;
    }
    setFix(result.fix);
    setGpsState('ready');
    return result;
  }

  async function beginScan(mode: Mode) {
    if (busy.current || !venue) return;
    busy.current = true;
    setMessage(null);
    try {
      // GPS first: a visit needs both signals, so there is no point opening the camera without one.
      const reading = await readGps();
      if (!reading || !reading.ok) return;
      const granted = permission?.granted ? permission : await requestPermission();
      if (!mounted.current) return;
      if (!granted.granted) {
        setCameraBlocked(granted.canAskAgain === false);
        setMessage(t(granted.canAskAgain === false ? 'ambassador.visitCheckIn.cameraBlocked' : 'ambassador.visitCheckIn.cameraDenied'));
        return;
      }
      setCameraBlocked(false);
      scanHandled.current = false;
      setPhase({ kind: 'scanning', mode });
    } catch {
      setMessage(t('ambassador.visitCheckIn.cameraFailed'));
    } finally {
      busy.current = false;
    }
  }

  async function submit(payload: string, mode: Mode, forVenueId: string) {
    setPhase({ kind: 'sending' });
    setMessage(null);
    pending.current = { payload, mode };
    const reading = await readGps();
    if (!reading) return;
    if (!reading.ok) {
      // Keep the scan; the visit is only recorded once a real reading exists.
      setPhase({ kind: 'gps_problem', problem: reading.problem });
      return;
    }
    const call = mode === 'install' ? installStand : checkInVisit;
    const res = await call({
      helloHangoutId: forVenueId,
      scan: payload,
      lat: reading.fix.lat,
      lng: reading.fix.lng,
      accuracyM: reading.fix.accuracyM,
      mocked: reading.fix.mocked ?? undefined,
    });
    if (!mounted.current) return;
    if (!res.error && res.data) {
      pending.current = null;
      setPhase({ kind: 'done', result: res.data });
      return;
    }
    pending.current = null;
    const code = res.error?.code;
    wrongScan.current = code === 'wrong_venue' ? { payload, mode } : null;
    if (code === 'wrong_venue') {
      const other = res.error?.body?.other as { id?: string; name?: string } | null | undefined;
      setPhase({ kind: 'wrong', other: other?.id && other?.name ? { id: other.id, name: other.name } : null });
      return;
    }
    setPhase({ kind: 'idle' });
    if (code === 'unknown_code') setMessage(mode === 'install' ? t('ambassador.visitCheckIn.standErrors.unknown_code') : t('ambassador.visitCheckIn.unknownCode'));
    else if (code === 'stands_unavailable') setMessage(t('ambassador.visitCheckIn.standsUnavailable'));
    else if (code === 'stand_already_bound') setMessage(t('ambassador.visitCheckIn.standErrors.stand_already_bound'));
    else if (code === 'not_your_stand') setMessage(t('ambassador.visitCheckIn.standErrors.not_your_stand'));
    else if (code === 'not_visitable') setMessage(t('ambassador.visitCheckIn.notVisitable'));
    else if (res.error?.status === 403 || res.error?.status === 404) setMessage(t('ambassador.visitCheckIn.notInBook'));
    else setMessage(t('ambassador.visitCheckIn.failed'));
  }

  function onScan(result: BarcodeScanningResult) {
    if (scanHandled.current || result.type !== 'qr' || phase.kind !== 'scanning' || !targetId) return;
    scanHandled.current = true;
    void submit(result.data, phase.mode, targetId);
  }

  const distance = fix && venue?.pinSet ? Math.round(metresBetween(fix.lat, fix.lng, venue.lat, venue.lng)) : null;

  // ── Non-venue states ────────────────────────────────────────────────────────
  if (phase.kind === 'loading') {
    return (
      <AmbassadorShell title={t('ambassador.visitCheckIn.title')}>
        <ActivityIndicator color={Colors.Ink} testID="visit-loading" />
      </AmbassadorShell>
    );
  }
  if (phase.kind === 'load_error') {
    return (
      <AmbassadorShell title={t('ambassador.visitCheckIn.title')}>
        <Card tone="error" testID="visit-load-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.hangouts.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setPhase({ kind: 'loading' }); void loadBook(); }} accessibilityRole="button" style={styles.outline} testID="visit-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      </AmbassadorShell>
    );
  }
  if (phase.kind === 'no_venue' || !venue) {
    return (
      <AmbassadorShell title={t('ambassador.visitCheckIn.title')}>
        <Card testID="visit-no-venue">
          <Text style={styles.body}>{startId ? t('ambassador.visitCheckIn.notInBook') : t('ambassador.visitCheckIn.needsVenue')}</Text>
        </Card>
        <TouchableOpacity onPress={() => router.replace('/ambassador/hangouts')} accessibilityRole="button" style={styles.outline} testID="visit-open-book">
          <Text style={styles.outlineText}>{t('ambassador.hangouts.title')}</Text>
        </TouchableOpacity>
      </AmbassadorShell>
    );
  }

  // ── Wrong venue's code (SN-05) ──────────────────────────────────────────────
  if (phase.kind === 'wrong') {
    const other = phase.other;
    return (
      <AmbassadorShell title={t('ambassador.visitCheckIn.title')} onBack={() => setPhase({ kind: 'idle' })}>
        <Card tone="error" testID="visit-wrong-venue">
          <Text accessibilityRole="alert" style={styles.wrongTitle}>
            {other ? t('ambassador.visitCheckIn.wrongTitle', { other: other.name }) : t('ambassador.visitCheckIn.wrongTitleUnnamed')}
          </Text>
          <Text style={styles.body}>
            {other
              ? t('ambassador.visitCheckIn.wrongBody', { other: other.name, name: venue.name })
              : t('ambassador.visitCheckIn.wrongBodyUnnamed', { name: venue.name })}
          </Text>
        </Card>
        {other ? (
          <Card>
            <Text style={styles.cardTitle}>{t('ambassador.visitCheckIn.switchTitle', { other: other.name })}</Text>
            <Text style={styles.body}>{t('ambassador.visitCheckIn.switchBody')}</Text>
            <TouchableOpacity
              onPress={() => {
                // "Switch this visit to the venue the stand belongs to": the same scan, sent for that venue.
                const held = wrongScan.current;
                if (!held) { setPhase({ kind: 'idle' }); return; }
                setTargetId(other.id);
                void submit(held.payload, held.mode, other.id);
              }}
              accessibilityRole="button"
              style={styles.outline}
              testID="visit-switch"
            >
              <Text style={styles.outlineText}>{t('ambassador.visitCheckIn.switchCta')}</Text>
            </TouchableOpacity>
          </Card>
        ) : null}
        <Card>
          <Text style={styles.cardTitle}>{t('ambassador.visitCheckIn.stayTitle', { name: venue.name })}</Text>
          <Text style={styles.body}>{t('ambassador.visitCheckIn.stayBody', { name: venue.name })}</Text>
          <TouchableOpacity onPress={() => setPhase({ kind: 'idle' })} accessibilityRole="button" style={styles.outline} testID="visit-scan-again">
            <Text style={styles.outlineText}>{t('ambassador.visitCheckIn.scanAgain')}</Text>
          </TouchableOpacity>
        </Card>
        <Text style={styles.body}>{t('ambassador.visitCheckIn.nothingRecorded')}</Text>
      </AmbassadorShell>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (phase.kind === 'done') {
    const r = phase.result;
    return (
      <AmbassadorShell title={t('ambassador.visitCheckIn.doneTitle')} onBack={() => router.replace('/ambassador/hangouts')}>
        <Card testID="visit-done">
          <Text style={styles.cardTitle}>{r.venue.name}</Text>
          <Text style={styles.body}>
            {r.kind === 'origination'
              ? t('ambassador.visitCheckIn.doneOrigination', { name: r.venue.name })
              : t('ambassador.visitCheckIn.doneService', { name: r.venue.name })}
          </Text>
          <Text style={styles.body}>
            {r.kind === 'service'
              ? r.windowCounted
                ? t('ambassador.visitCheckIn.doneWindow', { n: r.windowCounted })
                : t('ambassador.visitCheckIn.doneNoWindow')
              : ''}
          </Text>
          <Text style={styles.body}>{t(r.proof === 'stand' ? 'ambassador.visitCheckIn.doneProofStand' : 'ambassador.visitCheckIn.doneProofCode')}</Text>
          <Text style={styles.body} testID="visit-done-gps">
            {!r.gps.pinSet || r.gps.distanceM === null
              ? t('ambassador.visitCheckIn.doneGpsNoPin')
              : r.gps.accuracyM !== null
                ? t('ambassador.visitCheckIn.doneGps', { m: r.gps.distanceM, acc: Math.round(r.gps.accuracyM) })
                : t('ambassador.visitCheckIn.doneGpsNoAccuracy', { m: r.gps.distanceM })}
          </Text>
          {r.becameServicer ? <Text style={styles.cardTitle} testID="visit-became-servicer">{t('ambassador.visitCheckIn.becameServicer')}</Text> : null}
        </Card>
        <TouchableOpacity onPress={() => router.replace('/ambassador/hangouts')} accessibilityRole="button" style={styles.solid} testID="visit-done-button">
          <Text style={styles.solidText}>{t('ambassador.visitCheckIn.another')}</Text>
        </TouchableOpacity>
      </AmbassadorShell>
    );
  }

  // ── Idle / scanning / sending / gps problem ─────────────────────────────────
  const scanning = phase.kind === 'scanning';
  const sending = phase.kind === 'sending';
  const gpsDot = gpsState === 'ready' ? Colors.DeepFern : gpsState === 'idle' || gpsState === 'reading' ? Colors.Faint : Colors.Amber;
  const gpsProblem = gpsState !== 'idle' && gpsState !== 'reading' && gpsState !== 'ready' ? gpsState : null;

  return (
    <AmbassadorShell
      title={venue.name}
      subtitle={venue.address}
      onBack={() => { scanHandled.current = true; router.back(); }}
      testID="visit-check-in"
    >
      <Eyebrow>{t(venue.state === 'awaiting_payment' ? 'ambassador.visitCheckIn.eyebrowOrigination' : 'ambassador.visitCheckIn.eyebrowService')}</Eyebrow>
      <Text style={styles.body} testID="visit-why">{t('ambassador.visitCheckIn.whyExists')}</Text>

      {scanning ? (
        <View style={styles.viewfinder} testID="visit-viewfinder">
          {permission?.granted ? (
            <CameraView
              testID="visit-camera"
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onScan}
              onMountError={() => { scanHandled.current = true; setPhase({ kind: 'idle' }); setMessage(t('ambassador.visitCheckIn.cameraFailed')); }}
            />
          ) : null}
          <View pointerEvents="none" style={[styles.corner, styles.cTL]} />
          <View pointerEvents="none" style={[styles.corner, styles.cTR]} />
          <View pointerEvents="none" style={[styles.corner, styles.cBL]} />
          <View pointerEvents="none" style={[styles.corner, styles.cBR]} />
        </View>
      ) : null}
      {scanning ? <Text style={styles.body} accessibilityLiveRegion="polite">{t('ambassador.visitCheckIn.scanning')}</Text> : null}

      <Card testID="visit-gps-card">
        <View style={styles.signal}>
          <View style={[styles.dot, { backgroundColor: gpsDot }]} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{t('ambassador.visitCheckIn.gpsTitle')}</Text>
            {gpsState === 'idle' ? <Text style={styles.body}>{t('ambassador.visitCheckIn.gpsIdle')}</Text> : null}
            {gpsState === 'reading' ? <Text style={styles.body}>{t('ambassador.visitCheckIn.gpsReading')}</Text> : null}
            {gpsState === 'ready' && fix ? (
              <>
                <Text style={styles.body}>{t('ambassador.visitCheckIn.gpsReady')}</Text>
                {fix.accuracyM !== null ? <Text style={styles.body}>{t('ambassador.visitCheckIn.gpsAccuracy', { m: Math.round(fix.accuracyM) })}</Text> : null}
                <Text style={styles.body} testID="visit-gps-distance">
                  {distance !== null ? t('ambassador.visitCheckIn.gpsDistance', { m: distance, address: venue.address }) : t('ambassador.visitCheckIn.gpsNoPin')}
                </Text>
                {fix.mocked ? <Text style={styles.body}>{t('ambassador.visitCheckIn.gpsMocked')}</Text> : null}
              </>
            ) : null}
            {gpsProblem ? <Text accessibilityRole="alert" style={styles.body} testID="visit-gps-problem">{t(GPS_PROBLEM_KEY[gpsProblem])}</Text> : null}
            <Text style={styles.faint}>{t('ambassador.visitCheckIn.gpsIdleNote')}</Text>
          </View>
        </View>
        {gpsProblem === 'blocked' ? (
          <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button" testID="visit-open-settings">
            <Text style={styles.link}>{t('ambassador.common.openSettings')}</Text>
          </TouchableOpacity>
        ) : null}
        {gpsProblem && pending.current === null ? (
          <TouchableOpacity onPress={() => void readGps()} accessibilityRole="button" testID="visit-gps-retry">
            <Text style={styles.link}>{t('ambassador.visitCheckIn.gpsRetry')}</Text>
          </TouchableOpacity>
        ) : null}
      </Card>

      <Card testID="visit-scan-card">
        <View style={styles.signal}>
          <View style={[styles.dot, { backgroundColor: Colors.Faint }]} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{t('ambassador.visitCheckIn.scanTitle')}</Text>
            <Text style={styles.body}>{t('ambassador.visitCheckIn.scanBody')}</Text>
            <Text style={styles.faint}>{t('ambassador.visitCheckIn.scanNote')}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>{t('ambassador.visitCheckIn.installTitle')}</Text>
        <Text style={styles.body}>{t('ambassador.visitCheckIn.installBody')}</Text>
      </Card>

      <Text style={styles.body}>{t('ambassador.visitCheckIn.scanRule')} {t('ambassador.visitCheckIn.bothNeeded')}</Text>

      {sending ? (
        <View style={styles.sending} testID="visit-sending">
          <ActivityIndicator color={Colors.Ink} />
          <Text style={styles.body}>{t('ambassador.visitCheckIn.sending')}</Text>
        </View>
      ) : null}

      {phase.kind === 'gps_problem' ? (
        <TouchableOpacity
          onPress={() => { const p = pending.current; if (p && targetId) void submit(p.payload, p.mode, targetId); }}
          accessibilityRole="button"
          style={styles.solid}
          testID="visit-gps-resubmit"
        >
          <Text style={styles.solidText}>{t('ambassador.visitCheckIn.gpsRetry')}</Text>
        </TouchableOpacity>
      ) : null}

      {message ? <Text accessibilityRole="alert" style={styles.error} testID="visit-checkin-error">{message}</Text> : null}
      {cameraBlocked ? (
        <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button" testID="visit-camera-settings">
          <Text style={styles.link}>{t('ambassador.common.openSettings')}</Text>
        </TouchableOpacity>
      ) : null}

      {scanning ? (
        <TouchableOpacity onPress={() => { scanHandled.current = true; setPhase({ kind: 'idle' }); }} accessibilityRole="button" style={styles.outline} testID="visit-stop-camera">
          <Text style={styles.outlineText}>{t('ambassador.visitCheckIn.scanStop')}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => void beginScan('visit')}
            disabled={sending || phase.kind === 'gps_problem'}
            accessibilityRole="button"
            accessibilityState={{ disabled: sending || phase.kind === 'gps_problem' }}
            style={[styles.solid, (sending || phase.kind === 'gps_problem') && styles.disabled]}
            testID="visit-scan-submit"
          >
            <Text style={styles.solidText}>{t('ambassador.visitCheckIn.scanCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void beginScan('install')}
            disabled={sending || phase.kind === 'gps_problem'}
            accessibilityRole="button"
            accessibilityState={{ disabled: sending || phase.kind === 'gps_problem' }}
            style={[styles.outline, (sending || phase.kind === 'gps_problem') && styles.disabled]}
            testID="visit-install"
          >
            <Text style={styles.outlineText}>{t('ambassador.visitCheckIn.installCta')}</Text>
          </TouchableOpacity>
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  faint: { fontSize: 14, color: Colors.Faint },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  link: { fontSize: 15.5, fontWeight: '700', color: Colors.HelloBlue, marginTop: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  wrongTitle: { fontSize: 23, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5, color: Colors.Ink },
  signal: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 5 },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  sending: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewfinder: { width: '100%', aspectRatio: 1, borderRadius: 20, backgroundColor: '#2A2926', overflow: 'hidden' },
  corner: { position: 'absolute', width: 44, height: 44, borderColor: Colors.Chalk, borderWidth: 3 },
  cTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  cTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  cBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  cBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
});
