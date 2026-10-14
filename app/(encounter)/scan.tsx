/**
 * ENCOUNTER SCREEN 1d: SCAN AND SAY HELLO
 *
 * QR scanner screen. Waverly shrinks to a small mark — the design's way
 * of saying look at the person, not the phone.
 *
 * ⚠️ QR is per-encounter, generated at mutual accept, live camera only (RULES 10.7)
 *
 * Either phone shows the code, either scans (§10.7): "Show my code" displays
 * THIS phone's own proof code — as a QR and large, with the fallback instruction
 * (§10.18); the camera or the typed field sends the code read from the OTHER
 * phone to POST /hellos/:id/scan. Two phones must agree: the server refuses this
 * phone's own code and the shared support reference. The code's window is the server's
 * `qr_expires_at`. Failed attempts are counted here; at the server's
 * `failed_scan_count` the manual selfie path opens (§10.38, §10.47).
 * No picker, no upload: the camera is the only way to read a QR.
 */

import { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  AppState,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Waverly } from '../../src/components';
import { ScannableCode } from '../../src/components/qr-code';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { helloCodeFromQr, helloQrValue, scanHello } from '../../src/api/hellos';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { routeForHello } from '../../src/lib/encounter';
import { getFailedScans, recordFailedScan } from '../../src/state/active-hello';
import { useBleConfirmation } from '../../src/lib/use-ble-confirmation';

function clockTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function ScanScreen() {
  const router = useRouter();
  const navigation = useContext(NavigationContext);
  const { helloId, hello, gone, loading, error: loadError, reload } = useEncounterHello();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [typed, setTyped] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(() => (helloId ? getFailedScans(helloId) : 0));
  const busy = useRef(false);
  const scanHandled = useRef(false);

  // W8-A (built OFF): while the app is open after mutual accept, the phones also try to hear each other over Bluetooth.
  // A confirmed proof reloads the Hello and the effect below moves on exactly as a scan does. Silent on any failure.
  const ble = useBleConfirmation({
    helloId: helloId ?? null,
    active: hello?.status === 'accepted' && !hello.qrScanned,
    onConfirmed: () => { void reload(); },
    onLost: () => router.replace('/(encounter)/missed-connection'),
  });

  // Leave quietly if the hello is gone; move on if it is already proven or past this step.
  useEffect(() => {
    if (gone && !loading) router.back();
  }, [gone, loading, router]);
  useEffect(() => {
    if (!hello) return;
    if (hello.status === 'accepted' && hello.qrScanned) router.replace('/(encounter)/selfie-prompt');
    else if (hello.status !== 'accepted' || hello.revealedAt) router.replace(routeForHello(hello));
  }, [hello, router]);

  // The camera stops when the screen is left or the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') { scanHandled.current = true; setScanning(false); }
    });
    const blur = navigation?.addListener('blur', () => { scanHandled.current = true; setScanning(false); });
    return () => { sub.remove(); blur?.(); };
  }, [navigation]);

  async function submit(code: string, method: 'qr' | 'code') {
    const value = code.trim();
    if (!helloId || !value || busy.current) return;
    busy.current = true;
    scanHandled.current = true;
    setScanning(false);
    setSubmitting(true);
    setMessage(null);
    const res = await scanHello(helloId, value, method);
    busy.current = false;
    setSubmitting(false);
    if (!res.error) {
      router.push('/(encounter)/selfie-prompt');
      return;
    }
    if (res.error.status === 404 || res.error.status === 403) { router.back(); return; }
    if (res.error.status === 409) { void reload(); return; }
    // This phone's own code or the support reference: a mistake, not a failed scan (§10.18).
    if (res.error.code === 'own_code' || res.error.code === 'support_reference') {
      setMessage(t('encounter.scan.ownCode'));
      return;
    }
    if (['invalid_code', 'qr_expired', 'scan_failed', 'validation_error'].includes(res.error.code ?? '')) {
      setFailed(recordFailedScan(helloId));
      setMessage(t(res.error.code === 'qr_expired' ? 'encounter.scan.expired' : 'encounter.scan.invalid'));
      return;
    }
    setMessage(res.error.message || t('encounter.common.failed'));
  }

  async function openCamera() {
    if (busy.current) return;
    setMessage(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (result.granted) { scanHandled.current = false; setScanning(true); }
      else setMessage(t('encounter.scan.cameraDenied'));
    } catch {
      setMessage(t('encounter.scan.cameraFailed'));
    }
  }

  function onScan(result: BarcodeScanningResult) {
    if (scanHandled.current || busy.current || result.type !== 'qr') return;
    const code = helloCodeFromQr(result.data);
    if (!code) {
      setMessage(t('encounter.scan.notHelloQr'));
      return;
    }
    scanHandled.current = true;
    void submit(code, 'qr');
  }

  const threshold = hello?.failedScanCount;
  const manualOpen = typeof threshold === 'number' && threshold > 0 && failed >= threshold;
  // This phone's OWN proof code (§10.18): the other phone scans or types it. The shared
  // hello code stays the support reference, shown on the countdown ("Hello …").
  const code = hello?.myProofCode ?? null;

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Header with small Waverly */}
      <View style={styles.header}>
        <View style={styles.waverlyBadge}>
          <Waverly size={21} color={Colors.Chalk} />
        </View>
        <Text style={styles.headline}>
          Scan the QR code and{' '}
          <Text style={styles.dreamingText}>Say Hello</Text>.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Camera viewfinder */}
        <View style={styles.cameraContainer}>
          <View style={styles.viewfinder}>
            {scanning && permission?.granted ? (
              <CameraView
                testID="hello-scan-camera"
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={onScan}
                onMountError={() => { scanHandled.current = true; setScanning(false); setMessage(t('encounter.scan.cameraFailed')); }}
              />
            ) : showCode && code ? (
              <View style={styles.codeCard} testID="hello-my-code">
                <ScannableCode
                  value={helloQrValue(code)}
                  size={200}
                  label={t('encounter.scan.qrLabel')}
                  fallback={t('encounter.scan.qrFailed')}
                />
              </View>
            ) : (
              <View style={styles.placeholderCircle}>
                <Waverly size={58} color="rgba(255,255,255,0.5)" />
              </View>
            )}

            {/* Corner brackets */}
            <View pointerEvents="none" style={[styles.corner, styles.cornerTopLeft]} />
            <View pointerEvents="none" style={[styles.corner, styles.cornerTopRight]} />
            <View pointerEvents="none" style={[styles.corner, styles.cornerBottomLeft]} />
            <View pointerEvents="none" style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Bottom instruction */}
        <View style={styles.footer}>
          <Text style={styles.instruction}>{t('encounter.scan.body')}</Text>

          {!hello && loading ? <ActivityIndicator color={Colors.Chalk} /> : null}
          {loadError ? (
            <TouchableOpacity onPress={() => void reload()} accessibilityRole="button">
              <Text accessibilityRole="alert" style={styles.note}>{loadError} {t('encounter.common.retry')}</Text>
            </TouchableOpacity>
          ) : null}

          {code ? (
            <>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.pill}
                  onPress={scanning ? () => { scanHandled.current = true; setScanning(false); } : openCamera}
                  accessibilityRole="button"
                  disabled={submitting}
                >
                  <Text style={styles.pillText}>
                    {t(scanning ? 'encounter.scan.stopCamera' : 'encounter.scan.openCamera')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => { scanHandled.current = true; setScanning(false); setShowCode(s => !s); }}
                  accessibilityRole="button"
                >
                  <Text style={styles.pillText}>
                    {t(showCode ? 'encounter.scan.hideMyCode' : 'encounter.scan.showMyCode')}
                  </Text>
                </TouchableOpacity>
              </View>

              {showCode ? (
                <View style={styles.codeBlock}>
                  <Text style={styles.bigCode} selectable testID="hello-code-text">{code}</Text>
                  <Text style={styles.note}>{t('encounter.scan.myCodeLabel')}</Text>
                </View>
              ) : null}

              {hello?.qrExpiresAt ? (
                <Text style={styles.note}>{t('encounter.scan.expiresAt', { time: clockTime(hello.qrExpiresAt) })}</Text>
              ) : null}

              <Text style={styles.label}>{t('encounter.scan.enterTheirCode')}</Text>
              <TextInput
                value={typed}
                onChangeText={text => { setTyped(text); setMessage(null); }}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!submitting}
                accessibilityLabel={t('encounter.scan.enterTheirCode')}
                style={styles.input}
                placeholderTextColor="rgba(255,255,255,0.4)"
                testID="hello-code-input"
              />
              <TouchableOpacity
                style={[styles.submit, (!typed.trim() || submitting) && styles.disabled]}
                onPress={() => void submit(typed, 'code')}
                disabled={!typed.trim() || submitting}
                accessibilityRole="button"
                accessibilityState={{ disabled: !typed.trim() || submitting, busy: submitting }}
              >
                <Text style={styles.submitText}>{t('encounter.scan.submitCode')}</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
          {ble.unsupported ? <Text style={styles.message}>{t('encounter.scan.bleWeb')}</Text> : null}

          {permission && !permission.granted && !permission.canAskAgain ? (
            <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button">
              <Text style={styles.note}>{t('encounter.scan.openSettings')}</Text>
            </TouchableOpacity>
          ) : null}

          {manualOpen ? (
            <TouchableOpacity
              style={styles.pill}
              onPress={() => router.push({ pathname: '/(encounter)/selfie-prompt', params: { proof: 'manual' } })}
              accessibilityRole="button"
              testID="manual-selfie-path"
            >
              <Text style={styles.pillText}>{t('encounter.scan.manualSelfie')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Ink,
  },
  statusBar: {
    height: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingVertical: 16,
    paddingBottom: 22,
    gap: 13,
  },
  waverlyBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  headline: {
    flex: 1,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.8,
  },
  dreamingText: {
    fontFamily: 'Dreaming',
    fontSize: 43, // 1.42em of 30px
    lineHeight: 26, // 0.85 of 30px
    fontWeight: '400',
  },
  scroll: {
    flexGrow: 1,
  },
  cameraContainer: {
    paddingHorizontal: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#2A2926',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: Colors.Chalk,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  placeholderCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    backgroundColor: Colors.Chalk,
    borderRadius: 12,
    padding: 8,
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 26,
    paddingBottom: 38,
    gap: 12,
  },
  instruction: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexGrow: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Chalk,
  },
  codeBlock: {
    alignItems: 'center',
    gap: 4,
  },
  bigCode: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: Colors.Chalk,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Chalk,
    marginTop: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 22,
    letterSpacing: 4,
    color: Colors.Chalk,
  },
  submit: {
    backgroundColor: Colors.Chalk,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Ink,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.Chalk,
  },
});
