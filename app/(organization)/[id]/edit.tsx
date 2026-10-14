/** EDIT PAGE (leads). PATCH /api/organizations/:id — name, kind, meeting place and venue type. No design delivered for this screen. */
import { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { useLoader } from '../../../src/lib/use-loader';
import { getOrgDashboard, updateOrganization, type OrgKind, type OrgVenue } from '../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Choice, orgStyles } from '../../../src/components/organization/parts';

const KINDS: OrgKind[] = ['running_club', 'book_group', 'faith_group', 'hobby_group', 'sports_team', 'other'];

export default function OrganizationEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, retry } = useLoader(() => getOrgDashboard(id));
  const [name, setName] = useState<string | null>(null);
  const [kind, setKind] = useState<OrgKind | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [venue, setVenue] = useState<OrgVenue | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const o = data!.organization;
  const cur = { name: name ?? o.name, kind: kind ?? o.kind, place: place ?? o.meetingPlace, venue: venue ?? o.venueType };

  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await updateOrganization(id, { name: cur.name.trim(), kind: cur.kind, meetingPlace: cur.place.trim(), venueType: cur.venue });
    setBusy(false);
    setMsg(res.error ? { ok: false, text: t('organizations.common.saveFailed') } : { ok: true, text: t('organizations.edit.saved') });
  };

  return (
    <OrgScreen title={t('organizations.edit.title')} onBack={() => router.back()}
      footer={<Button title={t('organizations.edit.save')} loading={busy} disabled={!cur.name.trim() || !cur.place.trim()} onPress={save} testID="org-edit-save" />}>
      <Text style={orgStyles.fieldLabel}>{t('organizations.signup.nameLabel')}</Text>
      <TextInput value={cur.name} onChangeText={setName} maxLength={120} testID="org-edit-name" />
      {KINDS.map((k) => <Choice key={k} label={t(`organizations.signup.kinds.${k}`)} selected={cur.kind === k} onPress={() => setKind(k)} />)}
      <Text style={orgStyles.fieldLabel}>{t('organizations.signup.placeLabel')}</Text>
      <TextInput value={cur.place} onChangeText={setPlace} maxLength={200} testID="org-edit-place" />
      <Choice label={t('organizations.signup.publicPlace')} selected={cur.venue === 'public_place'} onPress={() => setVenue('public_place')} />
      <Choice label={t('organizations.signup.privateResidence')} selected={cur.venue === 'private_residence'} onPress={() => setVenue('private_residence')} />
      {msg ? <Text style={msg.ok ? orgStyles.hint : orgStyles.error} testID="org-edit-msg">{msg.text}</Text> : null}
    </OrgScreen>
  );
}
