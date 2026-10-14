/**
 * HELLO ADMIN › ROLES — NEW-ADM-01 (provisional key in the delivery, not a canonical number).
 * "Job names, never tiers. A role is a bundle of grants." (§6.22, §23.2)
 *
 * The list is every role with how many people hold it — no cap (§23.16). "New role" offers only the
 * permissions the signed-in account itself holds, and the server refuses the rest again: a role may
 * only grant what its granter already holds (§23.5), checked by expanding permissions, never by name.
 * SUPER ADMIN is not a role and does not appear here (§23.15).
 *
 * Giving a role to a specific person has a server route (roles.grant) but no delivered screen, and
 * no source rules how a staff member is identified without exposing personal accounts (§23.12), so it
 * is not on this screen; the screen says so.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { createRole, getPermissions, getRoles, type AdminRole } from '../../src/api/admin';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';

function grantsOf(role: AdminRole): string[] {
  return (role.rolePermissions ?? []).map((rp) => rp.permissions?.name).filter((n): n is string => !!n).sort();
}

export default function AdminRolesScreen() {
  const { me } = useAdminMe();
  const roles = useLoader(async () => {
    const res = await getRoles();
    return res?.data ? { data: res.data.roles } : res && res.error ? { error: res.error } : undefined;
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const permissions = useLoader(async () => {
    const res = await getPermissions();
    return res?.data ? { data: res.data.permissions } : res && res.error ? { error: res.error } : undefined;
  });

  const heldOnly = (permissions.data ?? []).filter((p) => me?.permissions.includes(p.name));
  const valid = /^[a-z_]+$/.test(name) && description.trim().length > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setMessage(null);
    const res = await createRole({ name, description: description.trim(), canCreateRoles: false, permissionIds: picked });
    setBusy(false);
    if (res?.data) {
      setMessage({ kind: 'ok', text: t('admin.roles.created') });
      setOpen(false);
      setName('');
      setDescription('');
      setPicked([]);
      roles.reload();
      return;
    }
    setMessage({ kind: 'error', text: res?.error?.code === 'cannot_grant_unowned_permissions' ? t('admin.roles.cannotGrant') : t('admin.roles.createFailed') });
  }

  return (
    <AdminShell active="roles" title={t('admin.roles.title')} subtitle={t('admin.roles.lead')} refreshing={roles.refreshing} onRefresh={roles.onRefresh} testID="admin-roles">
      {roles.state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="admin-roles-loading" />
      ) : roles.state === 'error' || !roles.data ? (
        <Card tone="error" testID="admin-roles-error">
          <Text accessibilityRole="alert" style={styles.body}>
            {roles.errorCode === 'forbidden' ? t('admin.common.notPermitted') : t('admin.common.loadFailed')}
          </Text>
          <TouchableOpacity onPress={roles.retry} accessibilityRole="button" style={styles.outline} testID="admin-roles-retry">
            <Text style={styles.outlineText}>{t('admin.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          {roles.data.length === 0 ? <Card testID="admin-roles-empty"><Text style={styles.body}>{t('admin.roles.empty')}</Text></Card> : null}
          {roles.data.map((r) => (
            <Card key={r.id} testID={`admin-role-${r.id}`}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <Text style={styles.body}>{r.people === 1 ? t('admin.roles.peopleOne') : t('admin.roles.people', { count: r.people })}</Text>
              </View>
              <Text style={styles.grants}>{grantsOf(r).join(' · ') || t('admin.roles.grantsNothing')}</Text>
              {r.description ? <Text style={styles.body}>{r.description}</Text> : null}
            </Card>
          ))}

          {message ? (
            <Text accessibilityRole={message.kind === 'error' ? 'alert' : undefined} style={[styles.body, message.kind === 'error' && styles.error]} testID="admin-roles-message">{message.text}</Text>
          ) : null}

          {!open ? (
            <TouchableOpacity onPress={() => setOpen(true)} accessibilityRole="button" style={styles.primary} testID="admin-roles-new">
              <Text style={styles.primaryText}>{t('admin.roles.newRole')}</Text>
            </TouchableOpacity>
          ) : (
            <Card testID="admin-roles-form">
              <Text style={styles.cardTitle}>{t('admin.roles.newRole')}</Text>
              <Eyebrow>{t('admin.roles.nameLabel')}</Eyebrow>
              <TextInput value={name} onChangeText={(v) => setName(v.toLowerCase())} autoCapitalize="none" autoCorrect={false} style={styles.input} accessibilityLabel={t('admin.roles.nameLabel')} testID="admin-roles-name" />
              <Eyebrow>{t('admin.roles.descriptionLabel')}</Eyebrow>
              <TextInput value={description} onChangeText={setDescription} style={styles.input} accessibilityLabel={t('admin.roles.descriptionLabel')} testID="admin-roles-description" />
              <Eyebrow>{t('admin.roles.grantsLabel')}</Eyebrow>
              <Text style={styles.body}>{t('admin.roles.holdOnly')}</Text>
              {permissions.state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
              {heldOnly.map((p) => {
                const on = picked.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPicked((cur) => (on ? cur.filter((x) => x !== p.id) : [...cur, p.id]))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={p.name}
                    style={styles.check}
                    testID={`admin-roles-perm-${p.name}`}
                  >
                    <View style={[styles.box, on && styles.boxOn]} />
                    <Text style={styles.grants}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={submit} disabled={!valid || busy} accessibilityRole="button" accessibilityState={{ disabled: !valid || busy }} style={[styles.primary, (!valid || busy) && styles.primaryOff]} testID="admin-roles-create">
                {busy ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.primaryText}>{t('admin.roles.create')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(false)} accessibilityRole="button" style={styles.outline} testID="admin-roles-cancel">
                <Text style={styles.outlineText}>{t('admin.settings.cancel')}</Text>
              </TouchableOpacity>
            </Card>
          )}
          <Text style={styles.small} testID="admin-roles-give-note">{t('admin.roles.giveNote')}</Text>
        </>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  error: { color: Colors.SignalRed },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  grants: { fontSize: 14, lineHeight: 21, color: Colors.Ink, fontFamily: 'Courier' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 16, color: Colors.Ink },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.Ink },
  boxOn: { backgroundColor: Colors.Ink },
  primary: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryOff: { opacity: 0.4 },
  primaryText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
