/**
 * HELLO ADMIN › HELLO HANGOUTS — the human-decision queues for Hello Hangouts: a ring that found nobody or ran
 * out of declines (RULES §16.14, §16.33-16.34: it surfaces here, it never resolves silently), hardship petitions
 * (price decisions, with a reason), and duplicate locations (flagged, never merged — a person decides which
 * record stands). Looking needs overrides.view; deciding needs overrides.create (the server checks again).
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getEscalations, resolveEscalation, expandEscalation, getHardship, decideHardship, getDuplicates } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Seg, Field, Btn, ReasonAction, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

function Expand({ id, onDone }: { id: string; onDone: () => void }) {
  const [miles, setMiles] = useState('');
  const n = Number(miles);
  return (
    <View style={s.gap}>
      <Field label={t('adminW2.ops.radius')} value={miles} onChange={setMiles} keyboard="numeric" testID={`admin-esc-radius-${id}`} />
      {n > 0 ? (
        <ReasonAction id={`admin-esc-expand-${id}`} label={t('adminW2.ops.expand')} submit={async (reason) => {
          const r = await expandEscalation(id, n, reason); return r?.data ? null : r?.error?.code ?? 'fallback';
        }} onDone={onDone} />
      ) : <Btn label={t('adminW2.ops.expand')} onPress={() => undefined} kind="outline" disabled testID={`admin-esc-expand-off-${id}`} />}
    </View>
  );
}

function Hardship({ id, onDone }: { id: string; onDone: () => void }) {
  const [price, setPrice] = useState('');
  const cents = Math.round(Number(price) * 100);
  return (
    <View style={s.gap}>
      <Field label={t('adminW2.ops.approvedPrice')} value={price} onChange={setPrice} keyboard="numeric" testID={`admin-hardship-price-${id}`} />
      {price !== '' && cents >= 0 ? (
        <ReasonAction id={`admin-hardship-approve-${id}`} kind="primary" label={t('adminW2.ops.approve')} submit={async (reason) => {
          const r = await decideHardship(id, { decision: 'approved', approvedPriceCents: cents, reason }); return r?.data ? null : r?.error?.code ?? 'fallback';
        }} onDone={onDone} />
      ) : null}
      <ReasonAction id={`admin-hardship-decline-${id}`} label={t('adminW2.ops.decline')} submit={async (reason) => {
        const r = await decideHardship(id, { decision: 'declined', reason }); return r?.data ? null : r?.error?.code ?? 'fallback';
      }} onDone={onDone} />
    </View>
  );
}

export default function AdminOperationsScreen() {
  const { me } = useAdminMe();
  const canDecide = me?.permissions.includes('overrides.create') ?? false;
  const [tab, setTab] = useState<'queue' | 'hardship' | 'duplicates'>('queue');
  const esc = useLoader(async () => { const r = await getEscalations(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const hard = useLoader(async () => { const r = await getHardship(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const dup = useLoader(async () => { const r = await getDuplicates(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  void errorText;

  return (
    <AdminShell active="operations" title={t('adminW2.ops.title')} subtitle={t('adminW2.ops.lead')} refreshing={esc.refreshing} onRefresh={() => { esc.onRefresh(); hard.reload(); dup.reload(); }} testID="admin-operations">
      <Seg id="admin-ops-tab" value={tab} onChange={setTab}
        options={[{ key: 'queue', label: t('adminW2.ops.tabQueue') }, { key: 'hardship', label: t('adminW2.ops.tabHardship') }, { key: 'duplicates', label: t('adminW2.ops.tabDuplicates') }]} />

      {tab === 'queue' ? (
        <Loaded l={esc} id="admin-esc">
          {(d) => (
            <View style={s.gap}>
              <Text style={s.small}>{t('adminW2.ops.queueLead')}</Text>
              {d.escalations.length === 0 ? <Card testID="admin-esc-empty"><Text style={s.body}>{t('adminW2.ops.queueEmpty')}</Text></Card> : null}
              {d.escalations.map((e) => (
                <Card key={e.id} testID={`admin-esc-${e.id}`}>
                  <Text style={s.title}>{e.helloHangouts?.name ?? '—'}</Text>
                  <Text style={s.body}>{e.helloHangouts?.address ?? ''}</Text>
                  <Text style={s.body}>{t(`adminW2.ops.reason.${e.reason}`)}</Text>
                  <Text style={s.small}>{t('adminW2.ops.escDetail', { radius: e.radiusMilesApplied ?? '—', rounds: e.rounds ?? '—', when: whenLabel(e.createdAt) })}</Text>
                  {canDecide ? (
                    <View style={s.gap}>
                      <Expand id={e.id} onDone={esc.reload} />
                      <ReasonAction id={`admin-esc-resolve-${e.id}`} label={t('adminW2.ops.resolve')} submit={async (resolution) => {
                        const r = await resolveEscalation(e.id, resolution); return r?.data ? null : r?.error?.code ?? 'fallback';
                      }} onDone={esc.reload} />
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>
          )}
        </Loaded>
      ) : null}

      {tab === 'hardship' ? (
        <Loaded l={hard} id="admin-hardship">
          {(d) => (
            <View style={s.gap}>
              {d.requests.length === 0 ? <Card testID="admin-hardship-empty"><Text style={s.body}>{t('adminW2.ops.hardshipEmpty')}</Text></Card> : null}
              {d.requests.map((r) => (
                <Card key={r.id} testID={`admin-hardship-${r.id}`}>
                  <Text style={s.title}>{r.helloHangouts?.name ?? '—'}</Text>
                  {r.helloHangouts?.priceCents != null ? <Text style={s.body}>{t('adminW2.ops.currentPrice', { amount: formatCents(r.helloHangouts.priceCents) })}</Text> : null}
                  {r.note ? <Text style={s.body}>{r.note}</Text> : null}
                  <Text style={s.small}>{whenLabel(r.createdAt)}</Text>
                  {canDecide ? <Hardship id={r.id} onDone={hard.reload} /> : null}
                </Card>
              ))}
            </View>
          )}
        </Loaded>
      ) : null}

      {tab === 'duplicates' ? (
        <Loaded l={dup} id="admin-dup">
          {(d) => (
            <View style={s.gap}>
              <Text style={s.small}>{t('adminW2.ops.dupLead')}</Text>
              {d.duplicates.length === 0 ? <Card testID="admin-dup-empty"><Text style={s.body}>{t('adminW2.ops.dupEmpty')}</Text></Card> : null}
              {d.duplicates.map((r) => (
                <Card key={r.id} testID={`admin-dup-${r.id}`}>
                  <Text style={s.title}>{r.name}</Text>
                  <Text style={s.body}>{r.address ?? ''}</Text>
                  <Text style={s.small}>{t('adminW2.ops.dupOf', { id: r.locationDuplicateOf ?? '—' })} · {r.status}</Text>
                </Card>
              ))}
            </View>
          )}
        </Loaded>
      ) : null}
    </AdminShell>
  );
}
