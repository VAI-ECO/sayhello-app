/**
 * YOUR LISTING — PREVIEW — "Directory listing — operator view"
 * (CANON-RL-02-SN-01-P, Desktop Surfaces at P 375 frame 8l: "Your listing ·
 * Preview · this is the public page", with Edit). The body is the public page
 * component itself (HangoutPageView), built from the owner's DRAFT by
 * GET /hello-hangouts/:id/directory/preview.
 *
 * Publish (§17.19 "fills it out and publishes from there"):
 * POST /hello-hangouts/:id/directory/publish — refused unless the Hello Hangout
 * is active (paid) and the draft has a name, address and pin. A local state
 * change only; nothing is sent anywhere else.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { previewDirectory, publishDirectory, type HangoutPage } from '../../src/api/directory';
import { HangoutPageView } from '../../src/components/hangout/HangoutPageView';

export default function PreviewScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [page, setPage] = useState<HangoutPage | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const res = await previewDirectory(helloHangoutId);
    if (res.error) {
      if (res.error.status === 403 || res.error.status === 404) { router.back(); return; }
      setState('error');
      return;
    }
    setPage(res.data?.hangout ?? null);
    setState('ready');
  }, [helloHangoutId, router]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function publish() {
    if (!helloHangoutId || publishing) return;
    setPublishing(true);
    setMessage(null);
    const res = await publishDirectory(helloHangoutId);
    setPublishing(false);
    if (res.error) {
      const text = res.error.code === 'not_active' ? t('hangout.listing.publishNotActive')
        : res.error.code === 'incomplete' ? t('hangout.listing.publishIncomplete')
          : res.error.status === 503 ? t('hangout.edit.unavailable')
            : t('hangout.listing.publishFailed');
      setMessage({ kind: 'error', text });
      return;
    }
    setMessage({ kind: 'ok', text: t('hangout.listing.published') });
    void load();
  }

  const canPublish = page?.directoryAvailable && page?.status === 'active';

  return (
    <View style={styles.container}>
      <StatusBarSpacer height={44} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} style={styles.iconButton}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('hangout.listing.previewTitle')}</Text>
          <Text style={styles.sub}>{t('hangout.listing.previewSub')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(hangout)/edit', params: { helloHangoutId } })} accessibilityRole="button" style={styles.iconButton} testID="preview-edit">
          <Text style={styles.edit}>{t('hangout.listing.edit')}</Text>
        </TouchableOpacity>
      </View>
      {state === 'loading' && !page ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' && !page ? (
        <TouchableOpacity style={styles.pad} onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
          <Text accessibilityRole="alert" style={styles.sub}>{t('hangout.listing.loadFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      ) : null}
      {page ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {!page.directoryAvailable ? <Text style={styles.banner} testID="preview-unavailable">{t('hangout.edit.unavailable')}</Text> : null}
          {page.directoryAvailable && message?.text !== t('hangout.listing.published') ? <Text style={styles.banner}>{t('hangout.listing.draftNotice')}</Text> : null}
          {page.status && page.status !== 'active' ? <Text style={styles.banner} testID="preview-not-active">{t('hangout.listing.publishNotActive')}</Text> : null}
          <HangoutPageView page={page} />
          {message ? <Text accessibilityRole={message.kind === 'error' ? 'alert' : undefined} style={message.kind === 'error' ? styles.error : styles.ok} testID="preview-message">{message.text}</Text> : null}
          <TouchableOpacity
            style={[styles.publish, (!canPublish || publishing) && styles.disabled]}
            onPress={() => void publish()}
            disabled={!canPublish || publishing}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPublish || publishing, busy: publishing }}
            testID="preview-publish"
          >
            <Text style={styles.publishText}>{t(publishing ? 'hangout.listing.publishing' : 'hangout.listing.publish')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.Hairline },
  iconButton: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  back: { fontSize: 24, color: Colors.Ink },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 12, color: Colors.Muted },
  edit: { fontSize: 15, fontWeight: '700', color: Colors.HelloBlue },
  pad: { padding: 24 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  banner: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 12, padding: 12, overflow: 'hidden' },
  publish: { minHeight: 52, borderRadius: 14, backgroundColor: Colors.Ink, alignItems: 'center', justifyContent: 'center' },
  publishText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  error: { fontSize: 14, color: Colors.SignalRed },
  ok: { fontSize: 14, color: Colors.DeepFern },
});
