/**
 * VISIT HISTORY
 * Missing: GET /ambassador/visits
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function VisitHistoryScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.visitHistory.title')}</Text>
        <Text style={styles.lead}>{t('ambassador.visitHistory.lead')}</Text>

        <View style={styles.empty} testID="visit-history-empty">
          <Text style={styles.unavailable}>{t('ambassador.visitHistory.unavailable')}</Text>
          <Button title={t('error.retry')} onPress={() => {}} variant="secondary" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink },
  lead: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  empty: { gap: 12, paddingVertical: 24 },
  unavailable: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
});
