/**
 * LEAVING 3 of 3 — what happens to followers (CANON-RL-05-SN-14). POST /api/organizations/:id/close.
 * The optional farewell Holla is not built (Hollas belong to Hello Hangouts, ROLE-5 gives organizations none).
 */
import { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgDashboard, closeOrganization } from '../../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Note, orgStyles } from '../../../../src/components/organization/parts';

export default function CloseFollowers() {
  const router = useRouter();
  const { id, choice } = useLocalSearchParams<{ id: string; choice: 'take_down' | 'leave_up' }>();
  const { state, data, retry } = useLoader(() => getOrgDashboard(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <OrgScreen title={t('organizations.close.done')} footer={<Button title={t('organizations.entry.yourGroups')} onPress={() => router.replace('/(organization)')} testID="org-close-done" />}>
        <Text style={orgStyles.hint}>{t('organizations.close.doneBody')}</Text>
      </OrgScreen>
    );
  }
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;

  const close = async () => {
    if (choice !== 'take_down' && choice !== 'leave_up') { router.back(); return; }
    setBusy(true); setError(null);
    const res = await closeOrganization(id, choice);
    setBusy(false);
    if (res.error) { setError(res.error.code === 'only_the_lead_can_close' ? t('organizations.close.onlyLead') : t('organizations.common.saveFailed')); return; }
    setDone(true);
  };

  return (
    <OrgScreen title={t('organizations.close.followersTitle', { n: data!.followerCount })} step={t('organizations.close.step', { n: 3 })} onBack={() => router.back()}
      footer={
        <>
          <Button title={busy ? t('organizations.close.closing') : t('organizations.close.closeIt')} loading={busy} onPress={close} testID="org-close-confirm" />
          <Button title={t('organizations.common.back')} variant="secondary" onPress={() => router.back()} />
        </>
      }>
      <Text style={orgStyles.hint}>{t('organizations.close.followersBody')}</Text>
      {error ? <Text style={orgStyles.error} testID="org-close-error">{error}</Text> : null}
      <Note title={t('organizations.close.keepTitle')} body={t('organizations.close.keepBody')} />
    </OrgScreen>
  );
}
