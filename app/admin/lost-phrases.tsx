/**
 * HELLO ADMIN › LOST-CONNECTION PHRASES (RULES 12.2). Waverly's lines when a Hello's connection is lost. Add, edit,
 * retire (a retired line is kept, never deleted). Every change asks for a reason and writes Audit.
 * Needs settings.view to read and settings.edit to change.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getLostPhrases, addLostPhrase, updateLostPhrase, type LostPhraseRow } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Btn, Field, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

function Row({ p, canEdit, onDone }: { p: LostPhraseRow; canEdit: boolean; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(p.phrase);
  return (
    <Card testID={`admin-lost-${p.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{p.phrase}</Text>
        <Pill tone={p.active ? 'ok' : 'warn'} text={t(p.active ? 'adminW2.lostPhrases.active' : 'adminW2.lostPhrases.retired')} />
      </View>
      {canEdit ? (
        open ? (
          <View style={s.gap}>
            <Field label={t('adminW2.lostPhrases.phrase')} value={text} onChange={setText} multiline testID={`admin-lost-text-${p.id}`} />
            {text.trim() && text.trim() !== p.phrase ? (
              <ReasonAction id={`admin-lost-save-${p.id}`} kind="primary" label={t('adminW2.lostPhrases.save')} submit={async (reason) => {
                const r = await updateLostPhrase(p.id, { phrase: text.trim() }, reason); return r?.data ? null : r?.error?.code ?? 'fallback';
              }} onDone={() => { setOpen(false); onDone(); }} />
            ) : null}
            <Btn label={t('admin.settings.cancel')} kind="outline" onPress={() => { setText(p.phrase); setOpen(false); }} testID={`admin-lost-cancel-${p.id}`} />
          </View>
        ) : (
          <View style={s.gap}>
            <Btn label={t('adminW2.lostPhrases.edit')} kind="outline" onPress={() => setOpen(true)} testID={`admin-lost-edit-${p.id}`} />
            <ReasonAction id={`admin-lost-toggle-${p.id}`} label={t(p.active ? 'adminW2.lostPhrases.retire' : 'adminW2.lostPhrases.restore')} submit={async (reason) => {
              const r = await updateLostPhrase(p.id, { active: !p.active }, reason); return r?.data ? null : r?.error?.code ?? 'fallback';
            }} onDone={onDone} />
          </View>
        )
      ) : null}
    </Card>
  );
}

function AddPhrase({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('');
  return (
    <Card testID="admin-lost-new">
      <Text style={s.title}>{t('adminW2.lostPhrases.new')}</Text>
      <Field label={t('adminW2.lostPhrases.phrase')} value={text} onChange={setText} multiline testID="admin-lost-new-text" />
      {text.trim() ? (
        <ReasonAction id="admin-lost-add" kind="primary" label={t('adminW2.lostPhrases.add')} submit={async (reason) => {
          const r = await addLostPhrase(text.trim(), reason); return r?.data ? null : r?.error?.code ?? 'fallback';
        }} onDone={() => { setText(''); onDone(); }} />
      ) : null}
    </Card>
  );
}

export default function AdminLostPhrasesScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const l = useLoader(async () => { const r = await getLostPhrases(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="lostPhrases" title={t('adminW2.lostPhrases.title')} subtitle={t('adminW2.lostPhrases.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-lost-phrases">
      <Loaded l={l} id="admin-lost-list">
        {(d) => (
          <View style={s.gap}>
            {d.phrases.length === 0 ? <Text style={s.small}>{t('adminW2.lostPhrases.empty')}</Text> : null}
            {d.phrases.map((x) => <Row key={`${x.id}-${x.updatedAt}`} p={x} canEdit={canEdit} onDone={l.reload} />)}
            {canEdit ? <AddPhrase onDone={l.reload} /> : null}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
