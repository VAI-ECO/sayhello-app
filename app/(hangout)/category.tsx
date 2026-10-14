/**
 * HELLO HANGOUT CATEGORY — pick one category or subcategory (RULES §18.3; S3 stage 06).
 * The list is admin-managed rows (GET /business-categories); nothing is hardcoded here. PUT
 * /hello-hangouts/:id/category validates that it is live. Empty list is an honest state.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { listCategories, setCategory, type CategoryNode } from '../../src/api/hangout-business';
import { getManage } from '../../src/api/directory';

export default function HangoutCategoryScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unavailable'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await listCategories();
    if (res.error) { setState(res.error.status === 503 ? 'unavailable' : 'error'); return; }
    setTree(res.data?.categories ?? []);
    setState('ready');
    // The owner's current category comes from the manage read (owner-only).
    if (helloHangoutId) {
      const m = await getManage(helloHangoutId);
      setCurrent(m.data?.helloHangout.categoryId ?? null);
    }
  }, [helloHangoutId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function choose(id: string | null) {
    if (!helloHangoutId || saving) return;
    setSaving(true);
    const res = await setCategory(helloHangoutId, id);
    setSaving(false);
    if (res.error) { setMessage(t('hangoutBiz.loadFailed')); return; }
    setCurrent(id);
    setMessage(t('hangoutBiz.category.saved'));
  }

  const row = (id: string | null, label: string, indent = false) => (
    <TouchableOpacity
      key={id ?? 'none'}
      style={[styles.row, indent && styles.indent, current === id && styles.rowOn]}
      onPress={() => void choose(id)}
      accessibilityRole="button"
      accessibilityState={{ selected: current === id }}
      testID={`category-${id ?? 'none'}`}
    >
      <Text style={[styles.rowText, current === id && styles.rowTextOn]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.backText}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangoutBiz.category.headline')}</Text>
        <Text style={styles.muted}>{t('hangoutBiz.category.body')}</Text>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'unavailable' ? <Text style={styles.muted}>{t('hangoutBiz.notSetUp')}</Text> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangoutBiz.loadFailed')} {t('hangoutBiz.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && tree.length === 0 ? <Text style={styles.muted} testID="category-empty">{t('hangoutBiz.category.empty')}</Text> : null}
        {state === 'ready' && tree.length > 0 ? (
          <View style={styles.list}>
            {row(null, t('hangoutBiz.category.none'))}
            {tree.map((c) => (
              <View key={c.id}>
                {row(c.id, c.name)}
                {c.children.map((k) => row(k.id, k.name, true))}
              </View>
            ))}
          </View>
        ) : null}
        {message ? <Text style={styles.note} testID="category-message">{message}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  muted: { fontSize: 15, lineHeight: 21, color: Colors.Muted },
  note: { fontSize: 14, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 10, padding: 12 },
  list: { gap: 6 },
  row: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  indent: { marginLeft: 18 },
  rowOn: { backgroundColor: Colors.Ink, borderColor: Colors.Ink },
  rowText: { fontSize: 16, color: Colors.Ink },
  rowTextOn: { color: Colors.Chalk, fontWeight: '700' },
});
