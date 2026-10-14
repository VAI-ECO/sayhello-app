/**
 * HELLO ADMIN › SEE LAYER — CANON-MN-01-SN-18 · D (design: Reserved Screens, "See-layer dashboard"; RULES §4.3).
 * Measure · Scope · Now · Direction · Owned by. Every reading comes from the same endpoint the measure's own admin
 * screen uses, so the two can never disagree; nothing is computed here beyond a count of rows the server returned.
 *
 * Built from existing routes only:
 *   - Reports open past the window: GET /admin/reports?status=open, count of `overdue` (reports.review).
 *   - Override annual cost: GET /admin/price-overrides totalAnnualCostCents (overrides.view).
 * Not built, recorded: Hellos, Hello Hangouts renewing and Ambassadors active have no admin read route on this
 * server (the monitoring roster reads the retired `hangouts` table), so they say so instead of showing a number.
 * Direction needs a stored earlier reading; no measure history exists, so it is "—". History and Export from the
 * design have no route and are not drawn (never a dead button). No targets, no forecasts.
 */
import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getReports } from '../../src/api/admin-w2';
import { getPriceOverrides } from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { Btn, adminStyles as s } from '../../src/components/admin/AdminParts';

type Row = { key: string; measure: string; scope: string; owner: string };

function MeasureRow({ row, now }: { row: Row; now: ReactNode }) {
  return (
    <Card testID={`admin-see-${row.key}`}>
      <View style={s.row}>
        <Text style={s.title}>{t(row.measure)}</Text>
        <Text style={s.small}>{t(row.owner)}</Text>
      </View>
      <Text style={s.small}>{t('adminSee.scope')}: {t(row.scope)} · {t('adminSee.direction')}: {t('adminSee.noDirection')}</Text>
      <View testID={`admin-see-${row.key}-now`}>{now}</View>
    </Card>
  );
}

function Reading<T>({ id, fetcher, show }: { id: string; fetcher: () => Promise<{ data?: T; error?: { code?: string; message: string } } | undefined>; show: (d: T) => string }) {
  const l = useLoader(async () => { const r = await fetcher(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  if (l.state === 'loading') return <Text style={s.body}>…</Text>;
  if (l.state === 'error' || !l.data) {
    return (
      <View style={s.gap}>
        <Text style={s.body} accessibilityRole="alert">{t('adminSee.failed')}</Text>
        <Btn label={t('adminSee.retry')} onPress={l.retry} kind="outline" testID={`admin-see-${id}-retry`} />
      </View>
    );
  }
  return <Text style={s.title}>{show(l.data)}</Text>;
}

export default function AdminSeeLayerScreen() {
  const { me } = useAdminMe();
  const holds = (p: string) => me?.permissions.includes(p) ?? false;
  const none = <Text style={s.body}>{t('adminSee.noReading')}</Text>;
  const notHeld = (permission: string) => <Text style={s.body}>{t('adminSee.notHeld', { permission })}</Text>;

  return (
    <AdminShell active="see" title={t('adminSee.title')} subtitle={t('adminSee.lead')} testID="admin-see-layer">
      <View style={s.gap}>
        <MeasureRow row={{ key: 'hellos', measure: 'adminSee.hellos', scope: 'adminSee.allMarkets', owner: 'adminSee.product' }} now={none} />
        <MeasureRow row={{ key: 'renewing', measure: 'adminSee.renewing', scope: 'adminSee.allMarkets', owner: 'adminSee.money' }} now={none} />
        <MeasureRow row={{ key: 'ambassadors', measure: 'adminSee.ambassadors', scope: 'adminSee.allMarkets', owner: 'adminSee.money' }} now={none} />
        <MeasureRow
          row={{ key: 'reports', measure: 'adminSee.reportsLate', scope: 'adminSee.allSurfaces', owner: 'adminSee.rules' }}
          now={holds('reports.review')
            ? <Reading id="reports" fetcher={() => getReports('open')} show={(d) => String(d.reports.filter((r) => r.overdue).length)} />
            : notHeld('reports.review')}
        />
        <MeasureRow
          row={{ key: 'overrides', measure: 'adminSee.overrideCost', scope: 'adminSee.allEntities', owner: 'adminSee.money' }}
          now={holds('overrides.view')
            ? <Reading id="overrides" fetcher={getPriceOverrides} show={(d) => formatCents(d.totalAnnualCostCents)} />
            : notHeld('overrides.view')}
        />
        <Text style={s.small}>{t('adminSee.note')}</Text>
        <Text style={s.small}>{t('adminSee.noHistory')}</Text>
      </View>
    </AdminShell>
  );
}
