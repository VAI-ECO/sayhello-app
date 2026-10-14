/**
 * SCANNED IN — HOST MODE ASKED
 * POST /api/hootzas/:id/checkin (acceptHostMode)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { checkInHootza, getHootza } from '../../../src/api/hootzas';

export default function HostModePromptScreen() {
  const router = useRouter();
  const { id, code } = useLocalSearchParams<{ id: string; code?: string }>();
  const [hostName, setHostName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setFetching(true);
    setLoadError(null);
    if (!id || !code) { setLoadError(t('hootzas.checkIn.missingCode')); setFetching(false); return; }
    const res = await getHootza(id);
    setFetching(false);
    if (res.error || !res.data?.hootza) { setLoadError(res.error?.message ?? t('error.notFound')); return; }
    setHostName(res.data.hootza.host?.fullName ?? t('hootzas.common.host'));
    setTitle(res.data.hootza.title);
  }, [id, code]);
  useEffect(() => {
    void load();
  }, [load]);

  async function respond(accept: boolean) {
    if (!id || !code || busy.current) return;
    busy.current = true;
    setLoading(true);
    setError(null);
    const result = await checkInHootza(id, code, accept);
    busy.current = false;
    setLoading(false);
    if (result.error || !result.data?.checkin) {
      setError(result.error?.message ?? t('hootzas.checkIn.consentFailed'));
      return;
    }
    // Consent does not mean a Host Mode window is currently open.
    busy.current = true;
    setLoading(true);
    router.replace(`/(hootzas)/${id}`);
  }

  if (fetching) return <ScreenContainer><ActivityIndicator accessibilityLabel={t('common.loading')} /></ScreenContainer>;
  if (loadError) return <ScreenContainer><Text accessibilityRole="alert">{loadError}</Text><Button title={t('error.retry')} onPress={load} /><Button title={t('hootzas.common.back')} onPress={() => router.back()} variant="secondary" /></ScreenContainer>;

  return (
    <ScreenContainer>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('hootzas.checkIn.youreIn')}</Text>
        <Text style={styles.headline}>
          {t('hootzas.checkIn.checkedInAt', { title: title || t('hootzas.common.unknown') })}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.askLead}>
          {t('hootzas.checkIn.hostAsking', { host: hostName || t('hootzas.common.unknown') })}
        </Text>
        <Text style={styles.ask}>{t('hootzas.checkIn.hostModeAsk')}</Text>
        <Text style={styles.body}>{t('hootzas.checkIn.hostModeExplain')}</Text>
        {error && <Text accessibilityRole="alert">{error}</Text>}
        <Button
          title={t('hootzas.checkIn.acceptHostMode')}
          onPress={() => respond(true)}
          loading={loading}
          testID="host-mode-accept"
        />
        <Button
          title={t('hootzas.checkIn.declineHostMode')}
          onPress={() => respond(false)}
          variant="secondary"
          disabled={loading}
          testID="host-mode-decline"
        />
        <Text style={styles.note}>{t('hootzas.checkIn.eitherWay')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: 14, paddingVertical: 24 },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Fern,
  },
  headline: { fontSize: 30, fontWeight: '800', color: Colors.Ink, lineHeight: 34 },
  divider: { height: 1, backgroundColor: Colors.Line, marginVertical: 8 },
  askLead: { fontSize: 15, color: Colors.Muted },
  ask: { fontSize: 23, fontWeight: '700', color: Colors.Ink, lineHeight: 28 },
  body: { fontSize: 15, lineHeight: 24, color: Colors.Muted },
  note: { textAlign: 'center', fontSize: 13, color: Colors.Faint },
});
