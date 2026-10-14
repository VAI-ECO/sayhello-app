/**
 * HELLO ADMIN › SETTINGS — the Settings table editor (MN-01-SN-13): "Every figure in the product, in one
 * table. A key that is not live does not exist." (RULES §27.7.) Each row shows the key, what it governs,
 * its value, and who last changed it and when.
 *
 * A change asks for a reason and names it: every change writes who, when, the previous value and why to
 * Audit, and the reason cannot be blank (Reserved Screens frame; enforced by the server). One-way and
 * combined rules (the points reset floor is upward only; a coupon may not leave less than the commission
 * owed) are enforced by the server and its answer is shown as it is. Looking needs settings.view; the
 * Change control appears only for an account that holds settings.edit — and the server checks again.
 *
 * There is no "Add a key": keys are seeded by migration, not invented in a screen.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { clearDemoAccount, getSettings, setDemoAccount, updateSetting, type AdminSetting } from '../../src/api/admin';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { errorText } from '../../src/components/admin/AdminParts';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';

/** The two demo-account keys are shown in the table but changed only through the demo account section. */
const DEMO_KEYS = ['review_account_phone', 'review_account_code_hash'];

const KNOWN_ERRORS = ['upward_only', 'coupon_below_commission', 'value_too_small', 'value_too_large', 'invalid_integer', 'invalid_boolean', 'reason_required', 'setting_not_found'];

