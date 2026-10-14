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
import { StatusBarSpacer } from '../../../src/components/StatusBarSpacer';
import { getDirectoryPage, type HangoutPage } from '../../../src/api/directory';
import { getVenuePresenceCount } from '../../../src/api/venue-presence';
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
  // RULES §9.2: the venue shows a count in the past tense over the presence window. A number only; nothing is shown at zero or when
  // the server cannot say (never an empty-state scolding, never a roster, §9.6).
  const [scannedHere, setScannedHere] = useState<number | null>(null);

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
    if (res.data?.hangout && !res.data.hangout.isOwner) {
      let count: number | null = null;
      try {
        const counted = await getVenuePresenceCount(id);
        count = counted.error ? null : counted.data?.count ?? null;
      } catch {
        count = null; // a count that cannot be read is simply not shown
      }
      if (mine === gen.current) setScannedHere(count);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={styles.container}>
      <StatusBarSpacer height={44} />
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
          {/* RULES §9.1: scanning the Hangout's QR puts the member in this venue's pool. The scan screen reads the code itself. */}
          {!page.isOwner ? (
            <TouchableOpacity
              style={styles.here}
              onPress={() => router.push('/(hangout)/directory/here')}
              accessibilityRole="button"
              testID="page-im-here"
            >
              <Text style={styles.hereText}>{t('l03.presence.enter')}</Text>
            </TouchableOpacity>
          ) : null}
          {!page.isOwner && scannedHere !== null && scannedHere > 0 ? (
            <Text style={styles.scannedHere} testID="page-scanned-here">{t('l03.presence.count', { count: scannedHere })}</Text>
          ) : null}
          <HangoutPageView
            // A Holla / Discount pin opens the page with that post first (stage 04).
            page={postId ? { ...page, posts: [...page.posts].sort((a, b) => Number(b.id === postId) - Number(a.id === postId)) } : page}
            onOpenWall={() => router.push({ pathname: '/(hangout)/directory/wall', params: { id: page.id } })}
            onClaimPost={page.isOwner ? undefined : (post) => router.push({ pathname: '/(hangout)/directory/claim', params: { postId: post.id, title: post.title } })}
            onReportPost={(post) => router.push({ pathname: '/report', params: { type: 'hangout_post', id: post.id, name: post.title, context: page.name } })}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  back: { fontSize: 24, color: Colors.Ink },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
  here: { marginVertical: 8, minHeight: 44, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.Ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  scannedHere: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginBottom: 8 },
  hereText: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, maxWidth: 1280, width: '100%', alignSelf: 'center' },
});
