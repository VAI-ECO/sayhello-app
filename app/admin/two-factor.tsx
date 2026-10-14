/**
 * HELLO ADMIN › TWO-FACTOR — enrol an authenticator app for this staff account (RULES §23.6). Plumbing only:
 * enrolment works when the server has its encryption key; where a code is DEMANDED is not decided yet, so this
 * screen says plainly that two-factor is mandatory and not enforced yet. The secret is shown once, now.
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import { getTwoFactorStatus, enrollTwoFactor, confirmTwoFactor } from '../../src/api/admin-w2';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Btn, Field, Pill, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminTwoFactorScreen() {
  const l = useLoader(async () => { const r = await getTwoFactorStatus(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [secret, setSecret] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function start() {
    setBusy(true); setMessage(null);
    const r = await enrollTwoFactor();
    setBusy(false);
    if (r?.data) setSecret({ secret: r.data.secret, uri: r.data.otpauthUri }); else setMessage(errorText(r?.error?.code));
  }
  async function confirm() {
    setBusy(true); setMessage(null);
    const r = await confirmTwoFactor(code.trim());
    setBusy(false);
    if (r?.data) { setSecret(null); setCode(''); setMessage(t('adminW2.twoFactor.done')); l.reload(); } else setMessage(errorText(r?.error?.code));
  }

  return (
    <AdminShell active="home" title={t('adminW2.twoFactor.title')} subtitle={t('adminW2.twoFactor.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-two-factor">
      <Loaded l={l} id="admin-2fa-status">
        {(d) => (
          <View style={s.gap}>
            <Card testID="admin-2fa-state">
              <Pill tone={d.confirmed ? 'ok' : 'warn'} text={t(d.confirmed ? 'adminW2.twoFactor.enrolled' : 'adminW2.twoFactor.notEnrolled')} />
              <Text style={s.body}>{t('adminW2.twoFactor.notEnforced')}</Text>
              {!d.configured ? <Text style={s.body}>{t('adminW2.twoFactor.notConfigured')}</Text> : null}
            </Card>
            {d.configured && !d.confirmed ? (
              secret ? (
                <Card testID="admin-2fa-secret">
                  <Text style={s.small}>{t('adminW2.twoFactor.secretLead')}</Text>
                  <Text style={s.mono} selectable testID="admin-2fa-secret-text">{secret.secret}</Text>
                  <Text style={s.small} selectable>{secret.uri}</Text>
                  <Field label={t('adminW2.twoFactor.code')} value={code} onChange={setCode} keyboard="numeric" testID="admin-2fa-code" />
                  <Btn label={t('adminW2.twoFactor.confirm')} busy={busy} disabled={code.trim().length !== 6} onPress={confirm} testID="admin-2fa-confirm" />
                </Card>
              ) : <Btn label={t('adminW2.twoFactor.start')} busy={busy} onPress={start} testID="admin-2fa-start" />
            ) : null}
            {message ? <Text accessibilityRole="alert" style={s.body} testID="admin-2fa-message">{message}</Text> : null}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
