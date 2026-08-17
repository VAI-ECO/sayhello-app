/**
 * H12 DEAL REDEMPTION — no backend
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function DealRedemptionScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangout.redeem.title')}</Text>
        <Text style={styles.prompt}>{t('hangout.redeem.scanPrompt')}</Text>
        <Text style={styles.unavailable} testID="redeem-unavailable">
          {t('hangout.redeem.unavailable')}
        </Text>
        <Button title={t('hangout.redeem.scanPrompt')} onPress={() => {}} disabled testID="redeem-scan" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  prompt: { fontSize: 16, lineHeight: 22, color: Colors.Muted },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
