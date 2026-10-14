/**
 * HELLO ADMIN › BUSINESS CATEGORIES — two levels, category then subcategory (RULES §18.3). Retire, never delete
 * (§18.6): a retired category stays on the Hello Hangouts that carry it and leaves the pickers. The list itself
 * is supplied by the owner — nothing is seeded; paste it as lines of "category" or "category, subcategory".
 * Looking needs settings.view; changing needs settings.edit (the server checks again, and writes Audit).
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getCategories, createCategory, renameCategory, setCategoryRetired, importCategories, type CategoryRow } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Btn, Field, Pill, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

function Row({ c, canEdit, onDone, indent }: { c: CategoryRow; canEdit: boolean; onDone: () => void; indent?: boolean }) {
  const [name, setName] = useState(c.name);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<{ data?: unknown; error?: { code?: string } } | undefined>) {
    setBusy(true); setError(null);
    const r = await fn();
    setBusy(false);
    if (r?.data) { setEditing(false); onDone(); } else setError(errorText(r?.error?.code));
  }
  return (
    <Card testID={`admin-category-${c.id}`}>
      <View style={[s.row, indent && { paddingLeft: 18 }]}>
        <Text style={s.title}>{c.name}</Text>
        {c.retiredAt ? <Pill text={t('adminW2.categories.retired')} /> : null}
      </View>
      {canEdit ? (
        <View style={s.gap}>
          {editing ? (
            <>
              <Field label={t('adminW2.categories.name')} value={name} onChange={setName} testID={`admin-category-name-${c.id}`} />
              <Btn label={t('admin.settings.save')} busy={busy} onPress={() => run(() => renameCategory(c.id, name.trim()))} testID={`admin-category-save-${c.id}`} />
            </>
          ) : <Btn label={t('adminW2.categories.rename')} kind="outline" onPress={() => setEditing(true)} testID={`admin-category-rename-${c.id}`} />}
          <Btn label={t(c.retiredAt ? 'adminW2.categories.restore' : 'adminW2.categories.retire')} kind="outline" busy={busy} onPress={() => run(() => setCategoryRetired(c.id, !c.retiredAt))} testID={`admin-category-retire-${c.id}`} />
          {error ? <Text accessibilityRole="alert" style={[s.body, { color: '#B3261E' }]}>{error}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

export default function AdminCategoriesScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const l = useLoader(async () => { const r = await getCategories(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [newName, setNewName] = useState('');
  const [parent, setParent] = useState<string | null>(null);
  const [csv, setCsv] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    const r = await createCategory(newName.trim(), parent);
    if (r?.data) { setNewName(''); setMsg(null); l.reload(); } else setMsg(errorText(r?.error?.code));
  }
  async function bulk() {
    const r = await importCategories(csv);
    if (r?.data) { setCsv(''); setMsg(t('adminW2.categories.imported', { count: r.data.created })); l.reload(); } else setMsg(errorText(r?.error?.code));
  }

  return (
    <AdminShell active="categories" title={t('adminW2.categories.title')} subtitle={t('adminW2.categories.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-categories">
      <Loaded l={l} id="admin-categories-list">
        {(d) => {
          const tops = d.categories.filter((c) => !c.parentId);
          return (
            <View style={s.gap}>
              {d.categories.length === 0 ? <Card testID="admin-categories-empty"><Text style={s.body}>{t('adminW2.categories.empty')}</Text></Card> : null}
              {tops.map((c) => (
                <View key={c.id} style={s.gap}>
                  <Row c={c} canEdit={canEdit} onDone={l.reload} />
                  {d.categories.filter((x) => x.parentId === c.id).map((x) => <Row key={x.id} c={x} canEdit={canEdit} onDone={l.reload} indent />)}
                </View>
              ))}
              {canEdit ? (
                <Card testID="admin-categories-add">
                  <Eyebrow>{t('adminW2.categories.add')}</Eyebrow>
                  <Field label={t('adminW2.categories.name')} value={newName} onChange={setNewName} testID="admin-categories-new-name" />
                  <Text style={s.small}>{t('adminW2.categories.parentHint')}</Text>
                  <View style={s.gap}>
                    <Btn label={t('adminW2.categories.topLevel')} kind={parent === null ? 'primary' : 'outline'} onPress={() => setParent(null)} testID="admin-categories-parent-none" />
                    {tops.filter((c) => !c.retiredAt).map((c) => (
                      <Btn key={c.id} label={c.name} kind={parent === c.id ? 'primary' : 'outline'} onPress={() => setParent(c.id)} testID={`admin-categories-parent-${c.id}`} />
                    ))}
                  </View>
                  <Btn label={t('adminW2.categories.addButton')} disabled={!newName.trim()} onPress={add} testID="admin-categories-add-button" />
                  <Eyebrow>{t('adminW2.categories.import')}</Eyebrow>
                  <Field label={t('adminW2.categories.csv')} value={csv} onChange={setCsv} multiline testID="admin-categories-csv" />
                  <Btn label={t('adminW2.categories.importButton')} kind="outline" disabled={!csv.trim()} onPress={bulk} testID="admin-categories-import-button" />
                  {msg ? <Text style={s.body} testID="admin-categories-message">{msg}</Text> : null}
                </Card>
              ) : null}
            </View>
          );
        }}
      </Loaded>
    </AdminShell>
  );
}
