/**
 * ORG HOOTZA COMPOSE — CANON-RL-05-SN-07 (cover charge display-only). Lead-attributed Hootza on the one Hootza model.
 * GET /api/organizations/:id/dashboard (quota), POST /api/organizations/:id/events.
 * Free posts stop when exhausted; there is no paid extra. No recurring Hootzas (§28.3). End time optional (§28.9).
 */
import { useState } from 'react';
import { Text, Switch, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, TextInput } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { Colors } from '../../../../src/theme/tokens';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgDashboard, createOrgEvent } from '../../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Note, orgStyles } from '../../../../src/components/organization/parts';

function parseLocal(date: string, clock: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const c = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!d || !c) return null;
  const out = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(c[1]), Number(c[2]));
  return Number.isNaN(out.getTime()) ? null : out;
}

export default function OrganizationNewEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, retry } = useLoader(() => getOrgDashboard(id));
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [cover, setCover] = useState('');
  const [onFeed, setOnFeed] = useState(false);
  const [chatOn, setChatOn] = useState(false);
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const quota = data!.quota;
  const canFeed = quota.remaining > 0;

  const post = async () => {
    const s = parseLocal(date, start);
    const e = end.trim() ? parseLocal(date, end) : null;
    if (!s || (end.trim() && !e) || (e && e <= s)) { setError(t('organizations.events.compose.badTime')); return; }
    const dollars = cover.trim() ? Number(cover.replace(/[^0-9.]/g, '')) : null;
    setBusy(true); setError(null);
    const res = await createOrgEvent(id, {
      title: title.trim(), description: details.trim() || undefined, startTime: s.toISOString(), scheduledEndTime: e ? e.toISOString() : null,
      coverChargeAmount: dollars && dollars > 0 ? Math.round(dollars * 100) : undefined, postToFeed: onFeed && canFeed,
      adultsOnly, chatEnabled: chatOn,
    });
    setBusy(false);
    if (res.error || !res.data) {
      setError(res.error?.code === 'out_of_free_posts' ? t('organizations.events.compose.outOfPosts') : t('organizations.common.saveFailed'));
      return;
    }
    router.replace({ pathname: '/(hootzas)/[id]', params: { id: res.data.hootza.id } });
  };

  return (
    <OrgScreen title={t('organizations.events.compose.title')} onBack={() => router.back()}
      footer={<Button title={busy ? t('organizations.events.compose.posting') : t('organizations.events.compose.post')} loading={busy} disabled={!title.trim() || !date.trim() || !start.trim()} onPress={post} testID="org-event-post" />}>
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.name')}</Text>
      <TextInput value={title} onChangeText={setTitle} maxLength={200} testID="org-event-title" />
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.date')}</Text>
      <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" testID="org-event-date" />
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.start')}</Text>
      <TextInput value={start} onChangeText={setStart} placeholder="19:00" testID="org-event-start" />
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.end')}</Text>
      <TextInput value={end} onChangeText={setEnd} placeholder="22:00" testID="org-event-end" />
      {!end.trim() ? <Text style={orgStyles.hint}>{t('organizations.events.compose.endBlank')}</Text> : null}
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.details')}</Text>
      <TextInput value={details} onChangeText={setDetails} multiline testID="org-event-details" />
      <Text style={orgStyles.fieldLabel}>{t('organizations.events.compose.cover')}</Text>
      <TextInput value={cover} onChangeText={setCover} keyboardType="decimal-pad" prefix="$" testID="org-event-cover" />
      <Text style={orgStyles.hint}>{t('organizations.events.compose.coverNote')}</Text>
      <View style={s.feed}>
        <View style={{ flex: 1 }}>
          <Text style={s.feedTitle}>{t('organizations.events.compose.feedTitle')}</Text>
          <Text style={orgStyles.hint}>{canFeed ? t('organizations.events.compose.feedLeft', { n: quota.remaining }) : t('organizations.events.compose.feedNone')}</Text>
        </View>
        <Switch value={onFeed && canFeed} onValueChange={setOnFeed} disabled={!canFeed} testID="org-event-feed" />
      </View>
      <Text style={orgStyles.hint}>{t('organizations.events.compose.feedBody')}</Text>
      <View style={s.feed}>
        <View style={{ flex: 1 }}>
          <Text style={s.feedTitle}>{t('hootzas.create.chatToggle')}</Text>
          <Text style={orgStyles.hint}>{t('hootzas.create.chatToggleHint')}</Text>
        </View>
        <Switch value={chatOn} onValueChange={setChatOn} accessibilityLabel={t('hootzas.create.chatToggle')} testID="org-event-chat" />
      </View>
      <View style={s.feed}>
        <View style={{ flex: 1 }}>
          <Text style={s.feedTitle}>{t('hootzas.create.adultsToggle')}</Text>
          <Text style={orgStyles.hint}>{t('hootzas.create.adultsToggleHint')}</Text>
        </View>
        <Switch value={adultsOnly} onValueChange={setAdultsOnly} accessibilityLabel={t('hootzas.create.adultsToggle')} testID="org-event-adults" />
      </View>
      {error ? <Text style={orgStyles.error} testID="org-event-error">{error}</Text> : null}
      <Note title={t('organizations.events.compose.recurringNote')} body={t('organizations.page.coverNote')} />
    </OrgScreen>
  );
}
const s = StyleSheet.create({
  feed: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 14 },
  feedTitle: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
});
