/** ORG SIGNUP 1 of 4 — who you are (CANON-RL-05-SN-03). No API call; the draft is held in memory until step 3. */
import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { getOrgDraft, patchOrgDraft } from '../../../src/state/organization-draft';
import type { OrgKind } from '../../../src/api/organizations';
import { OrgScreen, Choice, Note, orgStyles } from '../../../src/components/organization/parts';

const KINDS: OrgKind[] = ['running_club', 'book_group', 'faith_group', 'hobby_group', 'sports_team', 'other'];

export default function OrgSignupWho() {
  const router = useRouter();
  const [name, setName] = useState(getOrgDraft().name);
  const [kind, setKind] = useState<OrgKind | null>(getOrgDraft().kind);
  const ready = name.trim().length > 0 && kind !== null;
  return (
    <OrgScreen
      title={t('organizations.signup.whoTitle')}
      step={t('organizations.signup.step', { n: 1 })}
      onBack={() => router.back()}
      footer={<Button title={t('organizations.common.next')} disabled={!ready} testID="org-who-next"
        onPress={() => { patchOrgDraft({ name: name.trim(), kind }); router.push('/(organization)/new/place'); }} />}
    >
      <Text style={s.sub}>{t('organizations.signup.whoRole')}</Text>
      <Text style={orgStyles.fieldLabel}>{t('organizations.signup.nameLabel')}</Text>
      <TextInput value={name} onChangeText={setName} maxLength={120} autoCapitalize="words" testID="org-name" />
      <Text style={orgStyles.fieldLabel}>{t('organizations.signup.kindLabel')}</Text>
      {KINDS.map((k) => (
        <Choice key={k} label={t(`organizations.signup.kinds.${k}`)} selected={kind === k} onPress={() => setKind(k)} testID={`org-kind-${k}`} />
      ))}
      <Note title={t('organizations.signup.noApprovalTitle')} body={t('organizations.signup.noApprovalBody')} />
    </OrgScreen>
  );
}
const s = StyleSheet.create({ sub: { fontSize: 15, color: Colors.Muted } });
