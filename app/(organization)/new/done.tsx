/** ORG SIGNUP 4 of 4 — you're on (CANON-RL-05-SN-06). States what an Organization is and is not, once. */
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { resetOrgDraft } from '../../../src/state/organization-draft';
import { OrgScreen, Row } from '../../../src/components/organization/parts';

export default function OrgSignupDone() {
  const router = useRouter();
  const { id, name, freePosts } = useLocalSearchParams<{ id: string; name: string; freePosts: string }>();
  useEffect(() => { resetOrgDraft(); }, []);
  return (
    <OrgScreen
      title={t('organizations.signup.doneTitle', { name: name ?? '' })}
      step={t('organizations.signup.step', { n: 4 })}
      footer={
        <>
          <Button title={t('organizations.signup.postHootza')} testID="org-done-post" onPress={() => router.replace({ pathname: '/(organization)/org/[id]/new-event', params: { id } })} />
          <Button title={t('organizations.signup.seePage')} variant="secondary" testID="org-done-page" onPress={() => router.replace({ pathname: '/(organization)/org/[id]', params: { id } })} />
        </>
      }
    >
      <Row label={t('organizations.signup.doneBody')} />
      <Row label={t('organizations.signup.postsLabel')} value={t('organizations.signup.postsValue', { n: freePosts ?? '' })} />
      <Row label={t('organizations.signup.costLabel')} value={t('organizations.signup.costValue')} />
      <Row label={t('organizations.signup.pinLabel')} value={t('organizations.signup.pinValue')} />
      <Row label={t('organizations.signup.pointsLabel')} value={t('organizations.signup.pointsValue')} />
    </OrgScreen>
  );
}
