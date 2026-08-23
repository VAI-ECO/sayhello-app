/**
 * CONNECTIONS — people you have said hello to
 *
 * WIRE: GET /hellos. Stub UI. PIXEL is P11.
 * §19.1 — at zero, empty invitation, never a failure state.
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
import { getHellos, type ConnectionHello } from '../../src/api/hellos';
import { t } from '../../src/i18n';

export default function HellosScreen() {
  const [hellos, setHellos] = useState<ConnectionHello[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const result = await getHellos();

    if (result.error) {
      setError(result.error.message);
      setHellos([]);
    } else {
      setHellos(result.data?.hellos ?? []);
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

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('tabs.hellos')}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={hellos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty} testID="connections-empty">
            <Text style={styles.emptyMark}>👋</Text>
            <Text style={styles.emptyBody}>
              Your connections show up here after you say hello.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row} testID={`connection-${item.id}`}>
            <Text style={styles.rowTitle}>
              {item.status === 'pending'
                ? 'Hello pending'
                : item.status === 'missed'
                  ? 'Hello — still open'
                  : item.hello_code
                    ? `Hello ${item.hello_code}`
                    : 'Hello'}
            </Text>
            <Text style={styles.rowMeta}>{String(item.status ?? '')}</Text>
          </View>
        )}
        contentContainerStyle={hellos.length === 0 ? styles.emptyList : styles.list}
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
  list: {
    paddingBottom: 40,
    gap: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 12,
  },
  emptyMark: {
    fontSize: 40,
    opacity: 0.4,
  },
  emptyBody: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  row: {
    borderWidth: 2,
    borderColor: Colors.Ink,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    backgroundColor: Colors.Chalk,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.Ink,
    letterSpacing: -0.4,
  },
  rowMeta: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.6,
    marginTop: 4,
  },
  error: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginBottom: 12,
  },
});
