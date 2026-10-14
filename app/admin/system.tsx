/**
 * HELLO ADMIN › SYSTEM — scheduler and job health (RULES §29), provider connection state and the emergency
 * switches. Job health is the same heartbeat /health/jobs reports: a job with no recent success is shown stale.
 * Providers read "connected" only when a credential is configured in this environment — it is not proof the
 * provider works. A switch is an ordinary setting: changing it asks for a reason and is written to Audit
 * through the Settings route (settings.edit), never through a second path.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getSystem, type SystemOverview } from '../../src/api/admin-w2';
import { updateSetting } from '../../src/api/admin';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Pill, ReasonAction, Field, adminStyles as s } from '../../src/components/admin/AdminParts';

function Switch({ sw, canEdit, onDone }: { sw: SystemOverview['switches'][number]; canEdit: boolean; onDone: () => void }) {
  const [text, setText] = useState(sw.value);
  const isBool = sw.valueType === 'boolean';
  const next = isBool ? (sw.value === 'true' ? 'false' : 'true') : text;
  return (
    <Card testID={`admin-switch-${sw.key}`}>
      <View style={s.row}><Text style={s.mono}>{sw.key}</Text><Text style={s.title}>{sw.value}</Text></View>
      <Text style={s.body}>{sw.description}</Text>
      <Text style={s.small}>{t('adminW2.system.changedAt', { when: whenLabel(sw.updatedAt) })}</Text>
      {canEdit ? (
        <View style={s.gap}>
          {!isBool ? <Field label={t('admin.settings.newValue')} value={text} onChange={setText} testID={`admin-switch-input-${sw.key}`} /> : null}
          <ReasonAction id={`admin-switch-set-${sw.key}`} label={isBool ? t(sw.value === 'true' ? 'adminW2.system.turnOff' : 'adminW2.system.turnOn') : t('admin.settings.save')}
            submit={async (reason) => { const r = await updateSetting(sw.key, next, reason); return r?.data ? null : r?.error?.code ?? 'fallback'; }} onDone={onDone} />
        </View>
      ) : null}
    </Card>
  );
}

export default function AdminSystemScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const l = useLoader(async () => { const r = await getSystem(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="system" title={t('adminW2.system.title')} subtitle={t('adminW2.system.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-system">
      <Loaded l={l} id="admin-system-data">
        {(d) => (
          <View style={s.gap}>
            <Card testID="admin-system-scheduler">
              <Pill tone={d.schedulerEnabled ? 'ok' : 'warn'} text={t(d.schedulerEnabled ? 'adminW2.system.schedulerOn' : 'adminW2.system.schedulerOff')} />
              <Text style={s.small}>{t('adminW2.system.checked', { when: whenLabel(d.checkedAt) })}</Text>
            </Card>
            <Eyebrow>{t('adminW2.system.jobs')}</Eyebrow>
            {d.jobs.map((j) => (
              <Card key={j.name} testID={`admin-job-${j.name}`}>
                <View style={s.row}><Text style={s.mono}>{j.name}</Text><Pill tone={j.enabled === false ? 'warn' : j.stale ? 'error' : 'ok'} text={t(j.enabled === false ? 'adminW2.system.switchedOff' : j.stale ? 'adminW2.system.stale' : 'adminW2.system.healthy')} /></View>
                <Text style={s.body}>{j.lastSuccessAt ? t('adminW2.system.lastOk', { when: whenLabel(j.lastSuccessAt), minutes: j.ageMinutes ?? 0 }) : t('adminW2.system.neverRan')}</Text>
                <Text style={s.small}>{j.schedule} · {t('adminW2.system.staleAfter', { minutes: j.staleAfterMinutes })}</Text>
              </Card>
            ))}
            {d.recentJobErrors.length > 0 ? (
              <Card testID="admin-system-errors">
                <Eyebrow>{t('adminW2.system.errors')}</Eyebrow>
                {d.recentJobErrors.map((e) => <Text key={e.id} style={s.body}>{e.jobName} · {whenLabel(e.finishedAt)} · {e.error ?? '—'}</Text>)}
              </Card>
            ) : null}
            {d.discovery ? (
              <>
                <Eyebrow>{t('adminW2.system.discovery')}</Eyebrow>
                <Card testID="admin-system-discovery">
                  <View style={s.row}>
                    <Text style={s.mono}>{t('adminW2.system.discoveryMode', { mode: d.discovery.mode })}</Text>
                    <Pill tone={d.discovery.active ? 'ok' : 'warn'} text={t(d.discovery.active ? 'adminW2.system.discoveryOn' : 'adminW2.system.discoveryOff')} />
                  </View>
                  <Text style={s.body}>{t('adminW2.system.discoveryCounts', { live: d.discovery.heartbeatsLive ?? '—', stored: d.discovery.heartbeatsStored ?? '—', hellos: d.discovery.hellosCreated24h ?? '—' })}</Text>
                  {d.discovery.jobs.map((j) => (
                    <Text key={j.name} style={s.small} testID={`admin-discovery-job-${j.name}`}>
                      {t('adminW2.system.discoveryJob', { name: j.name, state: t(!j.enabled ? 'adminW2.system.discoveryJobOff' : j.stale ? 'adminW2.system.discoveryStale' : 'adminW2.system.discoveryHealthy') })}
                    </Text>
                  ))}
                  <Text style={s.small}>{t('adminW2.system.discoveryChange')}</Text>
                </Card>
              </>
            ) : null}
            <Eyebrow>{t('adminW2.system.providers')}</Eyebrow>
            <Card testID="admin-system-providers">
              <Text style={s.body}>{t('adminW2.system.payments', { provider: d.providers.payments.provider })} · {t(d.providers.payments.configured ? 'adminW2.system.configured' : 'adminW2.system.notConfigured')}</Text>
              <Text style={s.body}>{t('adminW2.system.payouts', { provider: d.providers.payouts.provider })} · {t(d.providers.payouts.configured ? 'adminW2.system.configured' : 'adminW2.system.notConfigured')}</Text>
              <Text style={s.small}>{t('adminW2.system.providerNote')}</Text>
            </Card>
            <Eyebrow>{t('adminW2.system.switches')}</Eyebrow>
            <Text style={s.small}>{t('adminW2.system.switchesLead')}</Text>
            {d.switches.map((sw) => <Switch key={sw.key} sw={sw} canEdit={canEdit} onDone={l.reload} />)}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
