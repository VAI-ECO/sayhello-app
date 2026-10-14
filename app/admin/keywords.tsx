/**
 * HELLO ADMIN › KEYWORDS — the words the free-text pass flags (RULES §24.15: admin-managed, no deploy). A match
 * only queues the text for a human (Flagged text); it never removes anything. Plain words and phrases only: the
 * server refuses characters that would act as a pattern. Needs reports.keywords; every change is recorded in Audit.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getKeywords, addKeyword, setKeywordActive, deleteKeyword, type KeywordRow } from '../../src/api/admin-w2';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Btn, Field, Pill, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

function Row({ k, onDone }: { k: KeywordRow; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(call: () => Promise<{ data?: unknown; error?: { code?: string } | null } | undefined>) {
    setBusy(true); setError(null);
    const r = await call();
    setBusy(false); setConfirming(false);
    if (r?.data) onDone(); else setError(errorText(r?.error?.code));
  }
  return (
    <Card testID={`admin-keyword-${k.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{k.keyword}</Text>
        <Pill tone={k.isActive ? 'ok' : 'warn'} text={t(k.isActive ? 'adminW2.keywords.active' : 'adminW2.keywords.paused')} />
      </View>
      {k.category ? <Text style={s.small}>{k.category}</Text> : null}
      <Btn label={t(k.isActive ? 'adminW2.keywords.pause' : 'adminW2.keywords.resume')} kind="outline" busy={busy}
        onPress={() => run(() => setKeywordActive(k.id, !k.isActive))} testID={`admin-keyword-toggle-${k.id}`} />
      {confirming
        ? <Btn label={t('adminW2.keywords.removeConfirm')} busy={busy} onPress={() => run(() => deleteKeyword(k.id))} testID={`admin-keyword-remove-confirm-${k.id}`} />
        : <Btn label={t('adminW2.keywords.remove')} kind="outline" onPress={() => setConfirming(true)} testID={`admin-keyword-remove-${k.id}`} />}
      {error ? <Text accessibilityRole="alert" style={s.body} testID={`admin-keyword-error-${k.id}`}>{error}</Text> : null}
    </Card>
  );
}

function AddKeyword({ onDone }: { onDone: () => void }) {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function add() {
    setBusy(true); setError(null);
    const r = await addKeyword(word.trim(), category.trim() || undefined);
    setBusy(false);
    if (r?.data) { setWord(''); setCategory(''); onDone(); } else setError(errorText(r?.error?.code));
  }
  return (
    <Card testID="admin-keyword-new">
      <Text style={s.title}>{t('adminW2.keywords.new')}</Text>
      <Text style={s.small}>{t('adminW2.keywords.plainOnly')}</Text>
      <Field label={t('adminW2.keywords.word')} value={word} onChange={setWord} testID="admin-keyword-new-word" />
      <Field label={t('adminW2.keywords.category')} value={category} onChange={setCategory} testID="admin-keyword-new-category" />
      <Btn label={t('adminW2.keywords.add')} busy={busy} disabled={!word.trim()} onPress={add} testID="admin-keyword-add" />
      {error ? <Text accessibilityRole="alert" style={s.body} testID="admin-keyword-new-error">{error}</Text> : null}
    </Card>
  );
}

export default function AdminKeywordsScreen() {
  const l = useLoader(async () => { const r = await getKeywords(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="keywords" title={t('adminW2.keywords.title')} subtitle={t('adminW2.keywords.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-keywords">
      <Loaded l={l} id="admin-keywords-list">
        {(d) => (
          <View style={s.gap}>
            {d.keywords.length === 0 ? <Text style={s.small} testID="admin-keywords-empty">{t('adminW2.keywords.empty')}</Text> : null}
            {d.keywords.map((k) => <Row key={`${k.id}-${k.isActive}`} k={k} onDone={l.reload} />)}
            <AddKeyword onDone={l.reload} />
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
