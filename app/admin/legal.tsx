/**
 * HELLO ADMIN › LEGAL TEXT — the editor for Terms, Privacy and Drawing rules (RULES §31.9). The app shows legal
 * text only once legal has approved it; nothing is invented. Saving writes an unapproved draft and the public
 * page stays "pending" until that exact text is approved here. Both steps ask for a reason and write Audit.
 * Needs settings.view to read and settings.edit to save or approve.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getLegalDocs, saveLegal, approveLegal, type LegalDoc } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

function Doc({ d, canEdit, onDone }: { d: LegalDoc; canEdit: boolean; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(d.body ?? '');
  const [version, setVersion] = useState(d.version ?? '');
  return (
    <Card testID={`admin-legal-${d.slug}`}>
      <View style={s.row}>
        <Text style={s.title}>{d.title}</Text>
        <Pill tone={d.approvedAt ? 'ok' : 'warn'} text={t(d.approvedAt ? 'adminW2.legal.approved' : d.body ? 'adminW2.legal.draft' : 'adminW2.legal.noText')} />
      </View>
      <Text style={s.small}>{d.version ? t('adminW2.legal.version', { version: d.version, when: whenLabel(d.updatedAt) }) : t('adminW2.legal.noVersion')}</Text>
      {canEdit ? (
        open ? (
          <View style={s.gap}>
            <Field label={t('adminW2.legal.versionLabel')} value={version} onChange={setVersion} testID={`admin-legal-version-${d.slug}`} />
            <Field label={t('adminW2.legal.text')} value={body} onChange={setBody} multiline testID={`admin-legal-body-${d.slug}`} />
            {body.trim() && version.trim() ? (
              <ReasonAction id={`admin-legal-save-${d.slug}`} kind="primary" label={t('adminW2.legal.save')} submit={async (reason) => {
                const r = await saveLegal(d.slug, body, version.trim(), reason); return r?.data ? null : r?.error?.code ?? 'fallback';
              }} onDone={() => { setOpen(false); onDone(); }} />
            ) : null}
            <Btn label={t('admin.settings.cancel')} kind="outline" onPress={() => setOpen(false)} testID={`admin-legal-cancel-${d.slug}`} />
          </View>
        ) : (
          <View style={s.gap}>
            <Btn label={t('adminW2.legal.edit')} kind="outline" onPress={() => setOpen(true)} testID={`admin-legal-edit-${d.slug}`} />
            {d.body && !d.approvedAt ? (
              <ReasonAction id={`admin-legal-approve-${d.slug}`} kind="primary" label={t('adminW2.legal.approve')} submit={async (reason) => {
                const r = await approveLegal(d.slug, reason); return r?.data ? null : r?.error?.code ?? 'fallback';
              }} onDone={onDone} />
            ) : null}
          </View>
        )
      ) : null}
    </Card>
  );
}

export default function AdminLegalScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const l = useLoader(async () => { const r = await getLegalDocs(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="legal" title={t('adminW2.legal.title')} subtitle={t('adminW2.legal.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-legal">
      <Loaded l={l} id="admin-legal-list">
        {(d) => <View style={s.gap}>{d.documents.map((x) => <Doc key={`${x.slug}-${x.updatedAt}`} d={x} canEdit={canEdit} onDone={l.reload} />)}</View>}
      </Loaded>
    </AdminShell>
  );
}
