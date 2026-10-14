/**
 * A8 FIND THE BUSINESS — no backend
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, TextInput, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function FindBusinessScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.findBusiness.title')}</Text>
        <TextInput
          placeholder={t('ambassador.findBusiness.searchPlaceholder')}
          testID="find-business-search"
        />
        <Text style={styles.unavailable} testID="find-business-unavailable">
          {t('ambassador.findBusiness.unavailable')}
        </Text>
        <Button
          title={t('common.continue')}
          onPress={() => router.push('/(ambassador)/confirm-details')}
          disabled
          testID="find-business-next"
        />
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
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
