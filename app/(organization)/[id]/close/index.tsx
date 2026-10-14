/** LEAVING 1 of 3 — confirm (CANON-RL-05-SN-12). States consequences, offers a way back at each step. */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgDashboard } from '../../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Row, Note } from '../../../../src/components/organization/parts';

export default function CloseConfirm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, retry } = useLoader(() => getOrgDashboard(id));
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const d = data!;
  if (!d.viewer.canManageLeads) return <ErrorState message={t('organizations.close.onlyLead')} onRetry={retry} onBack={() => router.back()} />;
  return (
    <OrgScreen title={t('organizations.close.title', { name: d.organization.name })} step={t('organizations.close.step', { n: 1 })} onBack={() => router.back()}
      footer={
        <>
          <Button title={t('organizations.close.nextQuestion')} testID="org-close-next" onPress={() => router.push({ pathname: '/(organization)/[id]/close/page', params: { id } })} />
          <Button title={t('organizations.close.keepOpen')} variant="secondary" testID="org-close-keep" onPress={() => router.back()} />
        </>
      }>
      <Row label={t('organizations.close.intro')} />
      <Row label={t('organizations.close.newHootzas')} value={t('organizations.close.noLonger')} />
      <Row label={t('organizations.close.codeRow')} value={t('organizations.close.codeStops')} />
      <Row label={t('organizations.close.pageRow')} value={t('organizations.close.pageAnswer')} />
      <Note title={t('organizations.close.nobodyTitle')} body={t('organizations.close.nobodyBody')} />
    </OrgScreen>
  );
}
