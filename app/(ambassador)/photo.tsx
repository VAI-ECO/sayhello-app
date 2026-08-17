/**
 * A10 PHOTO OF THE PLACE — no backend
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function PhotoPlaceScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.photo.title')}</Text>
        <View style={styles.dropZone} testID="photo-drop-zone" />
        <Button title={t('ambassador.photo.takeNow')} onPress={() => {}} disabled testID="photo-camera" />
        <Button
          title={t('ambassador.photo.chooseLibrary')}
          onPress={() => {}}
          disabled
          variant="secondary"
          testID="photo-library"
        />
        <Text style={styles.note}>
          {t('ambassador.photo.signingNote', { amount: t('figures.origination') })}
        </Text>
        <Text style={styles.unavailable} testID="photo-unavailable">
          {t('ambassador.photo.unavailable')}
        </Text>
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
  dropZone: {
    height: 210,
    borderWidth: 1.5,
    borderColor: Colors.Line,
    borderRadius: 8,
    backgroundColor: Colors.Bone,
  },
  note: { fontSize: 13, lineHeight: 18, color: Colors.Muted, textAlign: 'center' },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
