/**
 * INFLUENCER — TWO STREAMS
 * WIRE: GET /influencer/earnings. Stub UI. PIXEL is P11. [MA-05]
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { api } from '../../src/api/client';

type Earnings = {
  earned: number;
  building: number;
  flatRateCents: number;
};

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function InfluencerEarningsScreen() {
  const router = useRouter();
  const [data, setData] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const result = await api.get<Earnings>('/influencer/earnings');
    if (result.error) {
      setError(result.error.message);
      setData(null);
    } else {
      setData(result.data ?? null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const earned = data?.earned ?? 0;
  const building = data?.building ?? 0;
  const flat = data?.flatRateCents ?? 2000;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        <Text style={styles.title}>{t('influencer.earnings.title')}</Text>
        <Text style={styles.sub}>
          {t('influencer.common.flatRate', { amount: dollars(flat) })}
        </Text>
        <Text style={styles.credit}>{t('influencer.common.creditNotCoupon')}</Text>

        {loading ? <ActivityIndicator color={Colors.Ink} /> : null}
        {error ? (
          <Text style={styles.error} testID="influencer-earnings-error">
            {error}
          </Text>
        ) : null}

        <View style={styles.cards}>
          <View style={[styles.card, styles.cardPaid]} testID="influencer-paid-card">
            <Text style={styles.cardLabel}>{t('influencer.earnings.paidToYou')}</Text>
            <Text style={styles.cardAmount} testID="influencer-earned">
              {dollars(earned)}
            </Text>
          </View>
          <View style={[styles.card, styles.cardBuilding]} testID="influencer-building-card">
            <Text style={styles.cardLabelMuted}>{t('influencer.earnings.building')}</Text>
            <Text style={styles.cardAmountMuted} testID="influencer-building">
              {dollars(building)}
            </Text>
            <Text style={styles.cardSub}>{t('influencer.earnings.buildingSub')}</Text>
          </View>
        </View>

        <Text style={styles.stream}>{t('influencer.earnings.streamA')}</Text>
        <Text style={styles.streamTitle}>{t('influencer.earnings.streamATitle')}</Text>
        <Text style={styles.stream}>{t('influencer.earnings.streamB')}</Text>
        <Text style={styles.streamTitle}>{t('influencer.earnings.streamBTitle')}</Text>

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
  cardAmountMuted: { fontSize: 28, fontWeight: '600', color: Colors.Muted },
  cardSub: { fontSize: 12, color: Colors.Faint },
  stream: { fontSize: 12, fontWeight: '700', color: Colors.Muted, marginTop: 8 },
  streamTitle: { fontSize: 15, color: Colors.Ink },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
  error: { fontSize: 14, color: Colors.SignalRed },
});
