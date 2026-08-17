/**
 * HOST MODE — WINDOW OPEN (attendee)
 * Uses host_mode config from GET /api/hootzas/:id
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getHostModeConfig, getHootza, type Hootza } from '../../../src/api/hootzas';
import { formatClock } from '../../../src/lib/hootza-format';

export default function HostModeWindowScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optedOut, setOptedOut] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
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
      <ScreenContainer style={styles.ground}>
        <ActivityIndicator color={FixedColors.hootza} />
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

  const hostMode = getHostModeConfig(hootza);
  const hostName = hootza.host?.fullName ?? t('hootzas.common.host');
  const minutesLeft = hostMode?.windowLengthMinutes ?? 10;

  return (
    <ScreenContainer style={styles.ground}>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>{t('hootzas.hostModeWindow.appName')}</Text>
        <Text style={styles.noticeBody}>
          {t('hootzas.hostModeWindow.notificationCopy', { title: hootza.title })}
        </Text>
      </View>
      <Text style={styles.oneNote}>{t('hootzas.hostModeWindow.oneNotification')}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.openLabel}>{t('hootzas.hostModeWindow.youreOpen')}</Text>
          {!optedOut && (
            <Text style={styles.timePill}>
              {t('hootzas.hostModeWindow.timeLeft', { minutes: minutesLeft })}
            </Text>
          )}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, optedOut && styles.progressOff]} />
        </View>
        <Text style={styles.cardBody}>
          {t('hootzas.hostModeWindow.roomOpen', { host: hostName })}
        </Text>
        <View style={styles.optRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
            <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
          </View>
          <Button
            title={optedOut ? t('whatsHappening.header.toggleOn') : t('whatsHappening.header.toggleOff')}
            onPress={() => setOptedOut((v) => !v)}
            variant="secondary"
            testID="host-mode-opt-out-toggle"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
        <Text style={styles.whenBody}>
          {t('hootzas.hostModeWindow.whenItStopsBody', {
            endTime: formatClock(new Date(hootza.scheduledEndTime)),
            host: hostName,
          })}
        </Text>
      </View>

      <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ground: { backgroundColor: Colors.Canvas },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  notice: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 8,
  },
  noticeTitle: { fontSize: 22, fontWeight: '400', color: Colors.Ink },
  noticeBody: { fontSize: 15, lineHeight: 20, color: Colors.Ink, marginTop: 4 },
  oneNote: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.Muted,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.Chalk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openLabel: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  timePill: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.Muted,
    backgroundColor: Colors.Bone,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.Canvas,
    overflow: 'hidden',
  },
  progressFill: { width: '88%', height: '100%', backgroundColor: Colors.Fern },
  progressOff: { width: '0%' },
  cardBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderColor: Colors.Hairline, paddingTop: 13 },
  optTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  optSub: { fontSize: 13, color: Colors.Muted, marginTop: 1 },
  whenTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  whenBody: { fontSize: 15, lineHeight: 22, color: Colors.Ink },
});
