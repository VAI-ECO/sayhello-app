/**
 * HELLO ADMIN › FLAGGED TEXT — the keyword pass's queue (RULES §24.15): free text a keyword matched, or a member
 * reported, waiting for a human. A flag is never an automatic removal. The author and the reporter are never shown
 * (§35.22). Needs reports.review to look and reports.resolve to decide; every decision asks for a reason and is
 * recorded in Audit. An item is decided once.
 */

import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getFlaggedQueue, decideFlagged } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminFlaggedScreen() {
  const { me } = useAdminMe();
  const canResolve = me?.permissions.includes('reports.resolve') ?? false;
  const l = useLoader(async () => { const r = await getFlaggedQueue(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="flagged" title={t('adminW2.flagged.title')} subtitle={t('adminW2.flagged.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-flagged">
      <Loaded l={l} id="admin-flagged-list">
        {(d) => (
          <View style={s.gap}>
            {d.queue.length === 0 ? <Card testID="admin-flagged-empty"><Text style={s.body}>{t('adminW2.flagged.empty')}</Text></Card> : null}
            {d.queue.map((q) => (
              <Card key={q.id} testID={`admin-flagged-${q.id}`}>
                <View style={s.row}>
                  <Text style={s.title}>{t(`adminW2.flagged.type.${q.contentType}`)}</Text>
                  <Text style={s.small}>{whenLabel(q.createdAt)}</Text>
                </View>
                <Text style={s.body} selectable testID={`admin-flagged-text-${q.id}`}>{q.flaggedText}</Text>
                <View style={s.row}>
                  {q.autoFlagged ? <Pill text={t('adminW2.flagged.byKeyword')} /> : null}
                  {q.userReported ? <Pill tone="warn" text={t('adminW2.flagged.byMember')} /> : null}
                </View>
                {q.matchedKeywords && q.matchedKeywords.length > 0 ? <Text style={s.small}>{t('adminW2.flagged.matched', { words: q.matchedKeywords.join(', ') })}</Text> : null}
                {canResolve ? (
                  <View style={s.gap}>
                    <ReasonAction id={`admin-flagged-ok-${q.id}`} label={t('adminW2.flagged.approve')} submit={async (reason) => {
                      const r = await decideFlagged(q.id, 'approved', reason); return r?.data ? null : r?.error?.code ?? 'fallback';
                    }} onDone={l.reload} />
                    <ReasonAction id={`admin-flagged-warn-${q.id}`} label={t('adminW2.flagged.warn')} submit={async (reason) => {
                      const r = await decideFlagged(q.id, 'warning_issued', reason); return r?.data ? null : r?.error?.code ?? 'fallback';
                    }} onDone={l.reload} />
                    <ReasonAction id={`admin-flagged-remove-${q.id}`} kind="primary" label={t('adminW2.flagged.remove')} submit={async (reason) => {
                      const r = await decideFlagged(q.id, 'removed', reason); return r?.data ? null : r?.error?.code ?? 'fallback';
                    }} onDone={l.reload} />
                  </View>
                ) : <Text style={s.small}>{t('adminW2.flagged.readOnly')}</Text>}
              </Card>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
