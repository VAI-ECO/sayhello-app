/**
 * A4 VISIT CHECK-IN
 * Missing: POST /ambassador/visits/check-in
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function VisitCheckInScreen() {
  const router = useRouter();
  const { hangoutName } = useLocalSearchParams<{ hangoutName?: string }>();
  const name = hangoutName ?? t('ambassador.common.helloHangout');

  return (
    <ScreenContainer style={styles.dark}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.why}>{t('ambassador.visitCheckIn.whyExists')}</Text>
        <Text style={styles.atVenue}>{t('ambassador.visitCheckIn.atVenue', { name })}</Text>
        <Text style={styles.scanTitle}>{t('ambassador.visitCheckIn.scanTitle')}</Text>
        <Text style={styles.scanBody}>{t('ambassador.visitCheckIn.scanBody')}</Text>

        <View style={styles.unavailableBox} testID="visit-checkin-unavailable">
          <Text style={styles.unavailable}>{t('ambassador.visitCheckIn.unavailable')}</Text>
        </View>

        <Button
          title={t('ambassador.visitCheckIn.submitScan')}
          onPress={() => {}}
          disabled
          testID="visit-scan-disabled"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dark: { backgroundColor: Colors.Ink, paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 16, flexGrow: 1 },
  back: { paddingVertical: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Chalk },
  why: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.75)' },
  atVenue: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  scanTitle: { fontSize: 28, fontWeight: '800', color: Colors.Chalk },
  scanBody: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.7)' },
  unavailableBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 14,
  },
  unavailable: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.8)' },
});
