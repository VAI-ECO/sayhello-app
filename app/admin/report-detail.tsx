/**
 * HELLO ADMIN › REPORT — the reported item and what a moderator may do (RULES §23.14, §35.5, §35.15).
 * Chat: the reported message and a fixed context window either side, the sender shown only as "the reported
 * person" or "the other person". Opening this screen is itself recorded in Audit. Strikes are manual and
 * need a reason; reaching the threshold opens an account matter for a human, never an automatic ban.
 * Nobody is told: the reporter never hears the outcome (§35.21), the reported person never learns who reported.
 */

import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { getReport, actOnReport, type ReportAction } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, ReasonAction, Pill, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { me } = useAdminMe();
  const canResolve = me?.permissions.includes('reports.resolve') ?? false;
  const l = useLoader(async () => {
    const r = await getReport(String(id));
    return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined;
  });
  const act = (action: ReportAction) => async (reason: string) => {
    const r = await actOnReport(String(id), action, reason);
    return r?.data ? null : r?.error?.code ?? 'fallback';
  };

  return (
    <AdminShell active="reports" title={t('adminW2.report.title')} onBack={() => router.back()} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-report-detail">
      <Loaded l={l} id="admin-report">
        {(d) => {
          const closed = d.report.status === 'resolved' || d.report.status === 'dismissed';
          const ev = d.evidence;
          return (
            <View style={s.gap}>
              <Card>
                <Text style={s.title}>{t(`adminW2.reports.surface.${d.report.surface}`)} · {t(`adminW2.reports.reason.${d.report.reason}`)}</Text>
                {d.report.details ? <Text style={s.body}>{d.report.details}</Text> : null}
                <Text style={s.small}>{t('adminW2.reports.filed', { when: whenLabel(d.report.createdAt) })}</Text>
                <Pill text={t(`adminW2.report.status.${d.report.status}`)} tone={closed ? 'ok' : 'warn'} />
              </Card>

              <Eyebrow>{t('adminW2.report.evidence')}</Eyebrow>
              <Card testID="admin-report-evidence">
                {ev.available === false ? <Text style={s.body}>{t('adminW2.report.evidenceGone')}</Text> : null}
                {(ev.kind === 'chat' || ev.kind === 'hootza_chat') && ev.available ? (
                  <View style={s.gap}>
                    <Text style={s.small}>{t('adminW2.report.windowNote', { count: ev.contextWindow ?? 0 })}</Text>
                    {[...(ev.before ?? []), ...(ev.reported ? [ev.reported] : []), ...(ev.after ?? [])].map((m) => (
                      <View key={m.id} style={s.gap} testID={`admin-chat-line-${m.id}`}>
                        <Text style={s.mono}>{t(m.from === 'reported' ? 'adminW2.report.fromReported' : 'adminW2.report.fromOther')}{ev.reported && m.id === ev.reported.id ? ` · ${t('adminW2.report.thisMessage')}` : ''}</Text>
                        <Text style={s.body}>{m.body}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {(ev.kind === 'hootza_comment' || ev.kind === 'hangout_post') && ev.available ? (
                  <View style={s.gap}>
                    {ev.title ? <Text style={s.title}>{ev.title}</Text> : null}
                    <Text style={s.body}>{ev.text ?? ''}</Text>
                    {ev.isRemoved ? <Pill text={t('adminW2.report.alreadyRemoved')} /> : null}
                  </View>
                ) : null}
                {ev.kind === 'hello' ? <Text style={s.body}>{t('adminW2.report.helloNotOpened')}</Text> : null}
              </Card>

              {d.report.reportedUser ? (
                <Card testID="admin-report-account">
                  <Text style={s.title}>{d.report.reportedUser.displayName ?? t('adminW2.reports.unnamed')}</Text>
                  {d.strikes ? <Text style={s.body}>{t('adminW2.report.strikes', { active: d.strikes.active, threshold: d.strikes.threshold, months: d.strikes.expiryMonths })}</Text> : null}
                  {d.openAccountMatter ? <Pill tone="warn" text={t('adminW2.report.matterOpen')} /> : null}
                </Card>
              ) : null}

              {d.actions.length > 0 ? (
                <Card>
                  <Eyebrow>{t('adminW2.report.history')}</Eyebrow>
                  {d.actions.map((a) => (
                    <Text key={a.id} style={s.body}>{t(`adminW2.report.action.${a.action}`)} · {whenLabel(a.createdAt)} · {a.reason}</Text>
                  ))}
                </Card>
              ) : null}

              {!closed && canResolve ? (
                <View style={s.gap} testID="admin-report-actions">
                  <Text style={s.small}>{t('adminW2.report.silent')}</Text>
                  {d.report.surface === 'chat' || d.report.surface === 'hootza_comment' || d.report.surface === 'hootza_chat' ? (
                    <ReasonAction id="admin-act-strike" label={t('adminW2.report.action.strike')} submit={act('strike')} onDone={l.reload} kind="primary" />
                  ) : null}
                  {d.report.surface === 'hootza_comment' || d.report.surface === 'hootza_chat' || d.report.surface === 'hangout_post' ? (
                    <ReasonAction id="admin-act-remove" label={t('adminW2.report.action.remove_content')} submit={act('remove_content')} onDone={l.reload} />
                  ) : null}
                  {d.report.reportedUser ? <ReasonAction id="admin-act-eject" label={t('adminW2.report.action.eject')} submit={act('eject')} onDone={l.reload} /> : null}
                  <ReasonAction id="admin-act-resolve" label={t('adminW2.report.action.resolve')} submit={act('resolve')} onDone={l.reload} />
                  <ReasonAction id="admin-act-dismiss" label={t('adminW2.report.action.dismiss')} submit={act('dismiss')} onDone={l.reload} />
                </View>
              ) : null}
            </View>
          );
        }}
      </Loaded>
    </AdminShell>
  );
}
