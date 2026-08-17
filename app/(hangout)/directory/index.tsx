/**
 * H11 HELLO HANGOUT DIRECTORY — no backend
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';

export default function HangoutDirectoryScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('hangout.directory.title')}</Text>
        <View style={styles.empty} testID="directory-empty">
          <Text style={styles.unavailable}>{t('hangout.directory.unavailable')}</Text>
          <Button title={t('error.retry')} onPress={() => {}} variant="secondary" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  empty: { flex: 1, justifyContent: 'center', gap: 12, paddingVertical: 40 },
  unavailable: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
});
