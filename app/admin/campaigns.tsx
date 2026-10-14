/**
 * HELLO ADMIN › BONUS CAMPAIGNS — the campaigns the bonus engine runs (stage 09 item 5). Create, pause, resume
 * and end; the budget cap is a hard limit the database enforces. Every change asks for a reason and writes
 * Audit (§23.8-23.9). This screen does not pay anyone: a bonus is paid out through the payout provider, and
 * the page says so. Looking needs payouts.export; creating and changing need payouts.adjust (the server checks).
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getCampaigns, createCampaign, setCampaignStatus, type BonusTrigger } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Btn, Field, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

const TRIGGERS: BonusTrigger[] = ['creator_channel_signup', 'milestone_hangouts', 'retention_streak', 'referral_volume'];

export default function AdminCampaignsScreen() {
  const { me } = useAdminMe();
  const canAdjust = me?.permissions.includes('payouts.adjust') ?? false;
  const l = useLoader(async () => { const r = await getCampaigns(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<BonusTrigger>('creator_channel_signup');
  const [threshold, setThreshold] = useState('');
  const [amount, setAmount] = useState('');
  const [cap, setCap] = useState('');
  const amountCents = Math.round(Number(amount) * 100);
  const capCents = Math.round(Number(cap) * 100);
  const ready = title.trim() && description.trim() && Number(threshold) >= 1 && amountCents > 0 && capCents >= amountCents;
  const status = (id: string, next: 'active' | 'paused' | 'ended') => async (reason: string) => {
    const r = await setCampaignStatus(id, next, reason);
    return r?.data ? null : r?.error?.code ?? 'fallback';
  };

  return (
    <AdminShell active="campaigns" title={t('adminW2.campaigns.title')} subtitle={t('adminW2.campaigns.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-campaigns">
      <Card><Text style={s.body}>{t('adminW2.campaigns.notPaid')}</Text></Card>
      <Loaded l={l} id="admin-campaigns-list">
        {(d) => (
          <View style={s.gap}>
            {d.campaigns.length === 0 ? <Card testID="admin-campaigns-empty"><Text style={s.body}>{t('adminW2.campaigns.empty')}</Text></Card> : null}
            {d.campaigns.map((c) => (
              <Card key={c.id} testID={`admin-campaign-${c.id}`}>
                <View style={s.row}><Text style={s.title}>{c.title}</Text><Pill tone={c.status === 'active' ? 'ok' : undefined} text={t(`adminW2.campaigns.status.${c.status}`)} /></View>
                <Text style={s.body}>{c.description}</Text>
                <Text style={s.body}>{t(`adminW2.campaigns.trigger.${c.triggerType}`)} · {t('adminW2.campaigns.threshold', { count: c.triggerThreshold })}</Text>
                <Text style={s.small}>{t('adminW2.campaigns.money', { bonus: formatCents(c.bonusAmountCents), spent: formatCents(c.spentCents), cap: formatCents(c.budgetCapCents) })}</Text>
                {canAdjust && c.status === 'active' ? <ReasonAction id={`admin-campaign-pause-${c.id}`} label={t('adminW2.campaigns.pause')} submit={status(c.id, 'paused')} onDone={l.reload} /> : null}
                {canAdjust && c.status === 'paused' ? <ReasonAction id={`admin-campaign-resume-${c.id}`} label={t('adminW2.campaigns.resume')} submit={status(c.id, 'active')} onDone={l.reload} /> : null}
                {canAdjust && c.status !== 'ended' ? <ReasonAction id={`admin-campaign-end-${c.id}`} label={t('adminW2.campaigns.end')} submit={status(c.id, 'ended')} onDone={l.reload} /> : null}
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      {canAdjust ? (
        <Card testID="admin-campaigns-form">
          <Eyebrow>{t('adminW2.campaigns.new')}</Eyebrow>
          <Field label={t('adminW2.campaigns.name')} value={title} onChange={setTitle} testID="admin-campaign-title" />
          <Field label={t('adminW2.campaigns.description')} value={description} onChange={setDescription} multiline testID="admin-campaign-description" />
          <Text style={s.small}>{t('adminW2.campaigns.triggerLabel')}</Text>
          {TRIGGERS.map((k) => <Btn key={k} label={t(`adminW2.campaigns.trigger.${k}`)} kind={trigger === k ? 'primary' : 'outline'} onPress={() => setTrigger(k)} testID={`admin-campaign-trigger-${k}`} />)}
          <Field label={t('adminW2.campaigns.thresholdLabel')} value={threshold} onChange={setThreshold} keyboard="numeric" testID="admin-campaign-threshold" />
          <Field label={t('adminW2.campaigns.amountLabel')} value={amount} onChange={setAmount} keyboard="numeric" testID="admin-campaign-amount" />
          <Field label={t('adminW2.campaigns.capLabel')} value={cap} onChange={setCap} keyboard="numeric" testID="admin-campaign-cap" />
          {ready ? (
            <ReasonAction id="admin-campaign-create" kind="primary" label={t('adminW2.campaigns.create')} submit={async (reason) => {
              const r = await createCampaign({ title: title.trim(), description: description.trim(), triggerType: trigger, triggerThreshold: Number(threshold), bonusAmountCents: amountCents, budgetCapCents: capCents, reason });
              if (r?.data) { setTitle(''); setDescription(''); setThreshold(''); setAmount(''); setCap(''); return null; }
              return r?.error?.code ?? 'fallback';
            }} onDone={l.reload} />
          ) : <Btn label={t('adminW2.campaigns.create')} kind="outline" disabled onPress={() => undefined} testID="admin-campaign-create-off" />}
        </Card>
      ) : null}
    </AdminShell>
  );
}
