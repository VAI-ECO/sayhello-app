/**
 * SCANNED IN — HOST MODE ASKED
 * POST /api/hootzas/:id/checkin (acceptHostMode)
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  useEffect(() => {
    if (!id) return;
    getHootza(id).then((res) => {
      if (res.data?.hootza) {
        setHostName(res.data.hootza.host?.fullName ?? t('hootzas.common.host'));
        setTitle(res.data.hootza.title);
      }
    });
  }, [id]);

  async function respond(accept: boolean) {
    if (!id || !code) {
      router.replace(`/(hootzas)/${id}`);
      return;
    }
    setLoading(true);
    await checkInHootza(id, code, accept);
    setLoading(false);
    if (accept) router.replace(`/(hootzas)/${id}/host-mode-window`);
    else router.replace(`/(hootzas)/${id}`);
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
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
          testID="host-mode-decline"
        />
        <Text style={styles.note}>{t('hootzas.checkIn.eitherWay')}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 14, paddingVertical: 24 },
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
