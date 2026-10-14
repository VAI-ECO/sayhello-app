/**
 * OUT OF FREE POSTS
 * GET /api/feed/hangouts/:id/posts
 * POST /api/feed/posts returns 402 when slots exhausted
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getHangoutPosts, type HangoutPost } from '../../../src/api/feed';

export default function OutOfPostsScreen() {
  const router = useRouter();
  const { hangoutId } = useLocalSearchParams<{ hangoutId?: string }>();
  const [posts, setPosts] = useState<HangoutPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hangoutId) return;
    setLoading(true);
    setError(null);
    const res = await getHangoutPosts(hangoutId);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setPosts(res.data?.posts ?? []);
  }, [hangoutId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!hangoutId) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="out-of-posts-missing">
          <Text>{t('hootzas.discount.missingHangout')}</Text>
          <Button title={t('common.done')} onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="out-of-posts-loading" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="out-of-posts-error">
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()} style={styles.header}>
        <Text style={styles.back}>{t('hootzas.common.back')}</Text>
        <Text style={styles.title}>{t('hootzas.discount.outOfPostsTitle')}</Text>
      </TouchableOpacity>

      <Text style={styles.body}>{t('hootzas.discount.outOfPostsBody')}</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty} testID="out-of-posts-empty">
            {t('hootzas.common.empty')}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.postRow}>
            <Text style={styles.postTitle}>{item.title}</Text>
            {item.dealEndDate && (
              <Text style={styles.postMeta}>
                {t('hootzas.discount.feedTill', {
                  feed: new Date(item.postExpiryDate ?? item.createdAt).toLocaleDateString(),
                  deal: new Date(item.dealEndDate).toLocaleDateString(),
                })}
              </Text>
            )}
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.paymentNote}>{t('hootzas.discount.paymentNotReady')}</Text>
        <Button
          title={t('hootzas.discount.postAnother')}
          onPress={() => {}}
          variant="secondary"
          disabled
          testID="out-of-posts-paid"
        />
        <Text style={styles.paymentHint}>{t('hootzas.discount.postAnotherHint')}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  header: { paddingHorizontal: 22, paddingVertical: 12, gap: 4 },
  back: { fontSize: 17, color: Colors.Ink },
  title: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  body: {
    paddingHorizontal: 22,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.Muted,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 22, gap: 12, flexGrow: 1 },
  empty: { textAlign: 'center', color: Colors.Muted, marginTop: 24 },
  postRow: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  postTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  postMeta: { fontSize: 13, color: Colors.Faint },
  footer: { padding: 22, gap: 8, borderTopWidth: 1, borderColor: Colors.Hairline },
  paymentNote: { fontSize: 14, color: Colors.Muted, textAlign: 'center' },
  paymentHint: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
