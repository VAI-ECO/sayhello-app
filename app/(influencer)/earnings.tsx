/**
 * INFLUENCER — TWO STREAMS
 * Missing: GET /influencer/earnings
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function InfluencerEarningsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('influencer.earnings.title')}</Text>
        <Text style={styles.sub}>
          {t('influencer.common.flatRate', { amount: t('figures.influencerFlat') })}
        </Text>
        <Text style={styles.credit}>{t('influencer.common.creditNotCoupon')}</Text>

        <View style={styles.cards}>
          <View style={[styles.card, styles.cardPaid]} testID="influencer-paid-card">
            <Text style={styles.cardLabel}>{t('influencer.earnings.paidToYou')}</Text>
            <Text style={styles.cardAmount}>{t('ambassador.common.notAvailable')}</Text>
          </View>
          <View style={[styles.card, styles.cardBuilding]} testID="influencer-building-card">
            <Text style={styles.cardLabelMuted}>{t('influencer.earnings.building')}</Text>
            <Text style={styles.cardAmountMuted}>{t('ambassador.common.notAvailable')}</Text>
            <Text style={styles.cardSub}>{t('influencer.earnings.buildingSub')}</Text>
          </View>
        </View>

        <Text style={styles.stream}>{t('influencer.earnings.streamA')}</Text>
        <Text style={styles.streamTitle}>{t('influencer.earnings.streamATitle')}</Text>
        <Text style={styles.stream}>{t('influencer.earnings.streamB')}</Text>
        <Text style={styles.streamTitle}>{t('influencer.earnings.streamBTitle')}</Text>

        <Text style={styles.unavailable} testID="influencer-earnings-unavailable">
          {t('influencer.earnings.unavailable')}
        </Text>
        <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>

        <Button
          title={t('influencer.pickCode.title')}
          onPress={() => router.push('/(influencer)/pick-code')}
          testID="influencer-pick-code"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 12, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 15, color: Colors.Muted },
  credit: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  cards: { flexDirection: 'row', gap: 10, marginTop: 8 },
  card: { flex: 1, borderRadius: 12, padding: 14, gap: 4 },
  cardPaid: { borderWidth: 1.5, borderColor: Colors.Fern },
  cardBuilding: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.Line },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Fern,
  },
  cardLabelMuted: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  cardAmount: { fontSize: 28, fontWeight: '800', color: Colors.Ink },
  cardAmountMuted: { fontSize: 28, fontWeight: '800', color: Colors.Muted },
  cardSub: { fontSize: 13, color: Colors.Muted },
  stream: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginTop: 8,
  },
  streamTitle: { fontSize: 18, fontWeight: '800', color: Colors.Ink },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
