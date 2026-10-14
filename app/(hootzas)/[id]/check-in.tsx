/**
 * ATTENDEE CHECK-IN
 * POST /api/hootzas/:id/checkin
 */

import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { checkInHootza } from '../../../src/api/hootzas';

export default function CheckInScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const busy = useRef(false);
  const scanHandled = useRef(false);
  const active = useRef(focused && foreground);
  const mounted = useRef(true);
  const focusRef = useRef(focused);
  focusRef.current = focused;
  active.current = focused && foreground;
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', state => {
      setForeground(state === 'active');
      if (state !== 'active') { scanHandled.current = true; setScanning(false); }
    });
    return () => { mounted.current = false; active.current = false; sub.remove(); };
  }, []);
  useEffect(() => { if (!focused) { scanHandled.current = true; setScanning(false); } }, [focused]);

  async function submit(value = code) {
    const token = value.trim();
    if (!id || !token || busy.current) return;
    busy.current = true;
    scanHandled.current = true;
    setLoading(true);
    setScanning(false);
    setError(null);
    const res = await checkInHootza(id, token, false);
    busy.current = false;
    if (!mounted.current) return;
    setLoading(false);
    if (!focusRef.current) return;
    if (res.error || !res.data?.checkin) {
      setError(res.error?.message ?? t('hootzas.checkIn.failed'));
      return;
    }
    busy.current = true;
    setLoading(true);
    if (res.data?.hostModeRequested) {
      router.replace({
        pathname: '/(hootzas)/[id]/host-mode-prompt',
        params: { id, code: token },
      });
    } else {
      router.replace(`/(hootzas)/${id}`);
    }
  }

  async function openCamera() {
    if (requestingCamera || busy.current) return;
    setRequestingCamera(true);
    setError(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (!mounted.current || !focusRef.current) return;
      if (result.granted) { scanHandled.current = false; setScanning(true); }
      else setError(t('hootzas.checkIn.cameraDenied'));
    } catch { if (mounted.current) setError(t('hootzas.checkIn.cameraFailed')); }
    finally { if (mounted.current) setRequestingCamera(false); }
  }

  function onScan(result: BarcodeScanningResult) {
    if (!active.current || scanHandled.current || busy.current || result.type !== 'qr' || !result.data.trim()) return;
    scanHandled.current = true;
    setCode(result.data);
    void submit(result.data);
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('hootzas.checkIn.submit')}</Text>
        <Text style={styles.sub}>{t('hootzas.checkIn.cameraExplanation')}</Text>
        {scanning && focused && foreground && permission?.granted ? <>
          <CameraView testID="check-in-camera" style={{ height: 260 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan}
            onMountError={() => { scanHandled.current = true; setScanning(false); setError(t('hootzas.checkIn.cameraFailed')); }} />
          <Button title={t('hootzas.checkIn.stopCamera')} variant="secondary" onPress={() => { scanHandled.current = true; setScanning(false); }} />
        </> : <Button title={t('hootzas.checkIn.openCamera')} onPress={openCamera} loading={requestingCamera} disabled={loading || !permission} />}
        {permission && !permission.granted && !permission.canAskAgain && <Button title={t('hootzas.checkIn.openSettings')} variant="secondary" onPress={() => { void Linking.openSettings().catch(() => setError(t('hootzas.checkIn.cameraFailed'))); }} />}
        <Text style={styles.sub}>{t('hootzas.checkIn.scanPrompt')}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('hootzas.checkIn.scanPrompt')}
          testID="check-in-code-input"
          accessibilityLabel={t('hootzas.checkIn.scanPrompt')}
          editable={!loading}
        />
        {error ? <Text accessibilityRole="alert" selectable style={styles.error}>{error}</Text> : null}
        <Button
          title={t('hootzas.checkIn.submit')}
          onPress={() => submit()}
          loading={loading}
          disabled={!code.trim()}
          testID="check-in-submit"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 16, paddingVertical: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 16, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 15, color: Colors.Ink },
});
