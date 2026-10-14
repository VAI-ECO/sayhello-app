/**
 * ORG SIGNUP 3 of 4 — your code (CANON-RL-05-SN-05). "Take it" creates the group and its LEAD.
 * POST /api/organizations/check-code, POST /api/organizations. A code carries credit, never price.
 */
import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { getOrgDraft, patchOrgDraft } from '../../../src/state/organization-draft';
import { checkOrgCode, createOrganization } from '../../../src/api/organizations';
import { OrgScreen, Note, orgStyles } from '../../../src/components/organization/parts';

export default function OrgSignupCode() {
  const router = useRouter();
  const [code, setCode] = useState(getOrgDraft().code);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A taken code offers the nearest free variant (design register, "Code field"); a blocked word never does.
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const take = async () => {
    const d = getOrgDraft();
    if (!d.name || !d.kind || !d.meetingPlace || !d.venueType) { setError(t('organizations.signup.draftIncomplete')); return; }
    setBusy(true); setError(null); setSuggestion(null);
    const check = await checkOrgCode(code.trim());
    if (check.error) { setBusy(false); setError(check.error.code === 'validation_error' ? t('organizations.signup.codeErrors.invalid') : t('organizations.common.saveFailed')); return; }
    if (!check.data?.available) {
      setBusy(false);
      setError(t(`organizations.signup.codeErrors.${check.data?.reason ?? 'invalid'}`));
      setSuggestion(check.data?.suggestion ?? null);
      return;
    }
    const res = await createOrganization({ name: d.name, kind: d.kind, meetingPlace: d.meetingPlace, venueType: d.venueType, code: code.trim() });
    setBusy(false);
    if (res.error || !res.data) {
      const reason = (res.error as { reason?: string } | undefined)?.reason;
      setError(res.error?.code === 'too_many_groups' ? t('l06.code.tooManyGroups')
        : reason ? t(`organizations.signup.codeErrors.${reason}`) : t('organizations.common.saveFailed'));
      return;
    }
    patchOrgDraft({ code: code.trim() });
    router.replace({ pathname: '/(organization)/new/done', params: { id: res.data.organization.id, name: res.data.organization.name, freePosts: String(res.data.quota.freePosts) } });
  };

  return (
    <OrgScreen
      title={t('organizations.signup.codeTitle')}
      step={t('organizations.signup.step', { n: 3 })}
      onBack={() => router.back()}
      footer={<Button title={busy ? t('organizations.signup.checking') : t('organizations.signup.takeIt')} loading={busy} disabled={code.trim().length === 0} onPress={take} testID="org-code-take" />}
    >
      <Text style={orgStyles.hint}>{t('organizations.signup.codeHint')}</Text>
      <TextInput value={code} onChangeText={(v) => { setCode(v.replace(/[^a-zA-Z0-9]/g, '')); setError(null); setSuggestion(null); }} autoCapitalize="characters" autoCorrect={false} testID="org-code" error={!!error} />
      {error ? <Text style={orgStyles.error} testID="org-code-error">{error}</Text> : null}
      {suggestion ? (
        <Button title={t('l06.code.try', { code: suggestion })} variant="secondary" onPress={() => { setCode(suggestion); setError(null); setSuggestion(null); }} testID="org-code-suggestion" />
      ) : null}
      <Note title={t('organizations.signup.codeCreditTitle')} body={t('organizations.signup.codeCreditBody')} />
      <Note title={t('organizations.signup.codeFirstTitle')} body={t('organizations.signup.codeFirstBody')} />
    </OrgScreen>
  );
}
