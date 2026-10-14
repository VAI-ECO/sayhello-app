/**
 * ORGANIZATION DASHBOARD (leads). Followers as a number only; check-ins; free-post quota from settings.
 * GET /api/organizations/:id/dashboard. No points, pins or money appear here (ROLE-5 §4).
 */
import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { Colors } from '../../../../src/theme/tokens';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgDashboard } from '../../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Row, Note } from '../../../../src/components/organization/parts';

export default function OrganizationDashboard() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, errorCode, retry } = useLoader(() => getOrgDashboard(id));
  if (state === 'loading') return <Loading />;
  if (state === 'error') {
    return <ErrorState message={errorCode === 'not_a_lead' ? t('organizations.dashboard.notALead') : t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  }
  const d = data!;
  const closed = d.organization.status === 'closed';
  const go = (pathname: string) => router.push({ pathname: pathname as never, params: { id } });
  return (
    <OrgScreen
      title={d.organization.name}
      onBack={() => router.back()}
      footer={closed ? null : <Button title={t('organizations.dashboard.postHootza')} onPress={() => go('/(organization)/org/[id]/new-event')} testID="org-dash-post" />}
    >
      <Row label={t('organizations.dashboard.followersLabel')} value={String(d.followerCount)} testID="org-dash-followers" />
      <Text style={s.hint}>{t('organizations.dashboard.noFollowerList')}</Text>
      <Row label={t('organizations.dashboard.checkInsLabel')} value={String(d.checkInCount)} />
      <Row label={t('organizations.dashboard.liveLabel')} value={String(d.events.live)} />
      <Row label={t('organizations.dashboard.codeLabel')} value={d.organization.code} />
      <Row label={t('organizations.dashboard.freePostsLabel')} value={t('organizations.dashboard.freePostsValue', { used: d.quota.used, limit: d.quota.freePosts })} />
      {d.quota.remaining === 0 ? <Note title={t('organizations.dashboard.freePostsLabel')} body={t('organizations.dashboard.freePostsOut')} /> : null}
      <Row label={t('organizations.dashboard.events')} onPress={() => go('/(organization)/org/[id]/events')} testID="org-dash-events" />
      <Row label={t('organizations.dashboard.leads')} value={String(d.leadCount)} onPress={() => go('/(organization)/org/[id]/leads')} testID="org-dash-leads" />
      <Row label={t('organizations.dashboard.viewPage')} onPress={() => go('/(organization)/org/[id]')} testID="org-dash-page" />
      {closed ? null : <Row label={t('organizations.dashboard.editPage')} onPress={() => go('/(organization)/org/[id]/edit')} testID="org-dash-edit" />}
      {closed || !d.viewer.canManageLeads ? null : <Row label={t('organizations.dashboard.close')} onPress={() => go('/(organization)/org/[id]/close')} testID="org-dash-close" />}
    </OrgScreen>
  );
}
const s = StyleSheet.create({ hint: { fontSize: 13, color: Colors.Faint } });
