/**
 * COMMENTS
 * GET/POST /api/hootzas/:id/comments
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  addHootzaComment,
  getHootzaComments,
  removeHootzaComment,
  type HootzaComment,
} from '../../../src/api/hootzas';
import { formatRelativeTime } from '../../../src/lib/hootza-format';
import { showDialog } from '../../../src/lib/dialog';

export default function CommentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comments, setComments] = useState<HootzaComment[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Host, organization lead or SUPER ADMIN may remove a comment; the server decides and re-checks on DELETE.
  const [canManage, setCanManage] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getHootzaComments(id);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setComments(res.data?.comments ?? []);
    setCanManage(res.data?.canManage === true);
  }, [id]);

  function confirmRemove(commentId: string) {
    showDialog(t('l06.comments.removeTitle'), t('l06.comments.removeBody'), [
      { text: t('l06.comments.removeKeep'), style: 'cancel' },
      { text: t('l06.comments.remove'), style: 'destructive', onPress: () => void remove(commentId) },
    ]);
  }

  async function remove(commentId: string) {
    if (!id) return;
    setRemoving(commentId);
    setRemoveError(null);
    const res = await removeHootzaComment(id, commentId);
    setRemoving(null);
    // 404 = already removed by someone else: the list simply refreshes.
    if (res.error && res.error.code !== 'comment_not_found') {
      setRemoveError(res.error.code === 'not_host' ? t('hootzas.errors.notHost') : t('l06.comments.removeFailed'));
      return;
    }
    void load();
  }

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!id || !draft.trim()) return;
    setPosting(true);
    const res = await addHootzaComment(id, draft.trim());
    setPosting(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setDraft('');
    load();
  }

  return (
    <ScreenContainer style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()} style={styles.header}>
        <Text style={styles.back}>{t('hootzas.common.back')}</Text>
        <View>
          <Text style={styles.title}>{t('hootzas.comments.title')}</Text>
          <Text style={styles.sub}>{t('hootzas.comments.subtitle')}</Text>
        </View>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered} testID="comments-loading">
          <ActivityIndicator color={FixedColors.hootza} />
        </View>
      ) : error ? (
        <View style={styles.centered} testID="comments-error">
          <Text style={styles.error}>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty} testID="comments-empty">
              {t('hootzas.comments.empty')}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.author}>{item.user?.fullName ?? t('hootzas.common.notAvailable')}{item.fromHost ? ` · ${t('s2c.hootzaChat.host')}` : ''}</Text>
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
              <Text style={styles.content}>{item.content}</Text>
              {/* §35.18 — a report button on every comment; the reason is one of the six (§35.19). */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/report', params: { type: 'hootza_comment', id: item.id, name: item.user?.fullName ?? '' } })}
                accessibilityRole="button"
                testID={`comment-report-${item.id}`}
              >
                <Text style={styles.time}>{t('account.report.title')}</Text>
              </TouchableOpacity>
              {canManage ? (
                <TouchableOpacity
                  onPress={() => confirmRemove(item.id)}
                  disabled={removing === item.id}
                  accessibilityRole="button"
                  testID={`comment-remove-${item.id}`}
                >
                  <Text style={styles.time}>{t('l06.comments.remove')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        />
      )}

      {removeError ? <Text accessibilityRole="alert" style={styles.footer} testID="comment-remove-error">{removeError}</Text> : null}
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('hootzas.comments.placeholder')}
          testID="comment-input"
        />
        <Button
          title={t('hootzas.common.submitComment')}
          onPress={submit}
          loading={posting}
          disabled={!draft.trim()}
          testID="comment-submit"
        />
        <Text style={styles.footer}>{t('hootzas.comments.footer')}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  back: { fontSize: 17, color: Colors.Ink },
  title: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  sub: { fontSize: 13, color: Colors.Muted },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  error: { color: Colors.Ink, fontSize: 16 },
  list: { padding: 20, gap: 17, flexGrow: 1 },
  empty: { textAlign: 'center', color: Colors.Muted, fontSize: 16, marginTop: 40 },
  comment: { gap: 2 },
  author: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  time: { fontSize: 12, color: Colors.Faint },
  content: { fontSize: 15, lineHeight: 21, color: Colors.Ink, marginTop: 2 },
  composer: { padding: 20, borderTopWidth: 1, borderColor: Colors.Hairline, gap: 9 },
  footer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
