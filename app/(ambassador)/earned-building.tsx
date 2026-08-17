/**
 * A1 EARNED AND BUILDING
 * GET /ambassador/payouts/balance
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getPayoutBalance, type PayoutBalance } from '../../src/api/ambassador';
import { formatCents } from '../../src/lib/money-format';

export default function EarnedBuildingScreen() {
  const router = useRouter();
  const [data, setData] = useState<PayoutBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getPayoutBalance();
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setData(res.data ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator testID="earned-loading" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="earned-error">
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="earned-empty">
          <Text>{t('ambassador.common.empty')}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>{t('ambassador.earnedBuilding.title')}</Text>

        <View style={styles.earnedCard} testID="earned-card">
          <Text style={styles.earnedLabel}>{t('ambassador.earnedBuilding.earnedLabel')}</Text>
          <Text style={styles.earnedAmount}>{formatCents(data.earned)}</Text>
          <Text style={styles.earnedSub}>
            {t('ambassador.earnedBuilding.earnedSub', { count: 0 })}
          </Text>
        </View>

        <View style={styles.buildingCard} testID="building-card">
          <View style={styles.buildingHeader}>
            <Text style={styles.buildingLabel}>{t('ambassador.earnedBuilding.buildingLabel')}</Text>
            <Text style={styles.potential}>{t('ambassador.common.potential')}</Text>
          </View>
          <Text style={styles.buildingAmount}>{formatCents(data.building)}</Text>
        </View>

        <Text style={styles.pitch}>{t('ambassador.earnedBuilding.pitch')}</Text>

        <View style={styles.ledger}>
          <LedgerRow
            label={t('ambassador.earnedBuilding.signedPaid')}
            amount={formatCents(data.earned)}
            strong
          />
          <LedgerRow
            label={t('ambassador.earnedBuilding.waitingVisit')}
            amount={formatCents(data.building)}
            muted
          />
        </View>

        <Text style={styles.payableNote}>{t('ambassador.earnedBuilding.payableNote')}</Text>
        <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>

        <Button
          title={t('ambassador.earnedBuilding.claimCta', {
            amount: formatCents(Math.max(data.available, 0)),
          })}
          onPress={() => router.push('/(ambassador)/payouts')}
          testID="earned-claim-cta"
        />

        <TouchableOpacity onPress={() => router.push('/(ambassador)/hangouts')} testID="earned-hangouts-link">
          <Text style={styles.link}>{t('ambassador.hangouts.title')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

function LedgerRow({
  label,
  amount,
  strong,
  muted,
}: {
  label: string;
  amount: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.ledgerRow}>
      <Text style={[styles.ledgerLabel, strong && styles.ledgerStrong]}>{label}</Text>
      <Text style={[styles.ledgerAmount, muted && styles.ledgerMuted]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Ink,
  },
  earnedCard: {
    backgroundColor: Colors.Ink,
    borderRadius: 8,
    padding: 18,
    gap: 5,
  },
  earnedLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  earnedAmount: { fontSize: 40, fontWeight: '900', color: Colors.Chalk },
  earnedSub: { fontSize: 14, color: Colors.Faint },
  buildingCard: {
    borderWidth: 1.5,
    borderColor: Colors.Line,
    borderRadius: 8,
    padding: 18,
    gap: 8,
  },
  buildingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buildingLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  potential: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.Muted,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  buildingAmount: { fontSize: 34, fontWeight: '900', color: Colors.Muted },
  pitch: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: Colors.Ink },
  ledger: { gap: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.Line },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    backgroundColor: Colors.Chalk,
  },
  ledgerLabel: { fontSize: 15, color: Colors.Ink },
  ledgerStrong: { fontWeight: '700' },
  ledgerAmount: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  ledgerMuted: { color: Colors.Muted },
  payableNote: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  disclaimer: { fontSize: 12, lineHeight: 18, color: Colors.Faint, textAlign: 'center' },
  link: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.Ink, marginTop: 8 },
});