export default function AdminSettingsScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const list = useLoader(async () => {
    const res = await getSettings();
    return res?.data
      ? {
          data: [
            ...res.data.settings,
            ...(res.data.unset ?? []).map((u): AdminSetting => ({ key: u.key, value: '', valueType: 'integer', category: u.category, description: u.description, validationRules: { min: u.min }, updatedAt: '', updatedByName: null, notSet: true })),
          ],
        }
      : res && res.error ? { error: res.error } : undefined;
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ key: string; kind: 'ok' | 'error'; text: string } | null>(null);
  const [demoPhone, setDemoPhone] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [demoReason, setDemoReason] = useState('');
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoMessage, setDemoMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  function begin(s: AdminSetting) {
    setEditing(s.key);
    setValue(s.value);
    setReason('');
    setFeedback(null);
  }

  async function save(s: AdminSetting) {
    if (busy) return;
    if (reason.trim().length === 0) {
      setFeedback({ key: s.key, kind: 'error', text: t('admin.settings.reasonRequired') });
      return;
    }
    setBusy(true);
    const res = await updateSetting(s.key, value, reason.trim());
    setBusy(false);
    if (res?.data) {
      setEditing(null);
      setFeedback({ key: s.key, kind: 'ok', text: t('admin.settings.saved') });
      list.reload();
      return;
    }
    const code = res?.error?.code ?? '';
    setFeedback({ key: s.key, kind: 'error', text: KNOWN_ERRORS.includes(code) ? t(`admin.settings.errors.${code}`) : errorText(code) });
  }

  const demoRow = (list.data ?? []).find((r) => r.key === 'review_account_phone');
  const demoOn = Boolean(demoRow?.value) && Boolean((list.data ?? []).find((r) => r.key === 'review_account_code_hash')?.value);

  async function turnOnDemo() {
    if (demoBusy) return;
    if (!/^\+\d{8,15}$/.test(demoPhone.trim()) || !/^\d{6}$/.test(demoCode) || demoReason.trim().length === 0) {
      setDemoMessage({ kind: 'error', text: t('w8b.demo.invalid') });
      return;
    }
    setDemoBusy(true);
    const res = await setDemoAccount(demoPhone.trim(), demoCode, demoReason.trim());
    setDemoBusy(false);
    if (res?.data) {
      setDemoCode('');
      setDemoMessage({ kind: 'ok', text: t('w8b.demo.saved') });
      list.reload();
    } else {
      setDemoMessage({ kind: 'error', text: res?.error?.code === 'invalid_request' ? t('w8b.demo.invalid') : t('w8b.demo.failed') });
    }
  }

  async function turnOffDemo() {
    if (demoBusy) return;
    if (demoReason.trim().length === 0) { setDemoMessage({ kind: 'error', text: t('w8b.demo.invalid') }); return; }
    setDemoBusy(true);
    const res = await clearDemoAccount(demoReason.trim());
    setDemoBusy(false);
    if (res?.data) {
      setDemoMessage({ kind: 'ok', text: t('w8b.demo.cleared') });
      list.reload();
    } else {
      setDemoMessage({ kind: 'error', text: t('w8b.demo.failed') });
    }
  }

  const byCategory = new Map<string, AdminSetting[]>();
  for (const s of list.data ?? []) byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);

  return (
    <AdminShell active="settings" title={t('admin.settings.title')} subtitle={t('admin.settings.lead')} refreshing={list.refreshing} onRefresh={list.onRefresh} testID="admin-settings">
      {list.state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="admin-settings-loading" />
      ) : list.state === 'error' || !list.data ? (
        <Card tone="error" testID="admin-settings-error">
          <Text accessibilityRole="alert" style={styles.body}>
            {list.errorCode === 'forbidden' ? t('admin.common.notPermitted') : t('admin.common.loadFailed')}
          </Text>
          <TouchableOpacity onPress={list.retry} accessibilityRole="button" style={styles.outline} testID="admin-settings-retry">
            <Text style={styles.outlineText}>{t('admin.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : list.data.length === 0 ? (
        <Card testID="admin-settings-empty"><Text style={styles.body}>{t('admin.settings.empty')}</Text></Card>
      ) : (
        <>
          {!canEdit && me ? <Text style={styles.small} testID="admin-settings-view-only">{t('admin.settings.viewOnly')}</Text> : null}
          {canEdit ? (
            <Card testID="admin-demo-account">
              <Eyebrow>{t('w8b.demo.title')}</Eyebrow>
              <Text style={styles.body}>{t('w8b.demo.lead')}</Text>
              <Text style={styles.value} testID="admin-demo-state">{demoOn ? t('w8b.demo.on', { phone: demoRow?.value ?? '' }) : t('w8b.demo.off')}</Text>
              <View style={styles.form}>
                <Eyebrow>{t('w8b.demo.phone')}</Eyebrow>
                <TextInput value={demoPhone} onChangeText={setDemoPhone} keyboardType="phone-pad" autoCapitalize="none" autoCorrect={false} style={styles.input} accessibilityLabel={t('w8b.demo.phone')} testID="admin-demo-phone" />
                <Text style={styles.small}>{t('w8b.demo.phoneHint')}</Text>
                <Eyebrow>{t('w8b.demo.code')}</Eyebrow>
                <TextInput value={demoCode} onChangeText={setDemoCode} keyboardType="number-pad" maxLength={6} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} accessibilityLabel={t('w8b.demo.code')} testID="admin-demo-code" />
                <Text style={styles.small}>{t('w8b.demo.codeHint')}</Text>
                <Eyebrow>{t('w8b.demo.reason')}</Eyebrow>
                <TextInput value={demoReason} onChangeText={setDemoReason} style={styles.input} accessibilityLabel={t('w8b.demo.reason')} testID="admin-demo-reason" />
                <TouchableOpacity onPress={turnOnDemo} disabled={demoBusy} accessibilityRole="button" accessibilityState={{ disabled: demoBusy }} style={styles.primary} testID="admin-demo-on">
                  {demoBusy ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.primaryText}>{t('w8b.demo.turnOn')}</Text>}
                </TouchableOpacity>
                {demoOn ? (
                  <TouchableOpacity onPress={turnOffDemo} disabled={demoBusy} accessibilityRole="button" style={styles.outline} testID="admin-demo-off">
                    <Text style={styles.outlineText}>{t('w8b.demo.turnOff')}</Text>
                  </TouchableOpacity>
                ) : null}
                {demoMessage ? (
                  <Text accessibilityRole={demoMessage.kind === 'error' ? 'alert' : undefined} style={[styles.body, demoMessage.kind === 'error' && styles.error]} testID="admin-demo-message">{demoMessage.text}</Text>
                ) : null}
              </View>
            </Card>
          ) : null}
          {[...byCategory.entries()].map(([category, rows]) => (
            <View key={category} style={styles.group}>
              <Eyebrow>{category}</Eyebrow>
              {rows.map((s) => (
                <Card key={s.key} testID={`admin-setting-${s.key}`}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.key}>{s.key}</Text>
                    <Text style={styles.value} testID={`admin-setting-value-${s.key}`}>{s.notSet ? t('adminW2.settings.notSet') : s.value || (DEMO_KEYS.includes(s.key) ? t('w8b.demo.off') : '')}</Text>
                  </View>
                  <Text style={styles.body}>{s.description}</Text>
                  <Text style={styles.small}>
                    {s.updatedByName ? t('admin.settings.lastChanged', { name: s.updatedByName, when: whenLabel(s.updatedAt) }) : t('admin.settings.neverChanged')}
                  </Text>

                  {editing === s.key ? (
                    <View style={styles.form}>
                      <Eyebrow>{t('admin.settings.newValue')}</Eyebrow>
                      <TextInput value={value} onChangeText={setValue} autoCapitalize="none" autoCorrect={false} style={styles.input} accessibilityLabel={t('admin.settings.newValue')} testID={`admin-setting-input-${s.key}`} />
                      <Eyebrow>{t('admin.settings.reasonLabel')}</Eyebrow>
                      <TextInput value={reason} onChangeText={setReason} style={styles.input} accessibilityLabel={t('admin.settings.reasonLabel')} testID={`admin-setting-reason-${s.key}`} />
                      <Text style={styles.small}>{t('admin.settings.reasonHint')}</Text>
                      <TouchableOpacity onPress={() => save(s)} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy }} style={styles.primary} testID={`admin-setting-save-${s.key}`}>
                        {busy ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.primaryText}>{t('admin.settings.save')}</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditing(null)} accessibilityRole="button" style={styles.outline} testID={`admin-setting-cancel-${s.key}`}>
                        <Text style={styles.outlineText}>{t('admin.settings.cancel')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : canEdit && DEMO_KEYS.includes(s.key) ? (
                    <Text style={styles.small} testID={`admin-setting-managed-${s.key}`}>{t('w8b.demo.managedAbove')}</Text>
                  ) : canEdit ? (
                    <TouchableOpacity onPress={() => begin(s)} accessibilityRole="button" accessibilityLabel={`${t('admin.settings.change')} ${s.key}`} style={styles.outline} testID={`admin-setting-change-${s.key}`}>
                      <Text style={styles.outlineText}>{t('admin.settings.change')}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {feedback?.key === s.key ? (
                    <Text accessibilityRole={feedback.kind === 'error' ? 'alert' : undefined} style={[styles.body, feedback.kind === 'error' && styles.error]} testID={`admin-setting-feedback-${s.key}`}>{feedback.text}</Text>
                  ) : null}
                </Card>
              ))}
            </View>
          ))}
        </>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  error: { color: Colors.SignalRed },
  group: { gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  key: { fontSize: 14, fontWeight: '700', color: Colors.Ink, fontFamily: 'Courier', flexShrink: 1 },
  value: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  form: { gap: 8 },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 16, color: Colors.Ink },
  primary: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
