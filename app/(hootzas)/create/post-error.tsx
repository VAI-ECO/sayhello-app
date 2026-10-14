/**
 * COULDN'T POST — create retry
 * Draft preserved in hootza-create-draft state
 */

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';

export default function PostErrorScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.content} testID="post-error">
        <Text style={styles.title}>{t('hootzas.postError.title')}</Text>
        <Text style={styles.body}>{t('hootzas.postError.body')}</Text>
        <Button
          title={t('hootzas.common.retry')}
          onPress={() => router.replace('/(hootzas)/create/how-it-runs')}
          testID="post-error-retry"
        />
        <Button
          title={t('error.comeBackLater')}
          onPress={() => router.back()}
          variant="secondary"
          testID="post-error-later"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16, paddingVertical: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24, color: Colors.Muted },
});
