/**
 * HELLO ADMIN › STAFF — who holds a Hello Admin role, and giving or removing one (RULES §23.2, §23.5, §23.11-23.12).
 * Only ROLE accounts can be found here: a personal account is never listed, searched or identified (§23.12), and
 * the server refuses an assignment to one. A role may only be given by someone who already holds everything it
 * grants (§23.5, checked by expanding permissions, never by name). The SUPER ADMIN account cannot be locked out
 * (§23.1): the server refuses to remove a role from it. This screen does not pick, create or name a SUPER ADMIN
 * and does not enrol two-factor: naming a SUPER ADMIN is an owner fact (operator script, never this screen), and
 * two-factor enrolment lives on its own screen (§23.6; the server gates every staff route on it).
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { lookupMembers, getStaff, getRoleChoices, assignRole, revokeRole, type MemberHit } from '../../src/api/admin-w2';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminStaffScreen() {
  const { me } = useAdminMe();
  const canGrant = me?.permissions.includes('roles.grant') ?? false;
  const staff = useLoader(async () => { const r = await getStaff(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const roles = useLoader(async () => { const r = await getRoleChoices(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<MemberHit[] | null>(null);
  const [chosen, setChosen] = useState<MemberHit | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    setBusy(true); setMessage(null);
    const r = await lookupMembers(q.trim());
    setBusy(false);
    if (r?.data) setHits(r.data.members); else setMessage(errorText(r?.error?.code));
  }
  async function give(roleId: string) {
    if (!chosen) return;
    setBusy(true); setMessage(null);
    const r = await assignRole(chosen.id, roleId);
    setBusy(false);
    if (r?.data) { setMessage(t('adminW2.staff.given')); setChosen(null); setHits(null); staff.reload(); } else setMessage(errorText(r?.error?.code));
  }
  async function take(userId: string, roleId: string) {
    setBusy(true); setMessage(null);
    const r = await revokeRole(userId, roleId);
    setBusy(false);
    if (r?.data !== undefined && !r.error) { setMessage(t('adminW2.staff.removed')); staff.reload(); } else setMessage(errorText(r?.error?.code));
  }

  return (
    <AdminShell active="staff" title={t('adminW2.staff.title')} subtitle={t('adminW2.staff.lead')} refreshing={staff.refreshing} onRefresh={staff.onRefresh} testID="admin-staff">
      {message ? <Text accessibilityRole="alert" style={s.body} testID="admin-staff-message">{message}</Text> : null}
      <Loaded l={staff} id="admin-staff-list">
        {(d) => (
          <View style={s.gap}>
            {d.staff.length === 0 ? <Card testID="admin-staff-empty"><Text style={s.body}>{t('adminW2.staff.empty')}</Text></Card> : null}
            {d.staff.map((p) => (
              <Card key={p.userId} testID={`admin-staff-${p.userId}`}>
                <Text style={s.title}>{p.displayName ?? t('adminW2.reports.unnamed')}</Text>
                {p.roles.map((r) => (
                  <View key={r.roleId} style={s.gap}>
                    <Text style={s.body}>{r.name} · {whenLabel(r.assignedAt)}</Text>
                    {canGrant ? <Btn label={t('adminW2.staff.remove', { role: r.name })} kind="outline" busy={busy} onPress={() => take(p.userId, r.roleId)} testID={`admin-staff-remove-${p.userId}-${r.roleId}`} /> : null}
                  </View>
                ))}
              </Card>
            ))}
          </View>
        )}
      </Loaded>

      {canGrant ? (
        <Card testID="admin-staff-give">
          <Eyebrow>{t('adminW2.staff.give')}</Eyebrow>
          <Text style={s.small}>{t('adminW2.staff.roleAccountsOnly')}</Text>
          <Field label={t('adminW2.staff.search')} value={q} onChange={setQ} testID="admin-staff-search" />
          <Btn label={t('adminW2.staff.searchButton')} kind="outline" disabled={q.trim().length < 2} busy={busy} onPress={search} testID="admin-staff-search-button" />
          {hits && hits.length === 0 ? <Text style={s.body} testID="admin-staff-nohits">{t('adminW2.staff.noHits')}</Text> : null}
          {(hits ?? []).map((h) => (
            <Btn key={h.id} label={`${h.displayName ?? t('adminW2.reports.unnamed')} · ${h.role}`} kind={chosen?.id === h.id ? 'primary' : 'outline'} onPress={() => setChosen(h)} testID={`admin-staff-hit-${h.id}`} />
          ))}
          {chosen ? (
            <Loaded l={roles} id="admin-staff-roles">
              {(r) => (
                <View style={s.gap}>
                  <Text style={s.small}>{t('adminW2.staff.chooseRole', { name: chosen.displayName ?? '' })}</Text>
                  {r.roles.map((x) => <Btn key={x.id} label={x.name} busy={busy} onPress={() => give(x.id)} testID={`admin-staff-give-${x.id}`} />)}
                </View>
              )}
            </Loaded>
          ) : null}
        </Card>
      ) : null}
    </AdminShell>
  );
}
