/**
 * H9 BUSINESS DASHBOARD — WIRE list + status from GET /hello-hangouts
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
import { listMyHelloHangouts, type HelloHangout } from '../../src/api/hangouts';

export default function HangoutDashboardScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<HelloHangout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const result = await listMyHelloHangouts();
    if (result.error) {
      setError(result.error.message);
      setRows([]);
    } else {
      setRows(result.data?.helloHangouts ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const primary = rows[0];

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        <Text style={styles.header}>{t('hangout.common.helloHangout')}</Text>

        {loading ? (
          <ActivityIndicator color={Colors.Ink} />
        ) : primary ? (
          <View style={styles.hero} testID="dashboard-status">
            <Text style={styles.heroLabel}>{primary.name}</Text>
            <Text style={styles.heroValue}>{primary.status}</Text>
            <Text style={styles.meta}>
              ${(primary.price_cents / 100).toFixed(0)}/yr · {primary.tier}
            </Text>
          </View>
        ) : (
          <View style={styles.hero} testID="dashboard-unavailable">
            <Text style={styles.heroLabel}>{t('hangout.dashboard.onMap')}</Text>
            <Text style={styles.heroValue}>{t('ambassador.common.notAvailable')}</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!primary ? (
          <Text style={styles.unavailable}>{t('hangout.dashboard.unavailable')}</Text>
        ) : null}

        <Button
          title={t('hangout.dashboard.postSomething')}
          onPress={() =>
            router.push(
              primary
                ? {
                    pathname: '/(hootzas)/discount/compose',
                    params: { helloHangoutId: primary.id },
                  }
                : '/(hangout)/create-post'
            )
          }
          testID="dashboard-post-cta"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  header: { fontSize: 18, fontWeight: '900', color: Colors.Ink },
  hero: { backgroundColor: Colors.Ink, borderRadius: 8, padding: 17, gap: 4 },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  heroValue: { fontSize: 28, fontWeight: '900', color: Colors.Chalk },
  meta: { fontSize: 14, color: Colors.Faint, marginTop: 4 },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  error: { fontSize: 14, color: Colors.SignalRed },
});
