/**
 * A5 PAYOUTS
 * GET /ambassador/payouts/balance · history · POST request
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  getPayoutBalance,
  getPayoutHistory,
  requestPayout,
  type PayoutBalance,
  type PayoutRequest,
} from '../../src/api/ambassador';
import { formatCents } from '../../src/lib/money-format';

export default function PayoutsScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [history, setHistory] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [balRes, histRes] = await Promise.all([getPayoutBalance(), getPayoutHistory()]);
    setLoading(false);
    if (balRes.error) {
      setError(balRes.error.message);
      return;
    }
    setBalance(balRes.data ?? null);
    setHistory(histRes.data?.payouts ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function withdraw() {
    if (!balance || balance.available < balance.minimumWithdrawal) return;
    setWithdrawing(true);
    const res = await requestPayout(balance.available);
    setWithdrawing(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    load();
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator testID="payouts-loading" />
      </ScreenContainer>
    );
  }

  if (error && !balance) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="payouts-error">
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  const minimum = balance ? formatCents(balance.minimumWithdrawal) : t('ambassador.common.notAvailable');
  const available = balance ? balance.available : 0;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
          <Text style={styles.title}>{t('ambassador.payouts.title')}</Text>
        </TouchableOpacity>

        <Text style={styles.readyLabel}>{t('ambassador.payouts.ready')}</Text>
        <Text style={styles.readyAmount} testID="payouts-available">
          {formatCents(available)}
        </Text>

        <View style={styles.howBox}>
          <Text style={styles.howTitle}>{t('ambassador.payouts.howTitle')}</Text>
          <Text style={styles.howBody}>
            {t('ambassador.payouts.howBody', { minimum })}
          </Text>
        </View>

        <Text style={styles.section}>{t('ambassador.payouts.recent')}</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory} testID="payouts-history-empty">
            {t('ambassador.payouts.emptyHistory')}
          </Text>
        ) : (
          <FlatList
            data={history}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <Text style={styles.historyTitle}>
                  {formatCents(item.amountCents)} · {item.status}
                </Text>
              </View>
            )}
          />
        )}

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <Button
          title={t('ambassador.payouts.withdraw', { amount: formatCents(available) })}
          onPress={withdraw}
          loading={withdrawing}
          disabled={!balance || available < balance.minimumWithdrawal}
          testID="payouts-withdraw"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingHorizontal: 22, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back: { paddingVertical: 12, gap: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  readyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  readyAmount: { fontSize: 52, fontWeight: '900', color: Colors.Ink, letterSpacing: -2 },
  howBox: { backgroundColor: Colors.Bone, borderRadius: 8, padding: 14, gap: 6 },
  howTitle: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  howBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  section: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Muted,
    marginTop: 8,
  },
  emptyHistory: { fontSize: 15, color: Colors.Muted, paddingVertical: 12 },
  historyRow: { paddingVertical: 11, borderBottomWidth: 1, borderColor: Colors.Hairline },
  historyTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  inlineError: { fontSize: 15, color: Colors.Ink },
});
