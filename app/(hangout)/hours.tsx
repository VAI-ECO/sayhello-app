/**
 * HELLO HANGOUT HOURS — CANON-RL-02-SN-16 (Reserved Screens P 375; T 834 in
 * "Reserved Screens Delivered at T 834"; D 1440 in batch-03 missing sizes).
 * "When you're open. Shows on your page." Seven days, open–close, a switch per day.
 * Times are typed as 24-hour HH:MM — no time-picker dependency is installed.
 *
 * Saves the hours into the page DRAFT (PUT /hello-hangouts/:id/directory, the
 * whole draft with the new hours); the page shows them once published.
 * The frame's line "Deals and events use these hours unless you say otherwise" is
 * NOT shown: no deal or event reads these hours, so the sentence would be false.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { KeyboardAware } from '../../src/components/KeyboardAware';
import { DAYS, getDirectoryDraft, saveDirectoryDraft, type DirectoryDraft, type Hours } from '../../src/api/directory';
import { emptyHours, isValidClock } from '../../src/lib/hangout-hours';

export default function HoursScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [draft, setDraft] = useState<DirectoryDraft | null>(null);
  const [hours, setHours] = useState<Hours>(emptyHours());
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const res = await getDirectoryDraft(helloHangoutId);
    if (res.error) {
      if (res.error.status === 403 || res.error.status === 404) { router.back(); return; }
      setState('error');
      return;
    }
    const dir = res.data?.directory;
    if (!dir?.available || !dir.draft) { setState('unavailable'); return; }
    setDraft(dir.draft);
    setHours({ ...emptyHours(), ...(dir.draft.hours ?? {}) });
    setState('ready');
  }, [helloHangoutId, router]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const invalid = DAYS.some((d) => {
    const h = hours[d];
    return h && !h.closed && !(isValidClock(h.open) && isValidClock(h.close));
  });

  async function save() {
    if (!draft || !helloHangoutId || saving) return;
    if (invalid) { setMessage({ kind: 'error', text: t('hangout.hours.invalid') }); return; }
    setSaving(true);
    setMessage(null);
    const clean = Object.fromEntries(DAYS.map((d) => {
      const h = hours[d] ?? { closed: true };
      return [d, h.closed ? { closed: true, open: null, close: null } : { closed: false, open: h.open, close: h.close }];
    })) as Hours;
    const res = await saveDirectoryDraft(helloHangoutId, { ...draft, hours: clean });
    setSaving(false);
    if (res.error) {
      setMessage({ kind: 'error', text: res.error.status === 503 ? t('hangout.edit.unavailable') : t('hangout.edit.saveFailed') });
      return;
    }
    setDraft({ ...draft, hours: clean });
    setMessage({ kind: 'ok', text: t('hangout.edit.saved') });
  }

  const setDay = (day: (typeof DAYS)[number], patch: Partial<{ closed: boolean; open: string | null; close: string | null }>) => {
    setMessage(null);
    setHours((h) => ({ ...h, [day]: { ...(h[day] ?? { closed: true }), ...patch } }));
  };

  return (
    <KeyboardAware style={styles.container}>
      <StatusBarSpacer height={44} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangout.hours.title')}</Text>
        <Text style={styles.sub}>{t('hangout.hours.sub')}</Text>
      </View>
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'unavailable' ? <Text style={[styles.sub, styles.pad]} testID="hours-unavailable">{t('hangout.edit.unavailable')}</Text> : null}
      {state === 'error' ? (
        <TouchableOpacity style={styles.pad} onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
          <Text accessibilityRole="alert" style={styles.sub}>{t('hangout.dashboard.loadFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      ) : null}
      {state === 'ready' ? (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {DAYS.map((day) => {
            const h = hours[day] ?? { closed: true };
            const label = t(`hangout.hours.days.${day}`);
            return (
              <View key={day} style={[styles.row, h.closed && styles.rowClosed]} testID={`hours-${day}`}>
                <Text style={styles.day}>{label}</Text>
                {h.closed ? (
                  <Text style={[styles.closed, { flex: 1 }]}>{t('hangout.hours.closed')}</Text>
                ) : (
                  <View style={styles.times}>
                    <TextInput value={h.open ?? ''} onChangeText={(v) => setDay(day, { open: v })} placeholder="09:00" style={styles.time} maxLength={5} accessibilityLabel={`${label} open`} testID={`hours-${day}-open`} />
                    <Text style={styles.to}>{t('hangout.hours.to')}</Text>
                    <TextInput value={h.close ?? ''} onChangeText={(v) => setDay(day, { close: v })} placeholder="17:00" style={styles.time} maxLength={5} accessibilityLabel={`${label} close`} testID={`hours-${day}-close`} />
                  </View>
                )}
                <Switch value={!h.closed} onValueChange={(on) => setDay(day, { closed: !on })} accessibilityLabel={label} testID={`hours-${day}-open-switch`} />
              </View>
            );
          })}
          {message ? <Text accessibilityRole={message.kind === 'error' ? 'alert' : undefined} style={message.kind === 'error' ? styles.error : styles.ok} testID="hours-message">{message.text}</Text> : null}
          <TouchableOpacity style={[styles.save, saving && styles.disabled]} onPress={() => void save()} disabled={saving} accessibilityRole="button" accessibilityState={{ busy: saving }} testID="hours-save">
            <Text style={styles.saveText}>{t(saving ? 'hangout.edit.saving' : 'hangout.hours.save')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </KeyboardAware>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDEA' },
  header: { paddingHorizontal: 24, paddingTop: 8, gap: 5 },
  back: { fontSize: 24, color: Colors.Ink },
  title: { fontSize: 24, fontWeight: '700', color: Colors.Ink },
  sub: { fontSize: 13.5, lineHeight: 19, color: '#5C574F' },
  pad: { paddingHorizontal: 24, paddingTop: 12 },
  list: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40, gap: 8, maxWidth: 640, width: '100%', alignSelf: 'center' },
  row: { backgroundColor: Colors.Chalk, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  rowClosed: { opacity: 0.6 },
  day: { width: 42, fontSize: 13.5, fontWeight: '700', color: Colors.Ink },
  times: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  time: { flex: 1, height: 38, borderWidth: 1, borderColor: '#CBC5BC', borderRadius: 9, backgroundColor: '#FAF9F7', paddingHorizontal: 10, fontSize: 13, color: '#5C574F' },
  to: { fontSize: 12, color: '#8A857E' },
  closed: { fontSize: 13.5, color: '#8A857E' },
  save: { height: 52, borderRadius: 14, backgroundColor: Colors.Ink, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { color: Colors.Chalk, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  error: { fontSize: 14, color: Colors.SignalRed },
  ok: { fontSize: 14, color: Colors.DeepFern },
});
