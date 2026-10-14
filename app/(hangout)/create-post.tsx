/**
 * H10 CREATE A POST — CANON-RL-02-SN-02 (Operator Surfaces P 375; T/D in batch-03).
 * Post type: Discount · Holla · Hootza. A Discount has TWO CLOCKS (§17.6): the
 * deal's own start and end, entered by hand and both required (§17.7), and the
 * post's shelf life read from settings (read-only). A Holla carries only the shelf
 * life. Hootza opens the existing Hootza composer (a Hootza posted to the feed also
 * uses a slot, §17.20 — that accounting is not wired, recorded).
 *
 * POST /api/feed/posts (new) · PATCH /api/feed/posts/:id (edit keeps its slot,
 * §17.11) — ownership, active status, slots and the dates are all enforced on the
 * server. Out of free posts: the extra-post price comes from settings; paying for
 * it is not available (no payment in this slice), so the screen says so.
 * Dates are typed YYYY-MM-DD: no date-picker dependency is installed.
 *
 * ⚠️ The Holla composer is undrawn (batch-03 coverage: "Holla composer as distinct
 * from the Discount composer"); it reuses this frame's type switch. A Holla link to
 * a Special (§17.12) has no field and is not built.
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { createFeedPost, getManagedPosts, updateFeedPost, type HangoutPostSlots } from '../../src/api/feed';
import { formatCents } from '../../src/lib/money-format';
import { dayToIso, isoToDay } from '../../src/lib/post-dates';

type PostType = 'special' | 'holla';

export default function HangoutCreatePostScreen() {
  const router = useRouter();
  const { helloHangoutId, postId, repostOf } = useLocalSearchParams<{ helloHangoutId?: string; postId?: string; repostOf?: string }>();
  const editing = Boolean(postId);
  const [postType, setPostType] = useState<PostType>('special');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [slots, setSlots] = useState<HangoutPostSlots | null>(null);
  // §17.12: the Specials on this page a Holla may link to.
  const [specials, setSpecials] = useState<Array<{ id: string; title: string }>>([]);
  const [linkedSpecialId, setLinkedSpecialId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setLoading(false); return; }
    const res = await getManagedPosts(helloHangoutId);
    setLoading(false);
    if (res.error) {
      if (res.error.status === 403 || res.error.status === 404) { router.back(); return; }
      setError(res.error.message);
      return;
    }
    setSlots(res.data?.slots ?? null);
    setSpecials((res.data?.posts ?? []).filter((p) => p.postType === 'special').map((p) => ({ id: p.id, title: p.title })));
    const source = res.data?.posts.find((p) => p.id === (postId ?? repostOf));
    if (source) {
      setPostType(source.postType);
      setTitle(source.title);
      setDescription(source.description ?? '');
      // A repost is a new post with new dates; an edit keeps its own.
      if (editing) {
        setStart(isoToDay(source.dealStartDate));
        setEnd(isoToDay(source.dealEndDate));
      }
    }
  }, [helloHangoutId, postId, repostOf, editing, router]);

  useEffect(() => { void load(); }, [load]);

  if (!helloHangoutId) {
    return (
      <View style={[styles.container, styles.centered]} testID="discount-missing-hangout">
        <Text style={styles.muted}>{t('hootzas.discount.missingHangout')}</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button"><Text style={styles.cancel}>{t('hangout.createPost.cancel')}</Text></TouchableOpacity>
      </View>
    );
  }

  const startIso = postType === 'special' ? dayToIso(start, 'start') : null;
  const endIso = postType === 'special' ? dayToIso(end, 'end') : null;
  const datesOk = postType === 'holla' || (startIso !== null && endIso !== null && endIso > startIso);
  const canPost = Boolean(title.trim()) && datesOk && !posting;

  async function submit() {
    if (!canPost || !helloHangoutId) return;
    setPosting(true);
    setError(null);
    const res = editing
      ? await updateFeedPost(postId!, {
          title: title.trim(),
          description: description.trim() || null,
          ...(postType === 'special' ? { dealStartDate: startIso!, dealEndDate: endIso! } : {}),
        })
      : await createFeedPost({
          helloHangoutId,
          postType,
          title: title.trim(),
          description: description.trim() || undefined,
          ...(postType === 'special' ? { dealStartDate: startIso!, dealEndDate: endIso!, discountType: 'description_only' as const } : {}),
          isAllDay: true,
          ...(postType === 'holla' && linkedSpecialId ? { linkedSpecialId } : {}),
        });
    setPosting(false);
    if (res.error) {
      if (res.error.status === 402) {
        // The delivered "Discount — out of free posts" screen (SN-03).
        setError(t('hangout.createPost.extraUnavailable', { amount: formatCents(slots?.additionalPostCents ?? 0) }));
        router.push({ pathname: '/(hootzas)/discount/out-of-posts', params: { hangoutId: helloHangoutId } });
        return;
      }
      if (res.error.code === 'not_active') { setError(t('hangout.createPost.notActive')); return; }
      setError(res.error.message || t('hangout.createPost.failed'));
      return;
    }
    router.back();
  }

  const freeLine = slots
    ? slots.remaining === 0
      ? t('hangout.createPost.noneLeft')
      : slots.remaining === 1
        ? t('hangout.createPost.freeLeftOne')
        : t('hangout.createPost.freeLeft', { n: slots.remaining })
    : '';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.statusBar} />
      <View style={styles.top}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" testID="compose-cancel"><Text style={styles.cancel}>{t('hangout.createPost.cancel')}</Text></TouchableOpacity>
        {!editing ? <Text style={styles.free} testID="compose-free">{freeLine}</Text> : null}
      </View>
      {loading ? <ActivityIndicator color={Colors.Ink} /> : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!editing ? (
            <View style={styles.types}>
              {(['special', 'holla'] as const).map((type) => (
                <TouchableOpacity key={type} style={[styles.type, postType === type && styles.typeOn]} onPress={() => setPostType(type)} accessibilityRole="button" accessibilityState={{ selected: postType === type }} testID={`compose-type-${type}`}>
                  <Text style={[styles.typeText, postType === type && styles.typeTextOn]}>{t(type === 'special' ? 'hangout.createPost.discount' : 'hangout.createPost.holla')}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.type} onPress={() => router.push('/(hootzas)/create')} accessibilityRole="button" testID="compose-type-hootza">
                <Text style={styles.typeText}>{t('hangout.createPost.hootza')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.offer}>
            <Text style={styles.kicker}>{t(postType === 'special' ? 'hangout.createPost.theOffer' : 'hangout.createPost.theNews')}</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.offerInput} maxLength={200} multiline accessibilityLabel={t(postType === 'special' ? 'hangout.createPost.theOffer' : 'hangout.createPost.theNews')} testID="compose-title" />
          </View>
          <TextInput value={description} onChangeText={setDescription} placeholder={t('hangout.createPost.details')} placeholderTextColor={Colors.Faint} style={styles.details} multiline maxLength={2000} accessibilityLabel={t('hangout.createPost.details')} testID="compose-description" />

          {postType === 'holla' && !editing && specials.length > 0 ? (
            <View style={styles.types} testID="compose-link-special">
              <Text style={styles.kicker}>{t('hangoutBiz.compose.linkSpecial')}</Text>
              {[{ id: '', title: t('hangoutBiz.compose.noLink') }, ...specials].map((sp) => (
                <TouchableOpacity key={sp.id || 'none'} style={[styles.type, (linkedSpecialId ?? '') === sp.id && styles.typeOn]} onPress={() => setLinkedSpecialId(sp.id || null)} accessibilityRole="button" accessibilityState={{ selected: (linkedSpecialId ?? '') === sp.id }}>
                  <Text style={[styles.typeText, (linkedSpecialId ?? '') === sp.id && styles.typeTextOn]} numberOfLines={1}>{sp.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View style={styles.clocks}>
            <Text style={styles.clocksHead}>{t('hangout.createPost.twoClocks')}</Text>
            {postType === 'special' ? (
              <View style={styles.clockRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.clockLabel}>{t('hangout.createPost.dealRuns')}</Text>
                  <Text style={styles.clockNote}>{t('hangout.createPost.dealRunsNote')}</Text>
                  <View style={styles.dates}>
                    <TextInput value={start} onChangeText={setStart} placeholder={t('hangout.createPost.startsOn')} placeholderTextColor={Colors.Faint} style={styles.date} maxLength={10} accessibilityLabel={t('hangout.createPost.startsOn')} testID="compose-start" />
                    <TextInput value={end} onChangeText={setEnd} placeholder={t('hangout.createPost.endsOn')} placeholderTextColor={Colors.Faint} style={styles.date} maxLength={10} accessibilityLabel={t('hangout.createPost.endsOn')} testID="compose-end" />
                  </View>
                  {(start && !startIso) || (end && !endIso) ? <Text style={styles.error}>{t('hangout.createPost.badDate')}</Text> : null}
                </View>
              </View>
            ) : null}
            <View style={styles.clockRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.clockLabel}>{t('hangout.createPost.upFor')}</Text>
                <Text style={styles.clockNote}>{t('hangout.createPost.upForNote')}</Text>
              </View>
              {slots?.shelfDays ? <Text style={styles.clockValue} testID="compose-shelf">{t('hangout.createPost.shelfDays', { n: slots.shelfDays })}</Text> : null}
            </View>
          </View>
          <Text style={styles.slotNote}>{t('hangout.createPost.slotNote')}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error} testID="compose-error">{error}</Text> : null}
          <TouchableOpacity style={[styles.post, !canPost && styles.disabled]} onPress={() => void submit()} disabled={!canPost} accessibilityRole="button" accessibilityState={{ disabled: !canPost, busy: posting }} testID="compose-submit">
            <Text style={styles.postText}>{t(editing ? 'hangout.createPost.saveEdit' : 'hangout.createPost.postIt')}</Text>
          </TouchableOpacity>
          {!editing ? <Text style={styles.footnote}>{t('hangout.createPost.extraPriced')}</Text> : null}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  statusBar: { height: 44 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 11 },
  cancel: { fontSize: 15, fontWeight: '600', color: Colors.Muted },
  free: { fontSize: 13, fontWeight: '700', color: Colors.Ink },
  body: { paddingHorizontal: 20, paddingBottom: 34, gap: 12, maxWidth: 720, width: '100%', alignSelf: 'center' },
  types: { flexDirection: 'row', gap: 7 },
  type: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14 },
  typeOn: { backgroundColor: Colors.Ink, borderColor: Colors.Ink },
  typeText: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  typeTextOn: { color: Colors.Chalk },
  offer: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 15, gap: 5 },
  kicker: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  offerInput: { fontSize: 17, fontWeight: '600', color: Colors.Ink, lineHeight: 23, minHeight: 24 },
  details: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 13, fontSize: 15, color: Colors.Ink, minHeight: 60, textAlignVertical: 'top' },
  clocks: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, overflow: 'hidden' },
  clocksHead: { paddingVertical: 12, paddingHorizontal: 15, backgroundColor: Colors.Bone, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  clockRow: { paddingVertical: 13, paddingHorizontal: 15, borderTopWidth: 1, borderTopColor: Colors.Hairline, flexDirection: 'row', alignItems: 'center', gap: 12 },
  clockLabel: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  clockNote: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  clockValue: { fontSize: 15, fontWeight: '700', color: Colors.Muted },
  dates: { flexDirection: 'row', gap: 8, marginTop: 8 },
  date: { flex: 1, height: 40, borderWidth: 1, borderColor: Colors.Line, borderRadius: 9, paddingHorizontal: 10, fontSize: 14, color: Colors.Ink },
  slotNote: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#D7D2CB', borderRadius: 14, padding: 13, fontSize: 13, lineHeight: 19, color: Colors.Muted },
  post: { backgroundColor: Colors.Ink, borderRadius: 26, height: 54, alignItems: 'center', justifyContent: 'center' },
  postText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  footnote: { fontSize: 13, lineHeight: 18, color: Colors.Muted, textAlign: 'center' },
  error: { fontSize: 14, color: Colors.SignalRed },
  muted: { fontSize: 15, color: Colors.Muted, textAlign: 'center' },
});
