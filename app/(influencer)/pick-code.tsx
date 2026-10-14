/**
 * PICK A CODE
 * POST /codes/check-availability · POST /codes/influencer
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { checkCodeAvailability, setInfluencerCode } from '../../src/api/codes';

export default function PickCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!code.trim()) return;
    setChecking(true);
    setError(null);
    const res = await checkCodeAvailability(code.trim());
    setChecking(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data?.available) {
      setStatus('available');
    } else {
      setStatus('taken');
      router.push({ pathname: '/(influencer)/code-taken', params: { code: code.trim() } });
    }
  }

  async function takeCode() {
    setSaving(true);
    const res = await setInfluencerCode(code.trim());
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.back();
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('influencer.pickCode.title')}</Text>
        <Text style={styles.credit}>{t('influencer.common.creditNotCoupon')}</Text>

        <TextInput value={code} onChangeText={setCode} placeholder={t('influencer.pickCode.title')} testID="code-input" />

        {status === 'available' && (
          <Text style={styles.available} testID="code-available">
            {t('influencer.pickCode.available')}
          </Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.section}>{t('influencer.pickCode.howUsed')}</Text>
        <Text style={styles.body}>{t('influencer.common.neverPercent')}</Text>

        <Button title={t('influencer.pickCode.title')} onPress={check} loading={checking} testID="code-check" />
        <Button
          title={t('influencer.pickCode.takeCode')}
          onPress={takeCode}
          loading={saving}
          disabled={status !== 'available'}
          testID="code-take"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 12, paddingBottom: 32 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink },
  credit: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  available: { fontSize: 15, fontWeight: '700', color: Colors.Fern },
  error: { fontSize: 15, color: Colors.Ink },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginTop: 8,
  },
  body: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
