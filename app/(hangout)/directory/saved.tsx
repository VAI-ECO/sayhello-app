/**
 * SAVED HELLO HANGOUTS — the member's private list (S3 stage 06; API 080).
 * GET /saved-hangouts. Only the member sees it; a business is never told who saved it (ROLE-2 §4).
 * A place that is not live is hidden by the server until it is back.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer } from '../../../src/components/StatusBarSpacer';
import { listSaved, unsaveVenue, type SavedVenue } from '../../../src/api/hangout-business';
import { FoundingBadge } from '../../../src/components/hangout/FoundingBadge';

export default function SavedHangoutsScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<SavedVenue[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unavailable'>('loading');

  const load = useCallback(async () => {
    const res = await listSaved();
    if (res.error) { setState(res.error.status === 503 ? 'unavailable' : 'error'); return; }
    setRows(res.data?.saved ?? []);
    setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id));
    const res = await unsaveVenue(id);
    if (res.error) void load();
  }

  return (
    <View style={styles.container}>
      <StatusBarSpacer height={44} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.back}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangoutBiz.saved.headline')}</Text>
        <Text style={styles.muted}>{t('hangoutBiz.saved.private')}</Text>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'unavailable' ? <Text style={styles.muted}>{t('hangoutBiz.notSetUp')}</Text> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="saved-error">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangoutBiz.loadFailed')} {t('hangoutBiz.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && rows.length === 0 ? <Text style={styles.muted} testID="saved-empty">{t('hangoutBiz.saved.empty')}</Text> : null}
        {rows.map((r) => (
          <View key={r.id} style={styles.row} testID={`saved-${r.id}`}>
            <TouchableOpacity style={styles.rowMain} onPress={() => router.push({ pathname: '/(hangout)/directory/[id]', params: { id: r.id } })} accessibilityRole="button">
              <View style={styles.nameLine}>
                <Text style={styles.name}>{r.name}</Text>
                {r.founding ? <FoundingBadge size={14} /> : null}
              </View>
              <Text style={styles.muted}>{r.address}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void remove(r.id)} accessibilityRole="button" accessibilityLabel={t('hangoutBiz.saved.unsave')}>
              <Text style={styles.unsave}>{t('hangoutBiz.saved.unsave')}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Text style={styles.footnote}>{t('hangoutBiz.saved.lapsedHidden')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  scroll: { padding: 22, gap: 12 },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  muted: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  footnote: { fontSize: 12, color: Colors.Faint, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 14 },
  rowMain: { flex: 1, gap: 2 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  unsave: { fontSize: 13, fontWeight: '700', color: Colors.Muted },
});
