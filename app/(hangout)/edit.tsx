/**
 * EDIT YOUR PAGE — the Hello Hangout fills out its directory page (RULES §17.19).
 * ⚠️ No delivered frame exists for this form: the delivered owner frames are the
 * "Your listing · Preview" screen with an Edit button (8l) and the hours editor
 * (SN-16). The fields are exactly the ones the delivered page frames show; the
 * layout reuses the hours editor's card style. Recorded as an undelivered screen.
 *
 * GET / PUT /hello-hangouts/:id/directory — the owner is checked on the server.
 * Saving writes the DRAFT only; nothing is public until Publish on the preview.
 * The pin is set from the device's own location at the venue (no geocoding
 * provider exists to turn the address into a pin).
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { getDirectoryDraft, saveDirectoryDraft, type DirectoryDraft } from '../../src/api/directory';

export default function EditDirectoryScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [draft, setDraft] = useState<DirectoryDraft | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [amenity, setAmenity] = useState('');
  const [locating, setLocating] = useState(false);

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
    const server = dir.draft;
    // Back from the hours editor (which saves the hours itself): take the server's
    // hours, keep any unsaved edits made on this screen.
    setDraft((current) => (current ? { ...current, hours: server.hours } : server));
    setState('ready');
  }, [helloHangoutId, router]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const set = <K extends keyof DirectoryDraft>(key: K, value: DirectoryDraft[K]) => {
    setMessage(null);
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  async function pinHere() {
    setLocating(true);
    setMessage(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setMessage({ kind: 'error', text: t('hangout.edit.pinDenied') }); return; }
      const pos = await Location.getCurrentPositionAsync({});
      set('lat', pos.coords.latitude);
      set('lng', pos.coords.longitude);
    } catch {
      setMessage({ kind: 'error', text: t('hangout.edit.pinFailed') });
    } finally {
      setLocating(false);
    }
  }

  async function save() {
    if (!draft || !helloHangoutId || saving) return;
    setSaving(true);
    setMessage(null);
    const res = await saveDirectoryDraft(helloHangoutId, {
      ...draft,
      name: draft.name.trim(),
      address: draft.address.trim(),
      description: (draft.description ?? '').trim(),
      phone: (draft.phone ?? '').trim(),
      website: (draft.website ?? '').trim(),
    });
    setSaving(false);
    if (res.error) {
      setMessage({ kind: 'error', text: res.error.status === 400 ? t('hangout.edit.invalid') : res.error.status === 503 ? t('hangout.edit.unavailable') : t('hangout.edit.saveFailed') });
      return;
    }
    if (res.data?.directory.draft) setDraft(res.data.directory.draft);
    setMessage({ kind: 'ok', text: t('hangout.edit.saved') });
  }

  const pinSet = draft?.lat != null && draft?.lng != null && !(draft.lat === 0 && draft.lng === 0);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBarSpacer height={44} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('hangout.edit.title')}</Text>
          <Text style={styles.sub}>{t('hangout.edit.sub')}</Text>
        </View>
      </View>
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'unavailable' ? <Text style={[styles.sub, styles.pad]} testID="edit-unavailable">{t('hangout.edit.unavailable')}</Text> : null}
      {state === 'error' ? (
        <TouchableOpacity style={styles.pad} onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
          <Text accessibilityRole="alert" style={styles.sub}>{t('hangout.dashboard.loadFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      ) : null}
      {state === 'ready' && draft ? (
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label={t('hangout.edit.name')} value={draft.name} onChange={(v) => set('name', v)} testID="edit-name" />
          <Field label={t('hangout.edit.address')} value={draft.address} onChange={(v) => set('address', v)} testID="edit-address" />
          <View style={styles.card}>
            <Text style={styles.label}>{t('hangout.edit.pin')}</Text>
            <Text style={styles.value} testID="edit-pin-state">{t(pinSet ? 'hangout.edit.pinSet' : 'hangout.edit.pinNotSet')}</Text>
            <TouchableOpacity style={styles.outline} onPress={() => void pinHere()} disabled={locating} accessibilityRole="button" testID="edit-pin-here">
              {locating ? <ActivityIndicator color={Colors.Ink} /> : <Text style={styles.outlineText}>{t('hangout.edit.pinHere')}</Text>}
            </TouchableOpacity>
          </View>
          <Field label={t('hangout.edit.description')} value={draft.description ?? ''} onChange={(v) => set('description', v)} multiline testID="edit-description" />
          <Field label={t('hangout.edit.phone')} value={draft.phone ?? ''} onChange={(v) => set('phone', v)} keyboardType="phone-pad" testID="edit-phone" />
          <Field label={t('hangout.edit.website')} value={draft.website ?? ''} onChange={(v) => set('website', v)} keyboardType="url" testID="edit-website" />
          <View style={styles.card}>
            <Text style={styles.label}>{t('hangout.edit.amenities')}</Text>
            <View style={styles.chips}>
              {(draft.amenities ?? []).map((a) => (
                <TouchableOpacity key={a} style={styles.chip} onPress={() => set('amenities', (draft.amenities ?? []).filter((x) => x !== a))} accessibilityRole="button" accessibilityHint="Removes it">
                  <Text style={styles.chipText}>{a} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput value={amenity} onChangeText={setAmenity} style={[styles.input, { flex: 1 }]} maxLength={40} accessibilityLabel={t('hangout.edit.amenities')} testID="edit-amenity" />
              <TouchableOpacity
                style={styles.outline}
                disabled={!amenity.trim()}
                onPress={() => {
                  const a = amenity.trim();
                  if (a && !(draft.amenities ?? []).includes(a)) set('amenities', [...(draft.amenities ?? []), a]);
                  setAmenity('');
                }}
                accessibilityRole="button"
                testID="edit-amenity-add"
              >
                <Text style={styles.outlineText}>{t('hangout.edit.addAmenity')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(hangout)/hours', params: { helloHangoutId } })} accessibilityRole="button" testID="edit-hours">
            <Text style={styles.value}>{t('hangout.edit.hours')} ›</Text>
          </TouchableOpacity>
          {message ? <Text accessibilityRole={message.kind === 'error' ? 'alert' : undefined} style={message.kind === 'error' ? styles.error : styles.ok} testID="edit-message">{message.text}</Text> : null}
          <TouchableOpacity style={[styles.primary, (saving || !draft.name.trim() || !draft.address.trim()) && styles.disabled]} onPress={() => void save()} disabled={saving || !draft.name.trim() || !draft.address.trim()} accessibilityRole="button" accessibilityState={{ busy: saving }} testID="edit-save">
            <Text style={styles.primaryText}>{t(saving ? 'hangout.edit.saving' : 'hangout.edit.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outline} onPress={() => router.push({ pathname: '/(hangout)/preview', params: { helloHangoutId } })} accessibilityRole="button" testID="edit-preview">
            <Text style={styles.outlineText}>{t('hangout.edit.preview')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, multiline, keyboardType, testID }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'url';
  testID?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'url' ? 'none' : 'sentences'}
        style={[styles.input, multiline && styles.multiline]}
        accessibilityLabel={label}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDEA' },
  topBar: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 12, alignItems: 'flex-start' },
  back: { fontSize: 24, color: Colors.Ink },
  title: { fontSize: 24, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.3 },
  sub: { fontSize: 13.5, lineHeight: 19, color: '#5C574F' },
  pad: { paddingHorizontal: 24 },
  form: { paddingHorizontal: 16, paddingBottom: 40, gap: 8, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: Colors.Chalk, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 12, gap: 8 },
  label: { fontSize: 13.5, fontWeight: '700', color: Colors.Ink },
  value: { fontSize: 15, color: Colors.Ink },
  input: { minHeight: 40, borderWidth: 1, borderColor: '#CBC5BC', borderRadius: 9, backgroundColor: '#FAF9F7', paddingHorizontal: 10, fontSize: 15, color: Colors.Ink },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontSize: 14, color: Colors.Ink },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  outline: { minHeight: 44, borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  primary: { height: 52, borderRadius: 14, backgroundColor: Colors.Ink, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryText: { color: Colors.Chalk, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  error: { fontSize: 14, color: Colors.SignalRed },
  ok: { fontSize: 14, color: Colors.DeepFern },
});
