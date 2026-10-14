/**
 * HOST CONTROLS
 * GET /api/hootzas/:id · POST /api/hootzas/:id/end
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  endHootza,
  getCheckinCount,
  getHostModeConfig,
  getHootza,
  getRsvpCount,
  type Hootza,
  saveHostMode,
} from '../../../src/api/hootzas';
import { formatClock } from '../../../src/lib/hootza-format';

export default function HostControlsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [interval, setInterval] = useState('');
  const [windowLength, setWindowLength] = useState('');
  const [savingMode, setSavingMode] = useState(false);
  const [modeMessage, setModeMessage] = useState<string | null>(null);

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
    const config = getHostModeConfig(res.data.hootza);
    setInterval(config ? String(config.intervalMinutes) : '');
    setWindowLength(config ? String(config.windowLengthMinutes) : '');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveMode() {
    if (!id || savingMode) return;
    const minutes = Number(interval);
    const windowMinutes = Number(windowLength);
    if (!Number.isSafeInteger(minutes) || minutes <= 0 || !Number.isSafeInteger(windowMinutes) || windowMinutes <= 0) {
      setModeMessage('Enter positive whole minutes for both fields.');
      return;
    }
    setSavingMode(true);
    setModeMessage(null);
    const result = await saveHostMode(id, minutes, windowMinutes);
    setSavingMode(false);
    if (result.error || !result.data?.hostMode) {
      setModeMessage(result.error?.message ?? 'Could not save Host Mode. Please try again.');
      return;
    }
    setHootza(current => current ? { ...current, hostMode: result.data!.hostMode } : current);
    setModeMessage('Host Mode saved.');
  }

  async function handleEnd() {
    if (!id || ending || hootza?.status !== 'live') return;
    setEnding(true);
    setEndError(null);
    const res = await endHootza(id);
    setEnding(false);
    if (res.error || !res.data) {
      setEndError(res.error?.message ?? t('hootzas.host.endFailed'));
      return;
    }
    router.replace(`/(hootzas)/${id}`);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={FixedColors.hootza} />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  const checkins = getCheckinCount(hootza);
  const going = getRsvpCount(hootza);
  const projectedPoints = hootza.status === 'live' ? hootza.hostPointsProjection?.projectedPoints : undefined;
  const hasProjection = typeof projectedPoints === 'number' && Number.isSafeInteger(projectedPoints) && projectedPoints >= 0;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.host.title')}</Text>
        </TouchableOpacity>

        <View style={styles.liveCard}>
          <Text style={styles.liveLabel}>{t(hootza.status === 'live' ? 'hootzas.host.liveNow' : `hootzas.status.${hootza.status}`)}</Text>
          <Text style={styles.liveTitle}>{hootza.title}</Text>
          <Text style={styles.liveSub}>
            {hootza.scheduledEndTime
              ? t('hootzas.host.startedBackstop', {
                  start: formatClock(new Date(hootza.startTime)),
                  end: formatClock(new Date(hootza.scheduledEndTime)),
                })
              : t('hootzas.create.endHint')}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Stat value={String(checkins)} label={t('hootzas.host.checkedIn')} />
          <Stat value={String(going)} label={t('hootzas.host.saidGoing')} />
          <Stat value={hasProjection ? String(projectedPoints) : '—'} label={t('hootzas.host.projectedPoints')} accent />
        </View>
        <Text style={[styles.cardBody, { marginHorizontal: 22, marginBottom: 13 }]}>
          {t(hasProjection ? 'hootzas.host.projectedPointsHint' : 'hootzas.host.pointsUnavailable')}
        </Text>

        {hootza.status === 'live' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.host.hostModeTitle')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.host.hostModeHint')}</Text>
            <View style={styles.intervalRow}>
              <View style={styles.intervalBox}>
                <Text style={styles.intervalLabel}>{t('hootzas.host.every')}</Text>
                <TextInput accessibilityLabel="Host Mode interval in minutes" keyboardType="number-pad" value={interval} onChangeText={setInterval} editable={!savingMode} style={[styles.intervalValue, { minHeight: 44 }]} />
              </View>
              <View style={styles.intervalBox}>
                <Text style={styles.intervalLabel}>{t('hootzas.host.openFor')}</Text>
                <TextInput accessibilityLabel="Host Mode window in minutes" keyboardType="number-pad" value={windowLength} onChangeText={setWindowLength} editable={!savingMode} style={[styles.intervalValue, { minHeight: 44 }]} />
              </View>
            </View>
            {modeMessage && <Text accessibilityRole="alert">{modeMessage}</Text>}
            <Button title="Save Host Mode" onPress={handleSaveMode} loading={savingMode} />
          </View>
        )}

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push(`/(hootzas)/${id}/check-in-code`)}
          testID="host-check-in-code"
        >
          <View>
            <Text style={styles.linkTitle}>{t('hootzas.host.checkInCode')}</Text>
            <Text style={styles.linkSub}>
              {t('hootzas.host.scannedIn', { count: checkins })}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push(`/(hootzas)/${id}/whos-here`)}
          testID="host-whos-here"
        >
          <View>
            <Text style={styles.linkTitle}>{t('hootzas.host.whosHere')}</Text>
            <Text style={styles.linkSub}>{t('hootzas.host.attendeeList')}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push(`/(hootzas)/${id}/edit`)}
          testID="host-edit"
        >
          <Text style={styles.linkTitle}>{t('hootzas.edit.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push(`/(hootzas)/${id}/end-vs-cancel`)}
          testID="host-end-vs-cancel"
        >
          <Text style={styles.linkTitle}>{t('hootzas.endVsCancel.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.endCard}>
          <Text style={styles.endTitle}>{t('hootzas.host.wrapTitle')}</Text>
          <Text style={styles.endBody}>{t('hootzas.host.wrapHint')}</Text>
          {endError && <Text accessibilityRole="alert" style={styles.errorText}>{endError}</Text>}
          <Button
            title={t('hootzas.host.endButton')}
            onPress={handleEnd}
            loading={ending}
            disabled={hootza.status !== 'live'}
            testID="host-end-hootza"
          />
        </View>

        <View style={styles.cancelTray}>
          <Text style={styles.cancelLead}>
            <Text style={styles.cancelBold}>{t('hootzas.host.cancelInstead')}</Text>{' '}
            {t('hootzas.host.cancelHint', { count: going })}
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/(hootzas)/${id}/cancel-confirm`)}
            testID="host-cancel-link"
          >
            <Text style={styles.cancelLink}>{t('hootzas.host.cancelLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && styles.statAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: Colors.Ink, fontSize: 16, textAlign: 'center' },
  back: { paddingHorizontal: 22, paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  liveCard: {
    marginHorizontal: 22,
    borderWidth: 1.5,
    borderColor: FixedColors.hootza,
    borderRadius: 14,
    padding: 13,
    marginBottom: 13,
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: FixedColors.hootza,
  },
  liveTitle: { fontSize: 19, fontWeight: '800', color: Colors.Ink, marginTop: 3 },
  liveSub: { fontSize: 14, color: Colors.Muted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, marginBottom: 13 },
  stat: { flex: 1, backgroundColor: Colors.Bone, borderRadius: 14, padding: 11 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.Ink },
  statAccent: { color: Colors.Amber },
  statLabel: { fontSize: 12, color: Colors.Muted, lineHeight: 16 },
  card: {
    marginHorizontal: 22,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 13,
    marginBottom: 13,
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  cardBody: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  intervalRow: { flexDirection: 'row', gap: 9 },
  intervalBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 10,
    padding: 10,
  },
  intervalLabel: { fontSize: 12, color: Colors.Faint },
  intervalValue: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  linkRow: {
    marginHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  linkTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  linkSub: { fontSize: 13, color: Colors.Muted },
  chevron: { fontSize: 17, color: Colors.Faint },
  endCard: {
    marginHorizontal: 22,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 14,
    padding: 14,
    gap: 9,
  },
  endTitle: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  endBody: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  cancelTray: {
    marginTop: 16,
    marginHorizontal: 22,
    backgroundColor: Colors.Bone,
    borderTopWidth: 1,
    borderColor: Colors.Line,
    paddingVertical: 14,
    gap: 6,
  },
  cancelLead: { fontSize: 15, lineHeight: 20, color: Colors.Muted },
  cancelBold: { color: Colors.SignalRed, fontWeight: '700' },
  cancelLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.SignalRed,
    textDecorationLine: 'underline',
  },
});
