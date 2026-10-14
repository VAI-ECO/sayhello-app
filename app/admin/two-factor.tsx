/**
 * HELLO ADMIN › TWO-FACTOR — mandatory for every staff account (RULES §23.6, SUPER ADMIN included). The server
 * refuses every other admin route on a session that has not entered a code; this screen is the way through and
 * stays reachable unverified. Four states, all from GET /admin/2fa/status:
 *   not enrolled  → set up an authenticator → confirm a code → recovery codes (shown once) → Hello Admin
 *   enrolled, this session not verified → enter a code (or use a recovery code if the authenticator is lost)
 *   verified      → status, recovery codes left, and a reset to replace the authenticator
 *   locked / not configured → said plainly, never a pretend success
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import {
  getTwoFactorStatus, enrollTwoFactor, confirmTwoFactor, verifyTwoFactor, recoverTwoFactor, resetTwoFactor,
} from '../../src/api/admin-w2';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { Loaded, Btn, Field, Pill, errorText, adminStyles as s } from '../../src/components/admin/AdminParts';

export default function AdminTwoFactorScreen() {
  const router = useRouter();
  const l = useLoader(async () => { const r = await getTwoFactorStatus(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [secret, setSecret] = useState<{ secret: string; uri: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState('');
  const [usingRecovery, setUsingRecovery] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
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
    if (r?.data) { setSecret(null); setCode(''); setRecoveryCodes(r.data.recoveryCodes ?? []); setMessage(t('adminW2.twoFactor.done')); l.reload(); } else setMessage(errorText(r?.error?.code));
  }
  /** A right code opens Hello Admin on this device; a wrong one is said plainly, a lock is named. */
  async function verify() {
    setBusy(true); setMessage(null);
    const r = usingRecovery ? await recoverTwoFactor(code.trim()) : await verifyTwoFactor(code.trim());
    setBusy(false);
    if (r?.data?.valid) {
      setCode('');
      if (usingRecovery) { setUsingRecovery(false); setMessage(t('adminW2.twoFactor.recoveredNow')); l.reload(); return; }
      setMessage(t('adminW2.twoFactor.verifiedNow'));
      router.replace('/admin');
      return;
    }
    setMessage(r?.data ? errorText(r.data.locked ? 'two_factor_locked' : 'code_incorrect') : errorText(r?.error?.code));
    l.reload();
  }
  async function reset() {
    setBusy(true); setMessage(null);
    const r = await resetTwoFactor();
    setBusy(false);
    setConfirmingReset(false);
    if (r?.data?.reset) { setMessage(t('adminW2.twoFactor.resetDone')); l.reload(); } else setMessage(errorText(r?.error?.code));
  }

  return (
    <AdminShell active="home" allowUnverified title={t('adminW2.twoFactor.title')} subtitle={t('adminW2.twoFactor.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-two-factor">
      <Loaded l={l} id="admin-2fa-status">
        {(d) => (
          <View style={s.gap}>
            <Card testID="admin-2fa-state">
              <Pill
                tone={d.confirmed && d.sessionVerified ? 'ok' : 'warn'}
                text={!d.confirmed ? t('adminW2.twoFactor.notEnrolled') : d.sessionVerified ? t('adminW2.twoFactor.verified') : t('adminW2.twoFactor.needsCode')}
              />
              <Text style={s.body}>{t('adminW2.twoFactor.mandatory')}</Text>
              {!d.configured ? <Text style={s.body} testID="admin-2fa-not-configured">{t('adminW2.twoFactor.notConfigured')}</Text> : null}
              {d.lockedSeconds > 0 ? <Text accessibilityRole="alert" style={s.body} testID="admin-2fa-locked">{t('adminW2.twoFactor.locked', { minutes: Math.max(1, Math.ceil(d.lockedSeconds / 60)) })}</Text> : null}
            </Card>

            {recoveryCodes ? (
              <Card testID="admin-2fa-recovery-codes">
                <Text style={s.title}>{t('adminW2.twoFactor.recoveryTitle')}</Text>
                <Text style={s.small}>{t('adminW2.twoFactor.recoveryLead')}</Text>
                {recoveryCodes.map((c) => <Text key={c} style={s.mono} selectable testID="admin-2fa-recovery-code">{c}</Text>)}
                <Btn label={t('adminW2.twoFactor.recoverySaved')} onPress={() => { setRecoveryCodes(null); router.replace('/admin'); }} testID="admin-2fa-recovery-saved" />
              </Card>
            ) : null}

            {d.configured && !d.confirmed && !recoveryCodes ? (
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

            {d.configured && d.confirmed && !d.sessionVerified && !recoveryCodes ? (
              <Card testID="admin-2fa-verify">
                <Text style={s.small}>{t('adminW2.twoFactor.verifyLead')}</Text>
                <Field
                  label={t(usingRecovery ? 'adminW2.twoFactor.recoveryCode' : 'adminW2.twoFactor.code')} value={code} onChange={setCode}
                  keyboard={usingRecovery ? 'default' : 'numeric'} testID="admin-2fa-verify-code"
                />
                <Btn
                  label={t(usingRecovery ? 'adminW2.twoFactor.recoverUse' : 'adminW2.twoFactor.verify')} busy={busy}
                  disabled={d.lockedSeconds > 0 || (usingRecovery ? code.trim().length < 8 : code.trim().length !== 6)}
                  onPress={verify} testID="admin-2fa-verify-go"
                />
                <Btn label={usingRecovery ? t('adminW2.twoFactor.verify') : t('adminW2.twoFactor.lostLink')} kind="outline"
                  onPress={() => { setUsingRecovery(!usingRecovery); setCode(''); setMessage(null); }} testID="admin-2fa-toggle-recovery" />
              </Card>
            ) : null}

            {d.confirmed && d.sessionVerified && !recoveryCodes ? (
              <Card testID="admin-2fa-manage">
                <Text style={s.small} testID="admin-2fa-recovery-left">{t('adminW2.twoFactor.recoveryLeft', { count: d.recoveryCodesRemaining })}</Text>
                <Text style={s.title}>{t('adminW2.twoFactor.resetTitle')}</Text>
                <Text style={s.small}>{t('adminW2.twoFactor.resetLead')}</Text>
                {confirmingReset
                  ? <Btn label={t('adminW2.twoFactor.reset')} busy={busy} onPress={reset} testID="admin-2fa-reset-confirm" />
                  : <Btn label={t('adminW2.twoFactor.reset')} kind="outline" onPress={() => setConfirmingReset(true)} testID="admin-2fa-reset" />}
              </Card>
            ) : null}

            {message ? <Text accessibilityRole="alert" style={s.body} testID="admin-2fa-message">{message}</Text> : null}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
