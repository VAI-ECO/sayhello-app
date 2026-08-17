/**
 * CODE ALREADY TAKEN
 * POST /codes/check-availability
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { checkCodeAvailability } from '../../src/api/codes';

export default function CodeTakenScreen() {
  const router = useRouter();
  const { code: takenCode } = useLocalSearchParams<{ code?: string }>();
  const [nextCode, setNextCode] = useState('');
  const [checking, setChecking] = useState(false);

  async function tryAnother() {
    if (!nextCode.trim()) return;
    setChecking(true);
    const res = await checkCodeAvailability(nextCode.trim());
    setChecking(false);
    if (res.data?.available) {
      router.replace('/(influencer)/pick-code');
    }
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('influencer.codeTaken.title')}</Text>

        {takenCode ? (
          <Text style={styles.takenCode} testID="code-taken-display">
            {takenCode}
          </Text>
        ) : null}
        <Text style={styles.takenLabel}>{t('influencer.codeTaken.taken')}</Text>

        <Text style={styles.section}>{t('influencer.codeTaken.freeNow')}</Text>
        <TextInput
          value={nextCode}
          onChangeText={setNextCode}
          placeholder={t('influencer.codeTaken.tryAnother')}
          testID="code-taken-input"
        />

        <Button
          title={t('influencer.codeTaken.tryAnother')}
          onPress={tryAnother}
          loading={checking}
          disabled={!nextCode.trim()}
          testID="code-try-another"
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
  takenCode: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.Muted,
    textDecorationLine: 'line-through',
  },
  takenLabel: { fontSize: 15, color: Colors.Muted },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginTop: 12,
  },
});
