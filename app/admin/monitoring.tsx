/**
 * HELLO ADMIN › MONITORING — who is slipping, and which Hello Hangouts need a person (RULES §16.25-16.31). Two
 * views, both read-only: the Ambassador roster (days since the last visit is the leading indicator, §16.29) and
 * the triage matrix (visits against customer scans, §16.30). The day counts that decide each flag come from the
 * server (admin settings): this screen shows them and computes nothing. Needs audit.view.
 */

import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getMonitoringRoster, getMonitoringTriage, type AmbassadorFlag, type TriageCategory } from '../../src/api/admin-w2';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Pill, adminStyles as s } from '../../src/components/admin/AdminParts';

const flagTone = (f: AmbassadorFlag) => (f === 'healthy' ? 'ok' : f === 'slipping' ? 'warn' : 'error');
const categoryTone = (c: TriageCategory) => (c === 'healthy' ? 'ok' : c === 'qr_hidden' ? 'warn' : 'error');

export default function AdminMonitoringScreen() {
  const roster = useLoader(async () => { const r = await getMonitoringRoster(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const triage = useLoader(async () => { const r = await getMonitoringTriage(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="monitoring" title={t('adminW2.monitoring.title')} subtitle={t('adminW2.monitoring.lead')}
      refreshing={roster.refreshing || triage.refreshing} onRefresh={() => { roster.onRefresh(); triage.onRefresh(); }} testID="admin-monitoring">
      <Eyebrow>{t('adminW2.monitoring.rosterTitle')}</Eyebrow>
      <Loaded l={roster} id="admin-roster">
        {(d) => (
          <View style={s.gap}>
            <Text style={s.small} testID="admin-roster-days">{t('adminW2.monitoring.rosterDays', { slipping: d.flagDays.slipping, atRisk: d.flagDays.atRisk, abandoned: d.flagDays.abandoned })}</Text>
            {d.roster.length === 0 ? <Card testID="admin-roster-empty"><Text style={s.body}>{t('adminW2.monitoring.rosterEmpty')}</Text></Card> : null}
            {d.roster.map((r) => (
              <Card key={r.id} testID={`admin-roster-${r.id}`}>
                <View style={s.row}>
                  <Text style={s.title}>{r.fullName ?? t('adminW2.reports.unnamed')}</Text>
                  <Pill tone={flagTone(r.flag)} text={t(`adminW2.monitoring.flag.${r.flag}`)} />
                </View>
                <Text style={s.body}>{r.daysSinceLastVisit === null ? t('adminW2.monitoring.neverVisited') : t('adminW2.monitoring.daysSince', { count: r.daysSinceLastVisit })}</Text>
                <Text style={s.small}>{t('adminW2.monitoring.counts', { originated: r.originatedCount ?? '—', servicing: r.servicingCount ?? '—' })}</Text>
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      <Eyebrow>{t('adminW2.monitoring.triageTitle')}</Eyebrow>
      <Loaded l={triage} id="admin-triage">
        {(d) => (
          <View style={s.gap}>
            <Text style={s.small}>{t('adminW2.monitoring.triageLead', { current: d.flagDays.abandoned, scans: d.hiddenQrDays })}</Text>
            {d.triage.length === 0 ? <Card testID="admin-triage-empty"><Text style={s.body}>{t('adminW2.monitoring.triageEmpty')}</Text></Card> : null}
            {d.triage.map((h) => (
              <Card key={h.id} testID={`admin-triage-${h.id}`}>
                <View style={s.row}>
                  <Text style={s.title}>{h.businessName}</Text>
                  <Pill tone={categoryTone(h.category)} text={t(`adminW2.monitoring.category.${h.category}`)} />
                </View>
                <Text style={s.body}>{h.servicingAmbassador?.fullName ?? t('adminW2.monitoring.noServicing')}</Text>
                <Text style={s.small}>{h.daysSinceVisit === null ? t('adminW2.monitoring.neverVisited') : t('adminW2.monitoring.daysSince', { count: h.daysSinceVisit })}</Text>
              </Card>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
