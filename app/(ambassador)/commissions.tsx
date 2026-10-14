/**
 * COMMISSIONS TRACKER
 * Missing: GET /ambassador/commissions
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function CommissionsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.commissions.title')}</Text>

        <View style={styles.cards}>
          <View style={[styles.card, styles.cardPaid]} testID="commissions-paid-card">
            <Text style={styles.cardLabel}>{t('ambassador.commissions.paidToYou')}</Text>
            <Text style={styles.cardAmount}>{t('ambassador.common.notAvailable')}</Text>
          </View>
          <View style={[styles.card, styles.cardBuilding]} testID="commissions-building-card">
            <Text style={styles.cardLabelBuilding}>{t('ambassador.commissions.building')}</Text>
            <Text style={styles.cardAmountBuilding}>{t('ambassador.common.notAvailable')}</Text>
            <Text style={styles.cardSub}>{t('ambassador.commissions.buildingSub')}</Text>
          </View>
        </View>

        <Text style={styles.unavailable} testID="commissions-unavailable">
          {t('ambassador.commissions.unavailable')}
        </Text>
        <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink },
  cards: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, borderRadius: 12, padding: 14, gap: 4 },
  cardPaid: { borderWidth: 1.5, borderColor: Colors.Fern },
  cardBuilding: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.Line, backgroundColor: Colors.Bone },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Fern,
  },
  cardLabelBuilding: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  cardAmount: { fontSize: 28, fontWeight: '800', color: Colors.Ink },
  cardAmountBuilding: { fontSize: 28, fontWeight: '800', color: Colors.Muted },
  cardSub: { fontSize: 13, color: Colors.Muted },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
