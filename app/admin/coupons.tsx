/**
 * HELLO ADMIN › COUPONS (MONEY Part 5). A coupon applies to the Hello Hangout MEMBERSHIP only — never the store,
 * never post fees — and carries no attribution (a code attributes; a coupon prices). Value is a fixed amount or a
 * percentage; scope is everybody, a group, or one named person or business; it has a window and use limits.
 * The server refuses a coupon that leaves less than the commission owed and shows why. A coupon is retired with a
 * reason, never deleted. An owner presents the coupon CODE at Hello Hangout checkout (API 085); the list shows how many
 * times each has been used. Looking needs overrides.view; creating or
 * retiring needs overrides.create.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getCoupons, createCoupon, retireCoupon } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Btn, Field, Pill, ReasonAction, Seg, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminCouponsScreen() {
  const { me } = useAdminMe();
  const canCreate = me?.permissions.includes('overrides.create') ?? false;
  const l = useLoader(async () => { const r = await getCoupons(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [valueType, setValueType] = useState<'fixed_cents' | 'percent'>('fixed_cents');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<'everybody' | 'group' | 'named'>('everybody');
  const [label, setLabel] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [targetHangout, setTargetHangout] = useState('');
  const [starts, setStarts] = useState('');
  const [ends, setEnds] = useState('');
  const [total, setTotal] = useState('');
  const [per, setPer] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const amount = valueType === 'fixed_cents' ? Math.round(Number(value) * 100) : Math.round(Number(value));
  const ready = name.trim() && amount > 0 && starts && ends && (scope !== 'group' || label.trim()) && (scope !== 'named' || targetUser.trim() || targetHangout.trim());

  return (
    <AdminShell active="coupons" title={t('adminW2.coupons.title')} subtitle={t('adminW2.coupons.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-coupons">
      <Card testID="admin-coupons-honest"><Text style={s.body}>{t('adminW3.coupons.live')}</Text></Card>
      <Loaded l={l} id="admin-coupons-list">
        {(d) => (
          <View style={s.gap}>
            {d.coupons.length === 0 ? <Card testID="admin-coupons-empty"><Text style={s.body}>{t('adminW2.coupons.empty')}</Text></Card> : null}
            {d.coupons.map((c) => (
              <Card key={c.id} testID={`admin-coupon-${c.id}`}>
                <View style={s.row}><Text style={s.title}>{c.name}</Text><Pill tone={c.status === 'active' ? 'ok' : undefined} text={t(`adminW2.coupons.status.${c.status}`)} /></View>
                <Text style={s.body}>{c.valueType === 'fixed_cents' ? t('adminW2.coupons.offFixed', { amount: formatCents(c.value) }) : t('adminW2.coupons.offPercent', { percent: c.value })} · {t(`adminW2.coupons.scope.${c.scope}`)}{c.scopeLabel ? ` (${c.scopeLabel})` : ''}</Text>
                <Text style={s.small} testID={`admin-coupon-code-${c.id}`}>{c.code ? t('adminW3.coupons.codeLine', { code: c.code }) : t('adminW3.coupons.noCode')}{c.usesRedeemed !== undefined ? ` · ${t('adminW3.coupons.uses', { redeemed: c.usesRedeemed, reserved: c.usesReserved ?? 0 })}` : ''}</Text>
                <Text style={s.small}>{whenLabel(c.startsAt)} → {whenLabel(c.endsAt)} · {t('adminW2.coupons.limits', { total: c.maxTotalUses ?? '—', per: c.maxUsesPerPerson ?? '—' })}</Text>
                {c.retiredReason ? <Text style={s.body}>{c.retiredReason}</Text> : null}
                {canCreate && c.status === 'active' ? (
                  <ReasonAction id={`admin-coupon-retire-${c.id}`} label={t('adminW2.coupons.retire')} submit={async (reason) => { const r = await retireCoupon(c.id, reason); return r?.data ? null : r?.error?.code ?? 'fallback'; }} onDone={l.reload} />
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      {canCreate ? (
        <Card testID="admin-coupons-form">
          <Eyebrow>{t('adminW2.coupons.new')}</Eyebrow>
          <Field label={t('adminW2.coupons.name')} value={name} onChange={setName} testID="admin-coupon-name" />
          <Field label={t('adminW3.coupons.code')} value={code} onChange={setCode} testID="admin-coupon-code" />
          <Text style={s.small}>{t('adminW3.coupons.codeHint')}</Text>
          <Seg id="admin-coupon-type" value={valueType} onChange={setValueType} options={[{ key: 'fixed_cents', label: t('adminW2.coupons.typeFixed') }, { key: 'percent', label: t('adminW2.coupons.typePercent') }]} />
          <Field label={t(valueType === 'fixed_cents' ? 'adminW2.coupons.valueDollars' : 'adminW2.coupons.valuePercent')} value={value} onChange={setValue} keyboard="numeric" testID="admin-coupon-value" />
          <Text style={s.small}>{t('adminW2.coupons.membershipOnly')}</Text>
          <Seg id="admin-coupon-scope" value={scope} onChange={setScope} options={[{ key: 'everybody', label: t('adminW2.coupons.scope.everybody') }, { key: 'group', label: t('adminW2.coupons.scope.group') }, { key: 'named', label: t('adminW2.coupons.scope.named') }]} />
          {scope === 'group' ? <Field label={t('adminW2.coupons.groupLabel')} value={label} onChange={setLabel} testID="admin-coupon-group" /> : null}
          {scope === 'named' ? (
            <>
              <Field label={t('adminW2.coupons.namedUser')} value={targetUser} onChange={setTargetUser} testID="admin-coupon-target-user" />
              <Field label={t('adminW2.coupons.namedHangout')} value={targetHangout} onChange={setTargetHangout} testID="admin-coupon-target-hangout" />
            </>
          ) : null}
          <Field label={t('adminW2.coupons.starts')} value={starts} onChange={setStarts} placeholder="2026-11-01" testID="admin-coupon-starts" />
          <Field label={t('adminW2.coupons.ends')} value={ends} onChange={setEnds} placeholder="2026-12-01" testID="admin-coupon-ends" />
          <Field label={t('adminW2.coupons.maxTotal')} value={total} onChange={setTotal} keyboard="numeric" testID="admin-coupon-total" />
          <Field label={t('adminW2.coupons.maxPer')} value={per} onChange={setPer} keyboard="numeric" testID="admin-coupon-per" />
          {ready ? (
            <ReasonAction id="admin-coupon-create" kind="primary" label={t('adminW2.coupons.create')} submit={async (reason) => {
              const r = await createCoupon({
                name: name.trim(), code: code.trim() ? code.trim().toUpperCase() : undefined, valueType, value: amount, scope,
                scopeLabel: scope === 'group' ? label.trim() : undefined,
                // A named target is a role account or Hello Hangout id (UUID); the server refuses anything else.
                scopeUserId: scope === 'named' && targetUser.trim() ? targetUser.trim() : undefined,
                scopeHelloHangoutId: scope === 'named' && targetHangout.trim() ? targetHangout.trim() : undefined,
                startsAt: new Date(starts).toISOString(), endsAt: new Date(ends).toISOString(),
                maxTotalUses: total ? Number(total) : undefined, maxUsesPerPerson: per ? Number(per) : undefined, reason,
              });
              if (r?.data) { setMessage(null); setName(''); setCode(''); setValue(''); return null; }
              return r?.error?.code ?? 'fallback';
            }} onDone={l.reload} />
          ) : <Btn label={t('adminW2.coupons.create')} kind="outline" disabled onPress={() => setMessage(errorText('validation_error'))} testID="admin-coupon-create-off" />}
          {message ? <Text style={s.body}>{message}</Text> : null}
        </Card>
      ) : null}
    </AdminShell>
  );
}
