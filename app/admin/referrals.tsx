/**
 * HELLO ADMIN › REFERRALS — places members sent as Hello Hangout referrals (RULES §4.11, API 086). A referral pays POINTS
 * only, once, and only after the referred Hello Hangout has paid; the figure is the setting
 * points_hangout_referral_converted. Linking a referral to its paid Hello Hangout awards the points; closing one
 * takes a reason. Looking needs overrides.view; deciding needs overrides.create (the server checks and writes Audit).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getAdminReferrals, convertReferral, voidReferral, type AdminReferralRow } from '../../src/api/referrals';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, Pill, ReasonAction, Seg, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

function Row({ r, canDecide, onDone }: { r: AdminReferralRow; canDecide: boolean; onDone: () => void }) {
  const [hid, setHid] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function link() {
    setBusy(true); setMsg(null);
    const x = await convertReferral(r.id, hid.trim(), reason.trim());
    setBusy(false);
    if (x?.data) onDone(); else setMsg(errorText(x?.error?.code));
  }
  return (
    <Card testID={`admin-referral-${r.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{r.placeName}</Text>
        <Pill tone={r.status === 'converted' ? 'ok' : r.status === 'void' ? undefined : 'warn'} text={t(`referral.status.${r.status}`)} />
      </View>
      {r.address ? <Text style={s.body}>{r.address}</Text> : null}
      {r.note ? <Text style={s.body}>{r.note}</Text> : null}
      <Text style={s.small}>{t('referral.admin.by', { when: whenLabel(r.createdAt) })}{r.status === 'converted' && r.pointsAwarded !== null ? ` · ${t('referral.admin.awarded', { points: r.pointsAwarded })}` : ''}</Text>
      {r.decisionReason ? <Text style={s.small}>{r.decisionReason}</Text> : null}
      {canDecide && r.status === 'submitted' ? (
        <View style={s.gap}>
          <Text style={s.small}>{t('referral.admin.link')}</Text>
          <Field label={t('referral.admin.hangoutId')} value={hid} onChange={setHid} testID={`admin-referral-hangout-${r.id}`} />
          <Field label={t('adminW2.common.reason')} value={reason} onChange={setReason} testID={`admin-referral-reason-${r.id}`} />
          <Btn busy={busy} disabled={!hid.trim() || !reason.trim()} label={t('referral.admin.convert')} onPress={link} testID={`admin-referral-convert-${r.id}`} />
          <ReasonAction id={`admin-referral-void-${r.id}`} label={t('referral.admin.void')} submit={async (why) => { const x = await voidReferral(r.id, why); return x?.data ? null : x?.error?.code ?? 'fallback'; }} onDone={onDone} />
          {msg ? <Text style={s.body} accessibilityRole="alert">{msg}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

export default function AdminReferralsScreen() {
  const { me } = useAdminMe();
  const canDecide = me?.permissions.includes('overrides.create') ?? false;
  const [f, setF] = useState<'submitted' | 'converted' | 'void' | 'all'>('submitted');
  const l = useLoader(async () => { const r = await getAdminReferrals(f === 'all' ? undefined : f); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  return (
    <AdminShell active="referrals" title={t('referral.admin.title')} subtitle={t('referral.admin.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-referrals">
      <Seg id="admin-referrals-filter" value={f} onChange={(k) => { setF(k); setTimeout(l.reload, 0); }} options={[
        { key: 'submitted', label: t('referral.admin.filterOpen') }, { key: 'converted', label: t('referral.admin.filterConverted') },
        { key: 'void', label: t('referral.admin.filterVoid') }, { key: 'all', label: t('referral.admin.filterAll') }]} />
      <Loaded l={l} id="admin-referrals-list">
        {(d) => (
          <View style={s.gap}>
            {d.referrals.length === 0 ? <Card testID="admin-referrals-empty"><Text style={s.body}>{t('referral.admin.empty')}</Text></Card> : null}
            {d.referrals.map((r) => <Row key={r.id} r={r} canDecide={canDecide} onDone={l.reload} />)}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
