/**
 * A2 MY HELLO HANGOUTS
 * Missing: GET /ambassador/hangouts
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function MyHelloHangoutsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.hangouts.title')}</Text>

        <View style={styles.tabs}>
          <Text style={styles.tabActive}>
            {t('ambassador.hangouts.tabNeedsVisit', { count: 0 })}
          </Text>
          <Text style={styles.tab}>
            {t('ambassador.hangouts.tabComplete', { count: 0 })}
          </Text>
        </View>

        <View style={styles.empty} testID="hangouts-unavailable">
          <Text style={styles.unavailable}>{t('ambassador.hangouts.unavailable')}</Text>
          <Button
            title={t('ambassador.queue.accept')}
            onPress={() => router.push('/(ambassador)/queue-offer')}
            variant="secondary"
            testID="hangouts-queue-link"
          />
        </View>

        <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink, letterSpacing: -0.5 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: Colors.Line },
  tabActive: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.Ink,
    borderBottomWidth: 3,
    borderColor: Colors.Ink,
    marginBottom: -1,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.Muted,
  },
  empty: { gap: 12, paddingVertical: 24 },
  unavailable: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
