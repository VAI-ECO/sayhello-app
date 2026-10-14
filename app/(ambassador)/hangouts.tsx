/**
 * A2 MY HELLO HANGOUTS
 * WIRE: GET /ambassador/hangouts. Stub UI. PIXEL is P11.
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
  getAmbassadorHangouts,
  type AmbassadorHangout,
} from '../../src/api/ambassador';

export default function MyHelloHangoutsScreen() {
  const router = useRouter();
  const [hangouts, setHangouts] = useState<AmbassadorHangout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const result = await getAmbassadorHangouts();
    if (result.error) {
      setError(result.error.message);
      setHangouts([]);
    } else {
      setHangouts(result.data?.hangouts ?? []);
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
        <Text style={styles.title}>{t('ambassador.hangouts.title')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={Colors.Ink} />
        ) : hangouts.length === 0 ? (
          <View style={styles.empty} testID="hangouts-empty">
            <Text style={styles.unavailable}>{t('ambassador.hangouts.unavailable')}</Text>
            <Button
              title={t('ambassador.queue.accept')}
              onPress={() => router.push('/(ambassador)/queue-offer')}
              variant="secondary"
              testID="hangouts-queue-link"
            />
          </View>
        ) : (
          <View style={styles.list} testID="hangouts-list">
            {hangouts.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={styles.row}
                testID={`hangout-${h.id}`}
                onPress={() =>
                  router.push({
                    pathname: '/(ambassador)/visit-check-in',
                    params: {
                      helloHangoutId: h.id,
                      hangoutName: h.name ?? 'Hello Hangout',
                    },
                  })
                }
              >
                <Text style={styles.rowTitle}>{h.name ?? 'Hello Hangout'}</Text>
                <Text style={styles.rowMeta}>
                  {[h.status, h.address].filter(Boolean).join(' · ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink, letterSpacing: -0.5 },
  empty: { gap: 12, paddingVertical: 24 },
  list: { gap: 10 },
  row: {
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  rowTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  rowMeta: { fontSize: 14, color: Colors.Muted },
  unavailable: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 14, color: Colors.SignalRed },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
