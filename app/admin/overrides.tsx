/**
 * HELLO ADMIN › OVERRIDES (RULES §3.2, §3.4, §3.5, §3.8, §3.9; design MN-01 "Price override" / "Overrides — active, with
 * annual cost" / "Override log"). Every active override, who holds it, its value and its annual cost, totalled; a
 * live margin readout while typing; and a LOG (who · when · previous value · why) in place of a floor. "The owner is
 * the floor": no minimum is shown or enforced except that a price of zero cannot be charged. Looking needs
 * overrides.view; setting or removing needs overrides.create (the server checks again and writes Audit).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import {
  getPriceOverrides, findHangoutsForOverride, setPriceOverride, removePriceOverride, type FoundHangout, type PriceOverrideRow,
} from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Btn, Field, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';
import { w3ErrorText } from '../../src/components/admin/storeErrors';

export default function AdminOverridesScreen() {
  const { me } = useAdminMe();
  const canSet = me?.permissions.includes('overrides.create') ?? false;
  const l = useLoader(async () => { const r = await getPriceOverrides(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<FoundHangout[] | null>(null);
  const [chosen, setChosen] = useState<FoundHangout | null>(null);
  const [price, setPrice] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function search() {
    setMsg(null);
    const r = await findHangoutsForOverride(q.trim());
    if (r?.data) setHits(r.data.hangouts); else setMsg(w3ErrorText(r?.error?.code));
  }
  async function set() {
    if (!chosen) return;
    setBusy(true); setMsg(null);
    const r = await setPriceOverride({ helloHangoutId: chosen.id, priceCents: Math.round(Number(price) * 100), reason: reason.trim() });
    setBusy(false);
    if (r?.data) { setChosen(null); setHits(null); setQ(''); setPrice(''); setReason(''); l.reload(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  const cents = Math.round(Number(price) * 100);
  const valid = chosen && price.trim() !== '' && cents > 0 && reason.trim();

  return (
    <AdminShell active="overrides" title={t('adminW3.overrides.title')} subtitle={t('adminW3.overrides.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-overrides">
      <Loaded l={l} id="admin-overrides-data">
        {(d) => (
          <View style={s.gap}>
            {d.active.length === 0 ? <Card testID="admin-overrides-empty"><Text style={s.body}>{t('adminW3.overrides.none')}</Text></Card> : null}
            {d.active.map((o: PriceOverrideRow) => (
              <Card key={o.id} testID={`admin-override-${o.id}`}>
                <View style={s.row}><Text style={s.title}>{o.name}</Text><Pill tone="warn" text={t('adminW3.overrides.statusActive')} /></View>
                <Text style={s.small}>{t('adminW3.overrides.entity')}: {t('adminW3.overrides.entityHangout')} · {t('adminW3.overrides.rule')}: {t('adminW3.overrides.ruleMembership')}</Text>
                <Text style={s.body}>{t('adminW3.overrides.value')}: {formatCents(o.priceCents)} · {t('adminW3.overrides.cost')}: {formatCents(o.annualCostCents)}</Text>
                <Text style={s.small}>{t('adminW3.overrides.setBy')}: {o.setBy ?? '—'} · {whenLabel(o.setAt)}</Text>
                <Text style={s.small}>{o.reason}</Text>
                {canSet ? <ReasonAction id={`admin-override-remove-${o.id}`} label={t('adminW3.overrides.remove')} submit={async (why) => { const r = await removePriceOverride(o.id, why); return r?.data ? null : r?.error?.code ?? 'fallback'; }} onDone={l.reload} /> : null}
              </Card>
            ))}
            <Card testID="admin-overrides-total">
              <View style={s.row}><Text style={s.title}>{t('adminW3.overrides.total')}</Text><Text style={s.title}>{formatCents(d.totalAnnualCostCents)}</Text></View>
              <Text style={s.small}>{t('adminW3.overrides.footnote')}</Text>
            </Card>

            {canSet ? (
              <Card testID="admin-overrides-new">
                <Eyebrow>{t('adminW3.overrides.newTitle')}</Eyebrow>
                <Field label={t('adminW3.overrides.find')} value={q} onChange={setQ} testID="admin-override-find" />
                <Btn kind="outline" label={t('adminW3.overrides.findButton')} disabled={q.trim().length < 2} onPress={search} testID="admin-override-search" />
                {hits && hits.length === 0 ? <Text style={s.body}>{t('adminW3.overrides.findNone')}</Text> : null}
                {(hits ?? []).map((h) => (
                  <View key={h.id} style={s.gap}>
                    <Text style={s.body}>{h.name} · {h.address} · {formatCents(h.priceCents)}</Text>
                    <Btn kind={chosen?.id === h.id ? 'primary' : 'outline'} label={t('adminW3.overrides.pick')} onPress={() => setChosen(h)} testID={`admin-override-pick-${h.id}`} />
                  </View>
                ))}
                {chosen ? (
                  <View style={s.gap}>
                    <Text style={s.title}>{t('adminW3.overrides.chosen', { name: chosen.name, price: formatCents(chosen.priceCents) })}</Text>
                    <Field label={t('adminW3.overrides.price')} value={price} onChange={setPrice} keyboard="numeric" testID="admin-override-price" />
                    {cents > 0 ? (
                      <Text style={s.small} testID="admin-override-margin">
                        {t('adminW3.overrides.margin', { list: formatCents(d.listPriceCents), diff: formatCents(Math.max(0, d.listPriceCents - cents)), commission: formatCents(d.commissionCents), margin: formatCents(cents - d.commissionCents) })}
                      </Text>
                    ) : null}
                    <Field label={t('adminW3.overrides.reason')} value={reason} onChange={setReason} testID="admin-override-reason" />
                    <Btn busy={busy} disabled={!valid} label={t('adminW3.overrides.set')} onPress={set} testID="admin-override-set" />
                  </View>
                ) : null}
                {msg ? <Text style={s.body} accessibilityRole="alert" testID="admin-override-message">{msg}</Text> : null}
              </Card>
            ) : null}

            <Eyebrow>{t('adminW3.overrides.log')}</Eyebrow>
            {d.log.map((o) => (
              <View key={o.id} style={{ gap: 2 }}>
                <Text style={s.small}>{t('adminW3.overrides.logLine', { name: o.name, previous: formatCents(o.previousPriceCents), price: formatCents(o.priceCents), when: whenLabel(o.setAt), by: o.setBy ?? '—' })} · {o.reason}</Text>
                {o.status !== 'active' && o.closedReason ? <Text style={s.small}>{t('adminW3.overrides.logClosed', { reason: o.closedReason })}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
