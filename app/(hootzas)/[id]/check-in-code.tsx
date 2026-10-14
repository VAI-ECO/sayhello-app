/**
 * CHECK-IN CODE (host display)
 * GET /api/hootzas/:id
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { ScannableCode } from '../../../src/components/qr-code';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getCheckinCount, getHootza, type Hootza } from '../../../src/api/hootzas';

export default function CheckInCodeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const qrSize = Math.max(120, Math.min(240, width - 108));
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getHootza(id);
    setLoading(false);
    if (res.error || !res.data?.hootza) {
      setError(res.error?.message ?? t('error.notFound'));
      return;
    }
    setHootza(res.data.hootza);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer style={styles.dark}>
        <ActivityIndicator color={Colors.Chalk} />
      </ScreenContainer>
    );
  }

  if (error || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  const checkins = getCheckinCount(hootza);
  const hasCode = hootza.status === 'live' && Boolean(hootza.checkInQrCode);
  const projection = hasCode ? hootza.hostPointsProjection : null;
  const attendeePoints = projection ? projection.pointsPerCheckin * projection.checkins : NaN;
  const hasPoints = projection && Number.isSafeInteger(projection.completionPoints) && projection.completionPoints >= 0
    && Number.isSafeInteger(attendeePoints) && attendeePoints >= 0;

  return (
    <ScreenContainer style={styles.dark}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
        <Text style={styles.title}>{t('hootzas.host.checkInCode')}</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.qrBox} testID="check-in-code-display">
          {hasCode && <ScannableCode value={hootza.checkInQrCode!} size={qrSize} label={t('hootzas.host.qrLabel')} fallback={t('hootzas.host.qrFailed')} />}
          <Text style={[styles.codeText, { maxWidth: qrSize }]} selectable>
            {hasCode ? hootza.checkInQrCode : t('hootzas.common.notAvailable')}
          </Text>
        </View>
        <Text style={styles.headline}>{t(hasCode ? 'hootzas.host.holdItUp' : 'hootzas.host.codeUnavailable')}</Text>
        <Text style={styles.sub}>{t(hasCode ? 'hootzas.host.tableNote' : 'hootzas.host.codeUnavailableHint')}</Text>
        <View style={styles.counterRow}>
          <View style={styles.counterCol}>
            <Text style={styles.counterValue}>{checkins}</Text>
            <Text style={styles.counterLabel}>{t('hootzas.host.scannedIn', { count: checkins })}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.counterCol}>
            <Text style={[styles.counterValue, styles.counterAccent]}>
              {hasPoints ? t('hootzas.host.perAttendeePoints', { count: attendeePoints }) : '—'}
            </Text>
            <Text style={styles.counterLabel}>{t('hootzas.host.projectedPoints')}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        {hasPoints ? t('hootzas.host.hostingPointsPending', { base: projection.completionPoints }) : t('hootzas.host.pointsUnavailable')}
      </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dark: { backgroundColor: Colors.Ink, paddingHorizontal: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back: { paddingHorizontal: 22, paddingTop: 12 },
  backText: { fontSize: 17, color: Colors.Chalk, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Chalk, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 20 },
  qrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.Chalk,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 15,
    gap: 14,
  },
  counterCol: { alignItems: 'center', minWidth: 90 },
  counterValue: { fontSize: 30, fontWeight: '800', color: Colors.Chalk },
  counterAccent: { color: Colors.Amber },
  counterLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.18)' },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    paddingBottom: 30,
  },
});
