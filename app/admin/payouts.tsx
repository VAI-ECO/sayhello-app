/**
 * HELLO ADMIN › PAYOUTS — withdrawal requests and the opt-out register (RULES §14.12-14.18, §23.9).
 * Honest states: a request is "Paid" only when the provider itself has confirmed it; an approval here only
 * means Say Hello decided yes, and the row says "Approved, not sent" until the provider reports otherwise.
 * With no provider connected the page says so. Every decision needs a written reason. Looking needs
 * payouts.export; approving or declining needs payouts.release (the server checks again).
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getPayoutOverview, getPayoutRequests, decidePayout, getOptOuts, type ProviderState } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Seg, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';

const TONE: Record<ProviderState, 'ok' | 'warn' | 'error' | undefined> = {
  awaiting_decision: 'warn', approved_not_sent: 'warn', sent_to_provider: undefined, paid_confirmed: 'ok', failed: 'error', rejected: undefined,
};

export default function AdminPayoutsScreen() {
  const { me } = useAdminMe();
  const canRelease = me?.permissions.includes('payouts.release') ?? false;
  const [which, setWhich] = useState<'open' | 'closed'>('open');
  const overview = useLoader(async () => { const r = await getPayoutOverview(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const list = useLoader(async () => { const r = await getPayoutRequests(which); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const optOuts = useLoader(async () => { const r = await getOptOuts(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } list.retry(); }, [which]); // eslint-disable-line react-hooks/exhaustive-deps
  const decide = (id: string, verb: 'approve' | 'reject') => async (reason: string) => {
    const r = await decidePayout(id, verb, reason);
    return r?.data ? null : r?.error?.code ?? 'fallback';
  };

  return (
    <AdminShell active="payouts" title={t('adminW2.payouts.title')} subtitle={t('adminW2.payouts.lead')} refreshing={list.refreshing} onRefresh={() => { list.onRefresh(); overview.reload(); optOuts.reload(); }} testID="admin-payouts">
      <Loaded l={overview} id="admin-payouts-overview">
        {(o) => (
          <Card testID="admin-payouts-provider">
            <Pill tone={o.providerConnected ? 'ok' : 'warn'} text={t(o.providerConnected ? 'adminW2.payouts.connected' : 'adminW2.payouts.notConnected')} />
            <Text style={s.body}>{t(o.settlementHoldDays === null ? 'adminW2.payouts.holdUnset' : 'adminW2.payouts.hold', { days: o.settlementHoldDays ?? 0 })}</Text>
            <Text style={s.body}>{t(o.fulfilmentWindowDays === null ? 'adminW2.payouts.windowUnset' : 'adminW2.payouts.window', { days: o.fulfilmentWindowDays ?? 0 })}</Text>
            <Text style={s.body}>{o.figuresCleared && o.minimumCents !== null ? t('adminW2.payouts.minimum', { amount: formatCents(o.minimumCents) }) : t('adminW2.payouts.figuresNotCleared')}</Text>
          </Card>
        )}
      </Loaded>

      <Seg id="admin-payouts-which" value={which} onChange={setWhich}
        options={[{ key: 'open', label: t('adminW2.payouts.open') }, { key: 'closed', label: t('adminW2.payouts.closed') }]} />
      <Loaded l={list} id="admin-payouts-list">
        {(d) => (
          <View style={s.gap}>
            {d.requests.length === 0 ? <Card testID="admin-payouts-empty"><Text style={s.body}>{t('adminW2.payouts.empty')}</Text></Card> : null}
            {d.requests.map((r) => (
              <Card key={r.id} testID={`admin-payout-${r.id}`}>
                <View style={s.row}>
                  <Text style={s.title}>{r.ambassadorName ?? t('adminW2.reports.unnamed')}</Text>
                  <Text style={s.title}>{formatCents(r.amountCents)}</Text>
                </View>
                <Pill tone={TONE[r.providerState]} text={t(`adminW2.payouts.state.${r.providerState}`)} />
                <Text style={s.small}>{t('adminW2.payouts.requested', { when: whenLabel(r.requestedAt) })}</Text>
                {r.rejectedReason ? <Text style={s.body}>{r.rejectedReason}</Text> : null}
                {r.failureReason ? <Text style={s.body}>{r.failureReason}</Text> : null}
                {canRelease && r.providerState === 'awaiting_decision' ? (
                  <View style={s.gap}>
                    <ReasonAction id={`admin-payout-approve-${r.id}`} kind="primary" label={t('adminW2.payouts.approve')} submit={decide(r.id, 'approve')} onDone={list.reload} />
                    <ReasonAction id={`admin-payout-reject-${r.id}`} label={t('adminW2.payouts.reject')} submit={decide(r.id, 'reject')} onDone={list.reload} />
                  </View>
                ) : null}
                {canRelease && r.providerState === 'approved_not_sent' ? (
                  <ReasonAction id={`admin-payout-reject-${r.id}`} label={t('adminW2.payouts.reject')} submit={decide(r.id, 'reject')} onDone={list.reload} />
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      <Eyebrow>{t('adminW2.payouts.optOutTitle')}</Eyebrow>
      <Text style={s.small}>{t('adminW2.payouts.optOutLead')}</Text>
      <Loaded l={optOuts} id="admin-optouts">
        {(d) => (
          <View style={s.gap}>
            {d.optOuts.length === 0 ? <Card testID="admin-optouts-empty"><Text style={s.body}>{t('adminW2.payouts.optOutEmpty')}</Text></Card> : null}
            {d.optOuts.map((o) => (
              <Card key={o.id} testID={`admin-optout-${o.id}`}>
                <Text style={s.title}>{o.ambassadorName ?? t('adminW2.reports.unnamed')}</Text>
                <Pill text={t(`adminW2.payouts.optState.${o.state}`)} />
                <Text style={s.body}>{t('adminW2.payouts.optCounts', { originated: o.originatedCount, servicing: o.servicingCount })}</Text>
                <Text style={s.body}>{t('adminW2.payouts.optTerms', { amount: formatCents(o.payoutPerHangoutPerYearCents), years: o.payoutYears })}</Text>
                <Text style={s.small}>{t('adminW2.payouts.optWhen', { when: whenLabel(o.optedOutAt) })}</Text>
              </Card>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
