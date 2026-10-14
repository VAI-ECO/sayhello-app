/**
 * YOUR POSTS — a Hello Hangout's Discounts and Hollas (§17.9 "live in the
 * Hangout's admin and can be edited and reposted. Nothing auto-renews").
 * ⚠️ No delivered frame for this list: the D 1440 dashboard rail names "Hollas"
 * and "Discounts" but their panels are not drawn. Recorded as undelivered.
 *
 * GET /api/feed/hello-hangouts/:id/manage (owner-checked on the server).
 * Edit keeps its slot; Repost is a new post and uses a slot; Take down never
 * gives the slot back (§17.11); a reported post is kept for review.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { formatCents } from '../../src/lib/money-format';
import { listOwnerHootzas, putOnFeed, type OwnerHootza } from '../../src/api/hangout-business';
import { Colors } from '../../src/theme/tokens';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { deleteFeedPost, getManagedPosts, type ManagedPost } from '../../src/api/feed';

function shortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ManagePostsScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hootzas, setHootzas] = useState<OwnerHootza[]>([]);
  const [feedPlacement, setFeedPlacement] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (!helloHangoutId) { setState('error'); return; }
    if (asRefresh) setRefreshing(true);
    const res = await getManagedPosts(helloHangoutId);
    setRefreshing(false);
    if (res.error) {
      if (res.error.status === 403 || res.error.status === 404) { router.back(); return; }
      setState('error');
      return;
    }
    setPosts(res.data?.posts ?? []);
    const hz = await listOwnerHootzas(helloHangoutId);
    setHootzas(hz.data?.hootzas ?? []);
    setFeedPlacement(Boolean(hz.data?.feedPlacement));
    setState('ready');
  }, [helloHangoutId, router]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function takeDown(id: string) {
    setBusy(true);
    setMessage(null);
    const res = await deleteFeedPost(id);
    setBusy(false);
    setConfirm(null);
    if (res.error) {
      setMessage(res.error.code === 'reported_post_retained' ? t('hangout.posts.reportedKept') : res.error.message);
      return;
    }
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  // §17.20: a Hootza on the feed draws the same slot as a post; off the feed it is free (§17.21).
  async function placeHootza(hootzaId: string) {
    if (!helloHangoutId) return;
    setBusy(true);
    setMessage(null);
    const res = await putOnFeed(helloHangoutId, hootzaId);
    setBusy(false);
    if (res.error) {
      const body = res.error.body as { amountCents?: number } | undefined;
      setMessage(res.error.code === 'payment_required' ? t('hangoutBiz.feed.paymentRequired', { amount: formatCents(body?.amountCents ?? 0) }) : res.error.message);
      return;
    }
    void load();
  }

  const stateLabel = (p: ManagedPost) =>
    p.state === 'on_feed' ? t('hangout.posts.onFeed')
      : p.state === 'scheduled' ? t('hangout.posts.scheduled', { date: shortDate(p.dealStartDate) })
        : p.state === 'page_only' ? t('hangout.posts.pageOnly')
          : p.state === 'ended' ? t('hangout.posts.ended')
            : t('hangout.posts.held');

  return (
    <View style={styles.container}>
      <StatusBarSpacer height={44} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangout.posts.title')}</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(hangout)/create-post', params: { helloHangoutId } })} accessibilityRole="button" testID="posts-new">
          <Text style={styles.link}>{t('hangout.dashboard.postSomething')}</Text>
        </TouchableOpacity>
      </View>
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' ? (
        <TouchableOpacity style={styles.pad} onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
          <Text accessibilityRole="alert" style={styles.muted}>{t('hangout.dashboard.loadFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      ) : null}
      {state === 'ready' ? (
        <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}>
          {message ? <Text accessibilityRole="alert" style={styles.banner}>{message}</Text> : null}
          {posts.length === 0 ? <Text style={styles.muted} testID="posts-empty">{t('hangout.posts.empty')}</Text> : null}
          {posts.map((p) => (
            <View key={p.id} style={[styles.card, p.postType === 'holla' && styles.cardHolla]} testID={`post-${p.id}`}>
              <View style={styles.cardTop}>
                <Text style={[styles.kind, p.postType === 'holla' && styles.kindHolla]}>{t(p.postType === 'holla' ? 'hangout.listing.holla' : 'hangout.listing.discount')}</Text>
                <Text style={styles.state} testID={`post-state-${p.id}`}>{stateLabel(p)}</Text>
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
              {p.postType === 'special' && p.dealEndDate ? <Text style={styles.muted}>{t('hangout.posts.ends', { date: shortDate(p.dealEndDate) })}</Text> : null}
              {confirm === p.id ? (
                <View style={styles.confirm}>
                  <Text style={styles.muted}>{t('hangout.posts.takeDownConfirm')}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.action} onPress={() => void takeDown(p.id)} disabled={busy} accessibilityRole="button" testID={`post-takedown-yes-${p.id}`}>
                      <Text style={styles.actionText}>{t('hangout.posts.takeDownYes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.action} onPress={() => setConfirm(null)} accessibilityRole="button">
                      <Text style={styles.actionText}>{t('hangout.posts.keep')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.actions}>
                  {p.state !== 'ended' && p.state !== 'held' ? (
                    <TouchableOpacity style={styles.action} onPress={() => router.push({ pathname: '/(hangout)/create-post', params: { helloHangoutId, postId: p.id } })} accessibilityRole="button" testID={`post-edit-${p.id}`}>
                      <Text style={styles.actionText}>{t('hangout.posts.edit')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.action} onPress={() => router.push({ pathname: '/(hangout)/create-post', params: { helloHangoutId, repostOf: p.id } })} accessibilityRole="button" testID={`post-repost-${p.id}`}>
                    <Text style={styles.actionText}>{t('hangout.posts.repost')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action} onPress={() => setConfirm(p.id)} accessibilityRole="button" testID={`post-takedown-${p.id}`}>
                    <Text style={styles.actionText}>{t('hangout.posts.takeDown')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {hootzas.length > 0 ? (
            <View style={{ gap: 8 }} testID="posts-hootzas">
              <Text style={styles.muted}>{t('hangoutBiz.feed.costsSlot')}</Text>
              {hootzas.map((h) => (
                <View key={h.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{h.title}</Text>
                  {h.onFeed ? <Text style={styles.state}>{t('hangoutBiz.feed.done')}</Text> : feedPlacement ? (
                    <TouchableOpacity style={styles.action} onPress={() => void placeHootza(h.id)} disabled={busy} accessibilityRole="button" testID={`hootza-feed-${h.id}`}>
                      <Text style={styles.actionText}>{t('hangoutBiz.feed.put')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12 },
  back: { fontSize: 24, color: Colors.Ink },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: Colors.Ink },
  link: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  pad: { padding: 24 },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, maxWidth: 900, width: '100%', alignSelf: 'center' },
  muted: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  banner: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 12, padding: 12, overflow: 'hidden' },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 14, gap: 6 },
  cardHolla: { borderColor: Colors.Plum },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  kind: { fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '700', color: Colors.Faint },
  kindHolla: { color: Colors.Plum },
  state: { fontSize: 12, fontWeight: '700', color: Colors.Muted },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  confirm: { gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  action: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 13 },
  actionText: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
});
