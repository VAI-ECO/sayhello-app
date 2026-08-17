/**
 * H9 BUSINESS DASHBOARD — getBusinessDashboard not in API
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function HangoutDashboardScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>{t('hangout.common.helloHangout')}</Text>

        <View style={styles.hero} testID="dashboard-unavailable">
          <Text style={styles.heroLabel}>{t('hangout.dashboard.onMap')}</Text>
          <Text style={styles.heroValue}>{t('ambassador.common.notAvailable')}</Text>
        </View>

        <Text style={styles.unavailable}>{t('hangout.dashboard.unavailable')}</Text>

        <Button
          title={t('hangout.dashboard.postSomething')}
          onPress={() => router.push('/(hangout)/create-post')}
          testID="dashboard-post-cta"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  header: { fontSize: 18, fontWeight: '900', color: Colors.Ink },
  hero: { backgroundColor: Colors.Ink, borderRadius: 8, padding: 17, gap: 4 },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  heroValue: { fontSize: 48, fontWeight: '900', color: Colors.Chalk },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
