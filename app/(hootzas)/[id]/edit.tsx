/**
 * EDIT A LIVE HOOTZA
 * GET /api/hootzas/:id, PATCH /api/hootzas/:id (host, or a lead of the hosting organization).
 * Only while live; venue type is locked once anyone said going or maybe.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getHootza, getRsvpCount, updateHootza, type Hootza, type VenueType } from '../../../src/api/hootzas';
import { LocationPicker } from '../../../src/components/hootza/LocationPicker';
import { TextInput } from '../../../src/components';

export default function EditHootzaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getHootza(id);
    setLoading(false);
    if (res.error || !res.data?.hootza) {
      setError(res.error?.message ?? t('error.notFound'));
      return;
    }
    setHootza(res.data.hootza);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [startClock, setStartClock] = useState('');
  const [endClock, setEndClock] = useState('');
  const [grace, setGrace] = useState('');
  const [place, setPlace] = useState('');
  const [pin, setPin] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [venue, setVenue] = useState<VenueType>('public_place');
  const [cover, setCover] = useState('');
  const [chatOn, setChatOn] = useState(false);
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [seeded, setSeeded] = useState<string | null>(null);

  // Seed the form once per loaded Hootza (a later refresh must not overwrite what is being typed).
  if (hootza && seeded !== hootza.id) {
    const st = new Date(hootza.startTime);
    setSeeded(hootza.id);
    setTitle(hootza.title);
    setDetails(hootza.description ?? '');
    setDate(`${st.getFullYear()}-${String(st.getMonth() + 1).padStart(2, '0')}-${String(st.getDate()).padStart(2, '0')}`);
    setStartClock(`${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`);
    const en = hootza.scheduledEndTime ? new Date(hootza.scheduledEndTime) : null;
    setEndClock(en ? `${String(en.getHours()).padStart(2, '0')}:${String(en.getMinutes()).padStart(2, '0')}` : '');
    setGrace(hootza.endGraceMinutes != null ? String(hootza.endGraceMinutes) : '');
    setPlace(hootza.locationName ?? '');
    setPin({ lat: hootza.locationLat, lng: hootza.locationLng });
    setVenue(hootza.venueType);
    setCover(hootza.coverChargeAmount ? String(hootza.coverChargeAmount / 100) : '');
    setChatOn(hootza.chatEnabled === true);
    setAdultsOnly(hootza.adultsOnly === true);
  }

  async function save() {
    if (!hootza || !id) return;
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    const sc = /^(\d{1,2}):(\d{2})$/.exec(startClock.trim());
    const ec = endClock.trim() ? /^(\d{1,2}):(\d{2})$/.exec(endClock.trim()) : null;
    if (!d || !sc || (endClock.trim() && !ec)) { setSaveMsg({ ok: false, text: t('hootzas.edit.badTime') }); return; }
    const start = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(sc[1]), Number(sc[2]));
    const end = ec ? new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(ec[1]), Number(ec[2])) : null;
    if (Number.isNaN(start.getTime()) || (end && end.getTime() <= start.getTime())) { setSaveMsg({ ok: false, text: t('hootzas.edit.badTime') }); return; }
    const dollars = cover.trim() ? Number(cover) : null;
    setSaving(true);
    setSaveMsg(null);
    const res = await updateHootza(id, {
      title: title.trim(),
      description: details.trim() || null,
      venueType: venue,
      locationName: place.trim() || null,
      locationLat: pin.lat,
      locationLng: pin.lng,
      startTime: start.toISOString(),
      scheduledEndTime: end ? end.toISOString() : null,
      endGraceMinutes: end && /^\d+$/.test(grace.trim()) ? Number(grace.trim()) : null,
      coverChargeAmount: dollars != null && Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : null,
      chatEnabled: chatOn,
      adultsOnly,
    });
    setSaving(false);
    if (res.error) {
      const code = res.error.code;
      setSaveMsg({ ok: false, text: t(code === 'hootza_not_live' ? 'hootzas.edit.notLive' : code === 'venue_type_locked' ? 'hootzas.edit.venueLocked' : code === 'not_host' ? 'hootzas.edit.notHost' : 'hootzas.edit.saveFailed') });
      return;
    }
    setSaveMsg({ ok: true, text: t('hootzas.edit.saved') });
    void load();
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="edit-loading" />
      </ScreenContainer>
    );
  }

  if (error || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text>{error ?? t('hootzas.common.empty')}</Text>
          <Button title={t('error.retry')} onPress={load} testID="edit-retry" />
        </View>
      </ScreenContainer>
    );
  }

  const going = getRsvpCount(hootza);
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.edit.title')}</Text>
        </TouchableOpacity>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            {t('hootzas.edit.goingBanner', { count: going })}
          </Text>
          <Text style={styles.bannerBody}>{t('hootzas.edit.goingHint')}</Text>
        </View>

        <Text style={styles.sectionHeader}>{t('hootzas.edit.toldHeader')}</Text>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>{t('hootzas.create.dateLabel')}</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" testID="edit-date" />
          <Text style={styles.fieldLabel}>{t('hootzas.edit.startsLabel')}</Text>
          <TextInput value={startClock} onChangeText={setStartClock} placeholder="19:00" testID="edit-start" />
          <Text style={styles.fieldLabel}>{t('hootzas.edit.endLabel')}</Text>
          <TextInput value={endClock} onChangeText={setEndClock} placeholder="22:00" testID="edit-end" />
          {endClock.trim() ? (
            <>
              <Text style={styles.fieldLabel}>{t('hootzas.edit.graceLabel')}</Text>
              <TextInput value={grace} onChangeText={(v) => setGrace(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" testID="edit-grace" />
              <Text style={styles.fieldLabel}>{t('hootzas.edit.graceHint')}</Text>
            </>
          ) : <Text style={styles.fieldLabel}>{t('hootzas.create.endHint')}</Text>}
          <Text style={styles.fieldLabel}>{t('hootzas.edit.whereLabel')}</Text>
          <LocationPicker name={place} onName={setPlace} lat={pin.lat} lng={pin.lng} onPin={(la, ln) => setPin({ lat: la, lng: ln })} testID="edit-location" />
        </View>

        <Text style={styles.sectionHeader}>{t('hootzas.edit.quietHeader')}</Text>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>{t('hootzas.edit.calledLabel')}</Text>
          <TextInput value={title} onChangeText={setTitle} maxLength={200} testID="edit-title" />
          <Text style={styles.fieldLabel}>{t('hootzas.venue.pickOne')}</Text>
          <View style={styles.venueRow}>
            <TouchableOpacity style={[styles.venue, venue === 'public_place' && styles.venueOn]} onPress={() => setVenue('public_place')} accessibilityRole="radio" accessibilityState={{ selected: venue === 'public_place' }} testID="edit-venue-public">
              <Text style={styles.fieldValue}>{t('hootzas.venue.publicPlace')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.venue, venue === 'private_residence' && styles.venueOn]} onPress={() => setVenue('private_residence')} accessibilityRole="radio" accessibilityState={{ selected: venue === 'private_residence' }} testID="edit-venue-private">
              <Text style={styles.fieldValue}>{t('hootzas.venue.privateResidence')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>{t('hootzas.edit.detailsLabel')}</Text>
          <TextInput value={details} onChangeText={setDetails} multiline testID="edit-details" />
          <Text style={styles.fieldLabel}>{t('hootzas.edit.doorLabel')}</Text>
          <TextInput value={cover} onChangeText={setCover} keyboardType="decimal-pad" prefix="$" testID="edit-cover" />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('hootzas.create.chatToggle')}</Text>
              <Text style={styles.switchHint}>{t('hootzas.create.chatToggleHint')}</Text>
            </View>
            <Switch value={chatOn} onValueChange={setChatOn} accessibilityLabel={t('hootzas.create.chatToggle')} testID="edit-chat-toggle" />
          </View>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('hootzas.create.adultsToggle')}</Text>
              <Text style={styles.switchHint}>{t('hootzas.create.adultsToggleHint')}</Text>
            </View>
            <Switch value={adultsOnly} onValueChange={setAdultsOnly} accessibilityLabel={t('hootzas.create.adultsToggle')} testID="edit-adults-toggle" />
          </View>
        </View>

        {saveMsg ? (
          <Text accessibilityRole={saveMsg.ok ? undefined : 'alert'} style={[styles.readOnlyNote, !saveMsg.ok && { color: FixedColors.error }]} testID="edit-save-msg">{saveMsg.text}</Text>
        ) : null}
        <View style={styles.form}>
          <Button title={t('hootzas.edit.save')} onPress={save} loading={saving} disabled={!hootza || hootza.status !== 'live' || !title.trim()} testID="edit-save" />
        </View>

        <View style={styles.cancelTray}>
          <TouchableOpacity
            onPress={() => router.push(`/(hootzas)/${id}/cancel-confirm`)}
            testID="edit-cancel-link"
          >
            <Text style={styles.cancelLink}>{t('hootzas.edit.cancelLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
      <Text style={styles.change}>{t('hootzas.edit.change')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  switchHint: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  form: { marginHorizontal: 22, gap: 8, marginBottom: 12 },
  venueRow: { flexDirection: 'row', gap: 10 },
  venue: { flex: 1, borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 12 },
  venueOn: { borderColor: FixedColors.hootza, backgroundColor: Colors.Bone },
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back: { paddingHorizontal: 22, paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  banner: {
    marginHorizontal: 22,
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  bannerBody: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  sectionHeader: {
    paddingHorizontal: 22,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginBottom: 8,
    marginTop: 8,
  },
  field: {
    marginHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  fieldLabel: { fontSize: 13, color: Colors.Faint },
  fieldValue: { fontSize: 16, fontWeight: '600', color: Colors.Ink, marginTop: 2 },
  change: { fontSize: 14, color: Colors.Faint, marginTop: 4 },
  readOnlyNote: {
    marginHorizontal: 22,
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 13,
  },
  cancelTray: {
    marginTop: 24,
    marginHorizontal: 22,
    borderTopWidth: 1,
    borderColor: Colors.Line,
    paddingTop: 16,
  },
  cancelLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.SignalRed,
    textDecorationLine: 'underline',
  },
});
