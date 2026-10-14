/** ORG SIGNUP 2 of 4 — where you meet (CANON-RL-05-SN-04). Venue type declared and displayed (§28.2). Not a pin. */
import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { getOrgDraft, patchOrgDraft } from '../../../src/state/organization-draft';
import type { OrgVenue } from '../../../src/api/organizations';
import { OrgScreen, Choice, Note, orgStyles } from '../../../src/components/organization/parts';

export default function OrgSignupPlace() {
  const router = useRouter();
  const [place, setPlace] = useState(getOrgDraft().meetingPlace);
  const [venue, setVenue] = useState<OrgVenue | null>(getOrgDraft().venueType);
  const ready = place.trim().length > 0 && venue !== null;
  return (
    <OrgScreen
      title={t('organizations.signup.placeTitle')}
      step={t('organizations.signup.step', { n: 2 })}
      onBack={() => router.back()}
      footer={<Button title={t('organizations.common.next')} disabled={!ready} testID="org-place-next"
        onPress={() => { patchOrgDraft({ meetingPlace: place.trim(), venueType: venue }); router.push('/(organization)/new/code'); }} />}
    >
      <Text style={orgStyles.fieldLabel}>{t('organizations.signup.placeLabel')}</Text>
      <TextInput value={place} onChangeText={setPlace} maxLength={200} testID="org-place" />
      <Choice label={t('organizations.signup.publicPlace')} selected={venue === 'public_place'} onPress={() => setVenue('public_place')} testID="org-venue-public" />
      <Choice label={t('organizations.signup.privateResidence')} selected={venue === 'private_residence'} onPress={() => setVenue('private_residence')} testID="org-venue-private" />
      <Text style={orgStyles.hint}>{t('organizations.signup.alwaysDeclared')}</Text>
      <Note title={t('organizations.signup.notAPinTitle')} body={t('organizations.signup.notAPinBody')} />
      <Note title={t('organizations.signup.showsTitle')} body={t('organizations.signup.showsBody')} />
    </OrgScreen>
  );
}
