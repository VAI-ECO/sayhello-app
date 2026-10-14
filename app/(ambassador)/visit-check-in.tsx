/**
 * A4 VISIT CHECK-IN
 * WIRE: POST /ambassador/visits/check-in. Stub UI. PIXEL is P11.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { checkInVisit } from '../../src/api/ambassador';

export default function VisitCheckInScreen() {
  const router = useRouter();
  const { hangoutName, helloHangoutId, hangoutId } = useLocalSearchParams<{
    hangoutName?: string;
    helloHangoutId?: string;
    hangoutId?: string;
  }>();
  const name = hangoutName ?? t('ambassador.common.helloHangout');
  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const submit = async () => {
    const hh = typeof helloHangoutId === 'string' ? helloHangoutId : undefined;
    const h = typeof hangoutId === 'string' ? hangoutId : undefined;
    if (!hh && !h) {
      setError('Open this screen from a Hello Hangout to check in.');
      return;
    }
    setBusy(true);
    setError(null);
    // Stub coords — device GPS in PIXEL. Server still enforces proximity.
    const result = await checkInVisit({
      helloHangoutId: hh,
      hangoutId: h,
      lat: 0,
      lng: 0,
      qrStandSerial: serial.trim() || undefined,
    });
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setDoneId(result.data?.visit.id ?? 'ok');
  };

  return (
    <ScreenContainer style={styles.dark}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.why}>{t('ambassador.visitCheckIn.whyExists')}</Text>
        <Text style={styles.atVenue}>{t('ambassador.visitCheckIn.atVenue', { name })}</Text>
        <Text style={styles.scanTitle}>{t('ambassador.visitCheckIn.scanTitle')}</Text>
        <Text style={styles.scanBody}>{t('ambassador.visitCheckIn.scanBody')}</Text>

        <TextInput
          style={styles.input}
          value={serial}
          onChangeText={setSerial}
          placeholder="QR stand serial (optional)"
          placeholderTextColor="rgba(255,255,255,0.4)"
          testID="visit-serial"
        />

        {error ? (
          <Text style={styles.error} testID="visit-checkin-error">
            {error}
          </Text>
        ) : null}
        {doneId ? (
          <Text style={styles.done} testID="visit-checkin-done">
            Visit recorded ({doneId})
          </Text>
        ) : null}

        <Button
          title={busy ? t('ambassador.common.loading') : t('ambassador.visitCheckIn.submitScan')}
          onPress={submit}
          disabled={busy}
          testID="visit-scan-submit"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dark: { backgroundColor: Colors.Ink, paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 16, flexGrow: 1 },
  back: { paddingVertical: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Chalk },
  why: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.75)' },
  atVenue: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  scanTitle: { fontSize: 28, fontWeight: '800', color: Colors.Chalk },
  scanBody: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.7)' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 14,
    color: Colors.Chalk,
    fontSize: 16,
  },
  error: { fontSize: 14, color: Colors.SignalRed },
  done: { fontSize: 14, color: Colors.Chalk },
});
