/**
 * ORGANIZATION ENTRY — CANON-RL-05-SN-08 pitch + the signed-in user's groups.
 * GET /api/organizations/mine
 */
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';
import { useLoader } from '../../../src/lib/use-loader';
import { getMyOrganizations } from '../../../src/api/organizations';
import { resetOrgDraft } from '../../../src/state/organization-draft';
import { OrgScreen, Loading, ErrorState, Note, Row } from '../../../src/components/organization/parts';

export default function OrganizationEntry() {
  const router = useRouter();
  const { state, data, retry } = useLoader(getMyOrganizations);
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const groups = data?.organizations ?? [];
  return (
    <OrgScreen
      title={t('organizations.entry.title')}
      onBack={() => router.back()}
      footer={
        <>
          <Button title={t('organizations.entry.setUp')} onPress={() => { resetOrgDraft(); router.push('/(organization)/new/who'); }} testID="org-set-up" />
          <Button title={t('organizations.entry.listBusiness')} variant="secondary" onPress={() => router.push('/(hangout)/dashboard')} testID="org-list-business" />
        </>
      }
    >
      <Text style={s.body}>{t('organizations.entry.body')}</Text>
      {groups.length > 0 ? (
        <View testID="org-my-groups">
          <Text style={s.h}>{t('organizations.entry.yourGroups')}</Text>
          {groups.map((g) => (
            <Row key={g.id} label={g.status === 'closed' ? `${g.name} · ${t('organizations.entry.closedTag')}` : g.name}
              onPress={() => router.push({ pathname: '/(organization)/org/[id]/dashboard', params: { id: g.id } })} testID={`org-group-${g.id}`} />
          ))}
        </View>
      ) : null}
      <Note title={t('organizations.entry.ownPageTitle')} body={t('organizations.entry.ownPageBody')} />
      <Note title={t('organizations.entry.hootzasTitle')} body={t('organizations.entry.hootzasBody')} />
      <Note title={t('organizations.entry.codeTitle')} body={t('organizations.entry.codeBody')} />
      <Note title={t('organizations.entry.freeTitle')} body={t('organizations.entry.freeBody')} />
      <Note title={t('organizations.entry.notTitle')} body={t('organizations.entry.notBody')} />
    </OrgScreen>
  );
}

const s = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 23, color: Colors.Muted },
  h: { fontSize: 16, fontWeight: '700', color: Colors.Ink, marginTop: 4 },
});
