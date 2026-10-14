/**
 * HELLO ADMIN › REPORTS — the report queue (RULES §23.17, §35). Oldest first, with the act-within clock
 * (MONEY Part 6 `reports_act_within_hours`, from the server). Open a report to read the reported item and
 * decide; accounts that reached the strike threshold wait here for a human decision (§35.14). The reporter's
 * identity is never on this screen (§35.22). Needs reports.review to look; the server checks every action.
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { getReports, getAccountMatters, decideAccountMatter } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Seg, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminReportsScreen() {
  const router = useRouter();
  const { me } = useAdminMe();
  const canResolve = me?.permissions.includes('reports.resolve') ?? false;
  const [which, setWhich] = useState<'open' | 'closed'>('open');
  const list = useLoader(async () => {
    const r = await getReports(which);
    return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined;
  });
  const matters = useLoader(async () => {
    const r = await getAccountMatters();
    return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined;
  });
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } list.retry(); }, [which]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminShell active="reports" title={t('adminW2.reports.title')} subtitle={t('adminW2.reports.lead')} refreshing={list.refreshing} onRefresh={list.onRefresh} testID="admin-reports">
      <Seg id="admin-reports-which" value={which} onChange={setWhich}
        options={[{ key: 'open', label: t('adminW2.reports.open') }, { key: 'closed', label: t('adminW2.reports.closed') }]} />
      <Loaded l={list} id="admin-reports-list">
        {(d) => (
          <View style={s.gap}>
            {which === 'open' ? <Text style={s.small}>{t('adminW2.reports.actWithin', { hours: d.actWithinHours })}</Text> : null}
            {d.reports.length === 0 ? <Card testID="admin-reports-empty"><Text style={s.body}>{t(which === 'open' ? 'adminW2.reports.emptyOpen' : 'adminW2.reports.emptyClosed')}</Text></Card> : null}
            {d.reports.map((r) => (
              <TouchableOpacity key={r.id} onPress={() => router.push(`/admin/report-detail?id=${r.id}`)} accessibilityRole="button" testID={`admin-report-${r.id}`}>
                <Card>
                  <View style={s.row}>
                    <Text style={s.title}>{t(`adminW2.reports.surface.${r.surface}`)} · {t(`adminW2.reports.reason.${r.reason}`)}</Text>
                    {r.overdue ? <Pill tone="warn" text={t('adminW2.reports.overdue')} /> : null}
                  </View>
                  <Text style={s.body}>{r.reportedUser ? (r.reportedUser.displayName ?? t('adminW2.reports.unnamed')) : t('adminW2.reports.noAccount')}</Text>
                  <Text style={s.small}>{t('adminW2.reports.filed', { when: whenLabel(r.createdAt) })}{which === 'open' ? ` · ${t('adminW2.reports.due', { when: whenLabel(r.dueAt) })}` : ''}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Loaded>

      <Eyebrow>{t('adminW2.reports.mattersTitle')}</Eyebrow>
      <Loaded l={matters} id="admin-matters">
        {(d) => (
          <View style={s.gap}>
            <Text style={s.small}>{t('adminW2.reports.mattersLead')}</Text>
            {d.matters.length === 0 ? <Card testID="admin-matters-empty"><Text style={s.body}>{t('adminW2.reports.mattersEmpty')}</Text></Card> : null}
            {d.matters.map((m) => (
              <Card key={m.id} testID={`admin-matter-${m.id}`}>
                <Text style={s.title}>{m.displayName ?? t('adminW2.reports.unnamed')}</Text>
                <Text style={s.body}>{t('adminW2.reports.mattersCount', { count: m.activeStrikesAtOpen, when: whenLabel(m.openedAt) })}</Text>
                {canResolve ? (
                  <View style={s.gap}>
                    <ReasonAction id={`admin-matter-keep-${m.id}`} label={t('adminW2.reports.mattersNoAction')} submit={async (reason) => {
                      const r = await decideAccountMatter(m.id, 'no_action', reason); return r?.data ? null : r?.error?.code ?? 'fallback';
                    }} onDone={matters.reload} />
                    <ReasonAction id={`admin-matter-eject-${m.id}`} kind="primary" label={t('adminW2.reports.mattersEject')} submit={async (reason) => {
                      const r = await decideAccountMatter(m.id, 'ejected', reason); return r?.data ? null : r?.error?.code ?? 'fallback';
                    }} onDone={matters.reload} />
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      {me?.permissions.includes('reports.resolve') ? (
        <Btn label={t('adminW2.reports.selfieLink')} kind="outline" onPress={() => router.push('/admin/selfie-removal')} testID="admin-reports-selfie" />
      ) : null}
    </AdminShell>
  );
}
