/**
 * VISIT HISTORY
 * WIRE: GET /ambassador/visits. Stub UI. PIXEL is P11.
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  getAmbassadorVisits,
  type AmbassadorVisit,
} from '../../src/api/ambassador';

export default function VisitHistoryScreen() {
  const router = useRouter();
  const [visits, setVisits] = useState<AmbassadorVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const result = await getAmbassadorVisits();
    if (result.error) {
      setError(result.error.message);
      setVisits([]);
    } else {
      setVisits(result.data?.visits ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.visitHistory.title')}</Text>
        <Text style={styles.lead}>{t('ambassador.visitHistory.lead')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={Colors.Ink} />
        ) : visits.length === 0 ? (
          <View style={styles.empty} testID="visit-history-empty">
            <Text style={styles.unavailable}>{t('ambassador.visitHistory.unavailable')}</Text>
            <Button
              title={t('error.retry')}
              onPress={() => load()}
              variant="secondary"
              testID="visit-history-retry"
            />
          </View>
        ) : (
          <View style={styles.list} testID="visit-history-list">
            {visits.map((v) => (
              <View key={v.id} style={styles.row} testID={`visit-${v.id}`}>
                <Text style={styles.rowTitle}>{v.visited_at}</Text>
                <Text style={styles.rowMeta}>
                  {[v.visit_window != null ? `Window ${v.visit_window}` : null, v.qr_stand_serial]
                    .filter(Boolean)
                    .join(' · ') || 'Visit'}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  lead: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  empty: { gap: 12, paddingVertical: 24 },
  list: { gap: 10 },
  row: {
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  rowTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  rowMeta: { fontSize: 13, color: Colors.Muted },
  unavailable: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 14, color: Colors.SignalRed },
});
