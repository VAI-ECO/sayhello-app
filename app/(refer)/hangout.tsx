/**
 * R1 MEMBER REFERS A HELLO HANGOUT — no backend
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, TextInput, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function ReferHangoutScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
          <Text style={styles.header}>{t('refer.hangout.title')}</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>{t('refer.hangout.headline')}</Text>
        <Text style={styles.body}>{t('refer.hangout.body')}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('refer.hangout.searchPlaceholder')}
          testID="refer-search"
        />

        <View style={styles.pointsBox}>
          <Text style={styles.pointsKicker}>{t('refer.hangout.ifTheySign')}</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{t('figures.referralPoints')}</Text>
            <Text style={styles.pointsLabel}>{t('refer.hangout.pointsLabel')}</Text>
          </View>
          <Text style={styles.pointsBody}>{t('refer.hangout.pointsBody')}</Text>
        </View>

        <Text style={styles.boundary}>{t('refer.hangout.boundary')}</Text>
        <Text style={styles.unavailable} testID="refer-unavailable">
          {t('refer.hangout.unavailable')}
        </Text>

        <Button title={t('refer.hangout.send')} onPress={() => {}} disabled testID="refer-submit" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 12, paddingBottom: 32 },
  back: { gap: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  headline: { fontSize: 25, fontWeight: '900', color: Colors.Ink, lineHeight: 28 },
  body: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  pointsBox: {
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  pointsKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  pointsValue: { fontSize: 34, fontWeight: '900', color: Colors.Ink },
  pointsLabel: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  pointsBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  boundary: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
