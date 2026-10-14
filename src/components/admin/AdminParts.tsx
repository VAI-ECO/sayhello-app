/**
 * Shared pieces for the wave-2 Hello Admin screens: a four-state loader frame, a "decision with a reason"
 * control (every consequential action asks for a reason; the server refuses a blank one, §23.9), a segmented
 * switch, buttons and a state pill. No business rule lives here — the server decides and answers.
 */

import { useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { t } from '../../i18n';
import { s1AdminEn } from '../../i18n/s1-admin-en';
import { s3AdminEn } from '../../i18n/s3-admin-en';
import { Colors } from '../../theme/tokens';
import { Card } from '../role/RoleShell';
import type { useLoader } from '../../lib/use-loader';

/** The server's answer for a failed action, in words. Unknown codes fall back to a plain sentence. */
export function errorText(code?: string | null): string {
  if (code && code in s1AdminEn.adminW2.errors) return t(`adminW2.errors.${code}`);
  if (code && code in s3AdminEn.adminW3.errors) return t(`adminW3.errors.${code}`);
  return t('adminW2.errors.fallback');
}

type Loader<T> = ReturnType<typeof useLoader<T>>;

/** loading → error (with retry; "forbidden" says the account does not hold the section) → children(data). */
export function Loaded<T>({ l, id, children }: { l: Loader<T>; id: string; children: (data: T) => ReactNode }) {
  if (l.state === 'loading') return <ActivityIndicator color={Colors.Ink} testID={`${id}-loading`} />;
  if (l.state === 'error' || !l.data) {
    return (
      <Card tone="error" testID={`${id}-error`}>
        <Text accessibilityRole="alert" style={styles.body}>
          {l.errorCode === 'forbidden' ? t('admin.common.notPermitted') : t('admin.common.loadFailed')}
        </Text>
        <Btn label={t('admin.common.retry')} onPress={l.retry} kind="outline" testID={`${id}-retry`} />
      </Card>
    );
  }
  return <>{children(l.data)}</>;
}

export function Btn({ label, onPress, kind = 'primary', busy, disabled, testID }: {
  label: string; onPress: () => void; kind?: 'primary' | 'outline'; busy?: boolean; disabled?: boolean; testID?: string;
}) {
  const off = busy || disabled;
  return (
    <TouchableOpacity onPress={onPress} disabled={off} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!off }}
      style={[kind === 'primary' ? styles.primary : styles.outline, off && styles.off]} testID={testID}>
      {busy ? <ActivityIndicator color={kind === 'primary' ? Colors.Chalk : Colors.Ink} /> : <Text style={kind === 'primary' ? styles.primaryText : styles.outlineText}>{label}</Text>}
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChange, multiline, keyboard, testID, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; keyboard?: 'default' | 'numeric'; testID?: string; placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} multiline={multiline} autoCapitalize="none" autoCorrect={false}
        keyboardType={keyboard === 'numeric' ? 'numeric' : 'default'} placeholder={placeholder}
        style={[styles.input, multiline && styles.multiline]} accessibilityLabel={label} testID={testID} />
    </View>
  );
}

/**
 * An action that needs a written reason. Press the button, write the reason, confirm. `submit` returns an
 * error code (shown in words) or null on success; `onDone` runs after a success so the caller can reload.
 */
export function ReasonAction({ label, confirmLabel, submit, onDone, kind = 'outline', id }: {
  label: string; confirmLabel?: string; submit: (reason: string) => Promise<string | null>; onDone?: () => void; kind?: 'primary' | 'outline'; id: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return <Btn label={label} kind={kind} onPress={() => { setOpen(true); setError(null); }} testID={`${id}-open`} />;
  async function go() {
    if (busy) return;
    if (!reason.trim()) { setError(errorText('reason_required')); return; }
    setBusy(true);
    const code = await submit(reason.trim());
    setBusy(false);
    if (code) { setError(errorText(code)); return; }
    setOpen(false);
    setReason('');
    onDone?.();
  }
  return (
    <View style={styles.form}>
      <Field label={t('adminW2.common.reason')} value={reason} onChange={setReason} testID={`${id}-reason`} />
      <Text style={styles.small}>{t('admin.settings.reasonHint')}</Text>
      <Btn label={confirmLabel ?? label} onPress={go} busy={busy} testID={`${id}-confirm`} />
      <Btn label={t('admin.settings.cancel')} kind="outline" onPress={() => setOpen(false)} testID={`${id}-cancel`} />
      {error ? <Text accessibilityRole="alert" style={styles.error} testID={`${id}-error`}>{error}</Text> : null}
    </View>
  );
}

export function Seg<K extends string>({ value, options, onChange, id }: { value: K; options: { key: K; label: string }[]; onChange: (k: K) => void; id: string }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => (
        <TouchableOpacity key={o.key} onPress={() => onChange(o.key)} accessibilityRole="button" accessibilityState={{ selected: o.key === value }}
          style={[styles.segItem, o.key === value && styles.segActive]} testID={`${id}-${o.key}`}>
          <Text style={[styles.segText, o.key === value && styles.segTextActive]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Pill({ text, tone }: { text: string; tone?: 'ok' | 'warn' | 'error' }) {
  return (
    <View style={[styles.pill, tone === 'ok' && styles.pillOk, tone === 'warn' && styles.pillWarn, tone === 'error' && styles.pillError]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

export const adminStyles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  title: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  mono: { fontSize: 13.5, fontWeight: '700', color: Colors.Ink, fontFamily: 'Courier' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  gap: { gap: 10 },
});

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  form: { gap: 8 },
  field: { gap: 4 },
  label: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: Colors.Faint },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 16, color: Colors.Ink },
  multiline: { minHeight: 160, paddingTop: 12, textAlignVertical: 'top' },
  primary: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  off: { opacity: 0.5 },
  seg: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segItem: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 22, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  segActive: { borderColor: Colors.Ink, backgroundColor: Colors.Ink },
  segText: { fontSize: 15, fontWeight: '600', color: Colors.Muted },
  segTextActive: { color: Colors.Chalk },
  pill: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#F2EFEB' },
  pillOk: { backgroundColor: '#E3EFE6' },
  pillWarn: { backgroundColor: '#F6EBD3' },
  pillError: { backgroundColor: '#F4DEDA' },
  pillText: { fontSize: 13, fontWeight: '700', color: Colors.Ink },
});
