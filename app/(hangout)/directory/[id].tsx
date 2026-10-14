/**
 * HELLO HANGOUT PAGE — CANON-RL-02-SN-09 (P 375 · T 834 · D 1440).
 * The business-owned destination (RULES §17.19): What's Happening items and the
 * map's Hello Hangout squares open it (§17.23, §17.24). GET /directory/hangouts/:id
 * — published details only; a lapsed, unpaid or unknown Hello Hangout reads as
 * unavailable (ROLE-2 §7: the page goes dark). Refreshes on focus, pull to refresh,
 * visible retry.
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { getDirectoryPage, type HangoutPage } from '../../../src/api/directory';
import { HangoutPageView } from '../../../src/components/hangout/HangoutPageView';
import { PhotoStrip } from '../../../src/components/hangout/PhotoStrip';
import { SaveVenueButton } from '../../../src/components/hangout/SaveVenueButton';

export default function HangoutListingScreen() {
  const router = useRouter();
  const { id, postId } = useLocalSearchParams<{ id?: string; postId?: string }>();
  const [page, setPage] = useState<HangoutPage | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'gone' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const gen = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    if (!id) { setState('gone'); return; }
    const mine = ++gen.current;
    if (asRefresh) setRefreshing(true);
    const res = await getDirectoryPage(id);
    if (mine !== gen.current) return;
    setRefreshing(false);
    if (res.error) {
      setState(res.error.status === 404 ? 'gone' : 'error');
      return;
    }
    setPage(res.data?.hangout ?? null);
    setState(res.data?.hangout ? 'ready' : 'gone');
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
      </View>
      {state === 'loading' && !page ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.Ink} /></View>
      ) : state === 'gone' ? (
        <View style={styles.centered}>
          <Text style={styles.muted} testID="listing-unavailable">{t('hangout.listing.unavailable')}</Text>
        </View>
      ) : state === 'error' && !page ? (
        <View style={styles.centered}>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangout.listing.loadFailed')} {t('hangout.dashboard.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : page ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        >
          <PhotoStrip photos={page.photos ?? []} />
          {!page.isOwner ? <SaveVenueButton id={page.id} initial={Boolean(page.saved)} /> : null}
          <HangoutPageView
            // A Holla / Discount pin opens the page with that post first (stage 04).
            page={postId ? { ...page, posts: [...page.posts].sort((a, b) => Number(b.id === postId) - Number(a.id === postId)) } : page}
            onOpenWall={() => router.push({ pathname: '/(hangout)/directory/wall', params: { id: page.id } })}
            onReportPost={(post) => router.push({ pathname: '/report', params: { type: 'hangout_post', id: post.id, name: post.title, context: page.name } })}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  statusBar: { height: 44 },
  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  back: { fontSize: 24, color: Colors.Ink },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, maxWidth: 1280, width: '100%', alignSelf: 'center' },
});
