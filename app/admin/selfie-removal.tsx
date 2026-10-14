/**
 * HELLO ADMIN › SELFIE REMOVAL (RULES §10.11). A selfie is removed only on a formal written request to Say Hello,
 * at Say Hello's discretion, by an admin — never a button inside the encounter flow. The pin and the count
 * remain; only the photo goes. The request is written down here (who asked, when, how) and the reason is
 * recorded in Audit. The photo's stored file is deleted by the server and the log says whether that worked.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { getSelfieRemovals, removeSelfie } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, ReasonAction, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminSelfieRemovalScreen() {
  const router = useRouter();
  const { me } = useAdminMe();
  const canAct = me?.permissions.includes('reports.resolve') ?? false;
  const log = useLoader(async () => {
    const r = await getSelfieRemovals();
    return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined;
  });
  const [helloId, setHelloId] = useState('');
  const [request, setRequest] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return (
    <AdminShell active="reports" title={t('adminW2.selfie.title')} subtitle={t('adminW2.selfie.lead')} onBack={() => router.back()} refreshing={log.refreshing} onRefresh={log.onRefresh} testID="admin-selfie">
      {canAct ? (
        <Card testID="admin-selfie-form">
          <Field label={t('adminW2.selfie.helloId')} value={helloId} onChange={setHelloId} testID="admin-selfie-hello" />
          <Field label={t('adminW2.selfie.request')} value={request} onChange={setRequest} multiline testID="admin-selfie-request" />
          <Text style={s.small}>{t('adminW2.selfie.requestHint')}</Text>
          {helloId.trim() && request.trim() ? (
            <ReasonAction id="admin-selfie-remove" kind="primary" label={t('adminW2.selfie.remove')} submit={async (reason) => {
              const r = await removeSelfie(helloId.trim(), request.trim(), reason);
              if (r?.data) { setMessage(t(r.data.storageDeleted ? 'adminW2.selfie.doneDeleted' : 'adminW2.selfie.doneStorage')); setHelloId(''); setRequest(''); return null; }
              return r?.error?.code ?? 'fallback';
            }} onDone={log.reload} />
          ) : (
            <Btn label={t('adminW2.selfie.remove')} onPress={() => setMessage(errorText('validation_error'))} kind="outline" disabled testID="admin-selfie-remove-disabled" />
          )}
          {message ? <Text style={s.body} testID="admin-selfie-message">{message}</Text> : null}
        </Card>
      ) : <Card><Text style={s.body}>{t('admin.common.notPermitted')}</Text></Card>}

      <Eyebrow>{t('adminW2.selfie.logTitle')}</Eyebrow>
      <Loaded l={log} id="admin-selfie-log">
        {(d) => (
          <View style={s.gap}>
            {d.removals.length === 0 ? <Card testID="admin-selfie-empty"><Text style={s.body}>{t('adminW2.selfie.empty')}</Text></Card> : null}
            {d.removals.map((r) => (
              <Card key={r.id}>
                <Text style={s.mono}>{r.helloId}</Text>
                <Text style={s.body}>{r.requestedByNote}</Text>
                <Text style={s.small}>{whenLabel(r.createdAt)} · {r.reason} · {t(r.storageDeletedAt ? 'adminW2.selfie.fileGone' : 'adminW2.selfie.filePending')}</Text>
              </Card>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
