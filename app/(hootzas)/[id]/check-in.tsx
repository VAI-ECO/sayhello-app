/**
 * ATTENDEE CHECK-IN
 * POST /api/hootzas/:id/checkin
 */

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

  async function submit(acceptHostMode: boolean) {
    if (!id || !code.trim()) return;
    setLoading(true);
    setError(null);
    const res = await checkInHootza(id, code.trim(), acceptHostMode);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data?.hostModeRequested) {
      router.replace({
        pathname: '/(hootzas)/[id]/host-mode-prompt',
        params: { id, code: code.trim() },
      });
    } else {
      router.replace(`/(hootzas)/${id}`);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>{t('hootzas.checkIn.submit')}</Text>
        <Text style={styles.sub}>{t('hootzas.checkIn.scanPrompt')}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('hootzas.checkIn.scanPrompt')}
          testID="check-in-code-input"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={t('hootzas.checkIn.submit')}
          onPress={() => submit(false)}
          loading={loading}
          disabled={!code.trim()}
          testID="check-in-submit"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 16, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 16, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 15, color: Colors.Ink },
});
