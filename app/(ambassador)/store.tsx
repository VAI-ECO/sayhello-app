/**
 * A7 AMBASSADOR STORE — no Shopify backend
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function AmbassadorStoreScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
          <Text style={styles.title}>{t('ambassador.store.title')}</Text>
        </TouchableOpacity>
        <Text style={styles.headline}>{t('ambassador.store.headline')}</Text>
        <Text style={styles.body}>{t('ambassador.store.body')}</Text>
        <Text style={styles.unavailable} testID="store-unavailable">
          {t('ambassador.store.unavailable')}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  back: { gap: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  headline: { fontSize: 26, fontWeight: '900', color: Colors.Ink, lineHeight: 28 },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginTop: 12 },
});
