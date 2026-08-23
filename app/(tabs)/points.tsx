/**
 * POINTS TAB
 *
 * WIRE: GET /points/balance + ledger. Stub UI. PIXEL is P11.
 * Reset floor is 1, never zero — show that even when empty of activity.
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { Colors } from '../../src/theme';
import {
  getPointsBalance,
  getPointsLedger,
  type LedgerEntry,
} from '../../src/api/points';
import { t } from '../../src/i18n';

export default function PointsScreen() {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const [bal, ledger] = await Promise.all([getPointsBalance(), getPointsLedger()]);

    if (bal.error) {
      setError(bal.error.message);
      setBalance(null);
    } else {
      setBalance(bal.data?.balance ?? 1);
    }

    if (!ledger.error) {
      setEntries(ledger.data?.entries ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.Ink} />
        </View>
      </ScreenContainer>
    );
  }

  const displayBalance = balance === null ? 1 : Math.max(balance, 1);

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('tabs.prizes')}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.balanceCard} testID="points-balance">
        <Text style={styles.balanceLabel}>Drawing entries</Text>
        <Text style={styles.balanceValue}>{displayBalance}</Text>
        <Text style={styles.balanceHint}>Same number as your points. Never below 1.</Text>
      </View>

      <Text style={styles.section}>Recent</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        ListEmptyComponent={
          <Text style={styles.empty} testID="points-ledger-empty">
            Earn points when you say hello. They are your drawing entries.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row} testID={`ledger-${item.id}`}>
            <Text style={styles.rowTitle}>{item.description || item.entry_type || 'Points'}</Text>
            <Text style={styles.rowAmount}>
              {(item.points_amount ?? 0) > 0 ? '+' : ''}
              {item.points_amount ?? 0}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.7,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    borderWidth: 2,
    borderColor: Colors.Ink,
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.Chalk,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.7,
    letterSpacing: -0.2,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -1.2,
    marginVertical: 4,
  },
  balanceHint: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.6,
    letterSpacing: -0.2,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  list: {
    paddingBottom: 40,
  },
  empty: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Ink,
    opacity: 0.9,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    color: Colors.Ink,
    letterSpacing: -0.3,
    paddingRight: 12,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  error: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginBottom: 12,
  },
});
