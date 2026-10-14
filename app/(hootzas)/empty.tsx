/**
 * NOTHING ON — empty Hootzas for today
 * GET /feed?view=this_week
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors, FixedColors } from '../../src/theme/tokens';
import { getFeed, type FeedItem } from '../../src/api/feed';

type ViewState = 'loading' | 'error' | 'data';

export default function HootzasEmptyScreen() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [weekCount, setWeekCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setViewState('loading');
    setError(null);
    const res = await getFeed({ view: 'this_week' });
    if (res.error) {
      setViewState('error');
      setError(res.error.message);
      return;
    }
    const hootzas = (res.data?.items ?? []).filter(
      (item: FeedItem) => item.type === 'hootza'
    );
    setWeekCount(hootzas.length);
    setViewState('data');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (viewState === 'loading') {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="empty-loading" />
      </ScreenContainer>
    );
  }

  if (viewState === 'error') {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="empty-error">
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.content} testID="empty-data">
        <Text style={styles.title}>
          {t('hootzas.empty.title', { area: t('hootzas.empty.areaDefault') })}
        </Text>
        <Text style={styles.body}>{t('hootzas.empty.body', { count: weekCount })}</Text>
        <Button
          title={t('hootzas.empty.seeWeek')}
          onPress={() => router.back()}
          testID="empty-see-week"
        />
        <Button
          title={t('hootzas.empty.startOne')}
          onPress={() => router.push('/(hootzas)/create')}
          variant="secondary"
          testID="empty-start-one"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  content: { flex: 1, justifyContent: 'center', gap: 16, paddingVertical: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24, color: Colors.Muted },
});
