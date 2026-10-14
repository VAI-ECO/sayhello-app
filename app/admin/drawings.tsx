/**
 * HELLO ADMIN › DRAWINGS — status and plan rows (RULES §1.19, §4.9, §5.2, §5.8). Every drawing is PLANNED: there is no
 * first drawing date and no winner engine at launch, so this screen reports and never runs or picks. The freeze IS
 * the reset (§4.9); its adjustable figures are listed here and changed on Settings with a reason. The plan rows
 * below are the facts the app shows under Drawings: an admin enters a date and the official-rules link, then
 * publishes; nothing is derived. Needs drawings.view; changing plans needs drawings.run.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getDrawings } from '../../src/api/admin-w2';
import { getDrawingPlans, createDrawingPlan, updateDrawingPlan, type DrawingPlanRow } from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, Pill, Seg, adminStyles as s } from '../../src/components/admin/AdminParts';
import { w3ErrorText } from '../../src/components/admin/storeErrors';

type PlanStatus = 'planned' | 'funded_and_dated';

function PlanCard({ p, canRun, onDone }: { p: DrawingPlanRow; canRun: boolean; onDone: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(p.title);
  const [summary, setSummary] = useState(p.summary ?? '');
  const [date, setDate] = useState(p.datedFor ?? '');
  const [rules, setRules] = useState(p.rulesUrl ?? '');
  const [status, setStatus] = useState<PlanStatus>(p.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function run(body: Parameters<typeof updateDrawingPlan>[1]) {
    setBusy(true); setMsg(null);
    const r = await updateDrawingPlan(p.id, body);
    setBusy(false);
    if (r?.data) { setEditing(false); onDone(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  return (
    <Card testID={`admin-plan-${p.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{p.title}</Text>
        <Pill tone={p.published ? 'ok' : undefined} text={t(p.published ? 'adminW3.plans.published' : 'adminW3.plans.unpublished')} />
      </View>
      <Text style={s.small}>{t(p.status === 'planned' ? 'adminW3.plans.statusPlanned' : 'adminW3.plans.statusFunded')}{p.datedFor ? ` · ${t('adminW3.plans.dated', { date: p.datedFor })}` : ''}</Text>
      {p.summary ? <Text style={s.body}>{p.summary}</Text> : null}
      {canRun ? (
        <View style={s.gap}>
          <Btn kind="outline" busy={busy} label={t(p.published ? 'adminW3.plans.unpublish' : 'adminW3.plans.publish')} onPress={() => run({ published: !p.published })} testID={`admin-plan-publish-${p.id}`} />
          {editing ? (
            <>
              <Field label={t('adminW3.plans.planTitle')} value={title} onChange={setTitle} testID={`admin-plan-title-${p.id}`} />
              <Field label={t('adminW3.plans.planSummary')} value={summary} onChange={setSummary} multiline testID={`admin-plan-summary-${p.id}`} />
              <Seg id={`admin-plan-status-${p.id}`} value={status} onChange={setStatus} options={[{ key: 'planned', label: t('adminW3.plans.statusPlanned') }, { key: 'funded_and_dated', label: t('adminW3.plans.statusFunded') }]} />
              <Field label={t('adminW3.plans.planDate')} value={date} onChange={setDate} testID={`admin-plan-date-${p.id}`} />
              <Field label={t('adminW3.plans.planRules')} value={rules} onChange={setRules} testID={`admin-plan-rules-${p.id}`} />
              <Btn busy={busy} disabled={!title.trim()} label={t('adminW3.common.save')} onPress={() => run({ title: title.trim(), summary: summary.trim() || null, status, datedFor: date.trim() || null, rulesUrl: rules.trim() || null })} testID={`admin-plan-save-${p.id}`} />
              <Btn kind="outline" label={t('adminW3.common.cancel')} onPress={() => setEditing(false)} testID={`admin-plan-cancel-${p.id}`} />
            </>
          ) : <Btn kind="outline" label={t('adminW3.plans.edit')} onPress={() => setEditing(true)} testID={`admin-plan-edit-${p.id}`} />}
        </View>
      ) : null}
      {msg ? <Text style={s.body} accessibilityRole="alert">{msg}</Text> : null}
    </Card>
  );
}

export default function AdminDrawingsScreen() {
  const { me } = useAdminMe();
  const canRun = me?.permissions.includes('drawings.run') ?? false;
  const l = useLoader(async () => { const r = await getDrawings(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const plans = useLoader(async () => { const r = await getDrawingPlans(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function add() {
    const r = await createDrawingPlan({ title: title.trim(), summary: summary.trim() || null });
    if (r?.data) { setTitle(''); setSummary(''); setMessage(null); plans.reload(); } else setMessage(w3ErrorText(r?.error?.code));
  }

  return (
    <AdminShell active="drawings" title={t('adminW2.drawings.title')} subtitle={t('adminW2.drawings.lead')} refreshing={l.refreshing} onRefresh={() => { l.onRefresh(); plans.onRefresh(); }} testID="admin-drawings">
      <Loaded l={l} id="admin-drawings-data">
        {(d) => (
          <View style={s.gap}>
            <Card testID="admin-drawings-state">
              <Pill text={t('adminW2.drawings.planned')} />
              <Text style={s.body}>{t('adminW2.drawings.noDate')}</Text>
              <Text style={s.body}>{t('adminW2.drawings.noEngine')}</Text>
            </Card>
            <Eyebrow>{t('adminW2.drawings.freeze')}</Eyebrow>
            <Text style={s.small}>{t('adminW2.drawings.freezeLead')}</Text>
            {d.settings.length === 0 ? <Card><Text style={s.body}>{t('adminW2.drawings.noSettings')}</Text></Card> : null}
            {d.settings.map((x) => (
              <Card key={x.key} testID={`admin-drawings-setting-${x.key}`}>
                <View style={s.row}><Text style={s.mono}>{x.key}</Text><Text style={s.title}>{x.value}</Text></View>
                <Text style={s.body}>{x.description}</Text>
              </Card>
            ))}
            <Eyebrow>{t('adminW3.plans.freezeTitle')}</Eyebrow>
            {d.drawings.filter((x) => x.isFinalized).length === 0 ? <Text style={s.small} testID="admin-drawings-freeze-none">{t('adminW3.plans.freezeNone')}</Text> : null}
            {d.drawings.filter((x) => x.isFinalized).map((x) => <Text key={x.id} style={s.small}>{t('adminW3.plans.freezeLine', { name: x.drawingName, entries: x.totalEntries })}</Text>)}
            <Eyebrow>{t('adminW2.drawings.records')}</Eyebrow>
            {d.drawings.length === 0 ? <Card testID="admin-drawings-empty"><Text style={s.body}>{t('adminW2.drawings.none')}</Text></Card> : null}
            {d.drawings.map((x) => (
              <Card key={x.id}>
                <Text style={s.title}>{x.drawingName}</Text>
                <Text style={s.small}>{whenLabel(x.drawingDate)} · {t('adminW2.drawings.entries', { entries: x.totalEntries, participants: x.totalParticipants })} · {t(x.isFinalized ? 'adminW2.drawings.final' : 'adminW2.drawings.notFinal')}</Text>
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      <Eyebrow>{t('adminW3.plans.title')}</Eyebrow>
      <Text style={s.small}>{t('adminW3.plans.lead')}</Text>
      {me && !canRun ? <Text style={s.small} testID="admin-plans-viewonly">{t('adminW3.plans.viewOnly')}</Text> : null}
      <Loaded l={plans} id="admin-plans">
        {(d) => (
          <View style={s.gap}>
            {d.plans.length === 0 ? <Card testID="admin-plans-empty"><Text style={s.body}>{t('adminW3.plans.empty')}</Text></Card> : null}
            {d.plans.map((p) => <PlanCard key={p.id} p={p} canRun={canRun} onDone={plans.reload} />)}
          </View>
        )}
      </Loaded>
      {canRun ? (
        <Card testID="admin-plans-new">
          <Eyebrow>{t('adminW3.plans.newPlan')}</Eyebrow>
          <Field label={t('adminW3.plans.planTitle')} value={title} onChange={setTitle} testID="admin-plan-new-title" />
          <Field label={t('adminW3.plans.planSummary')} value={summary} onChange={setSummary} multiline testID="admin-plan-new-summary" />
          <Btn label={t('adminW3.plans.create')} disabled={!title.trim()} onPress={add} testID="admin-plan-new-create" />
          {message ? <Text style={s.body} accessibilityRole="alert">{message}</Text> : null}
        </Card>
      ) : null}
    </AdminShell>
  );
}
