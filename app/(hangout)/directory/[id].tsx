/**
 * H11a DIRECTORY LISTING — no backend
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';

export default function HangoutListingScreen() {
  const router = useRouter();
  useLocalSearchParams<{ id?: string }>();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('hangout.listing.title')}</Text>
        <Text style={styles.unavailable} testID="listing-unavailable">
          {t('hangout.listing.unavailable')}
        </Text>
        <Button title={t('common.done')} onPress={() => router.back()} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
