/**
 * ORGANIZATION PAGE — CANON-RL-05-SN-02. Public page with Follow. Follower count only, never identities.
 * GET /api/organizations/:id, POST|DELETE /api/organizations/:id/follow
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { Colors, FixedColors } from '../../../../src/theme/tokens';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrganization, followOrganization, unfollowOrganization } from '../../../../src/api/organizations';
import { formatCentsAsDollars, formatHootzaTimeRange, formatVenueTypeLabel } from '../../../../src/lib/hootza-format';
import { OrgScreen, Loading, ErrorState, Note } from '../../../../src/components/organization/parts';
import { LINK_HOST } from '../../../../src/lib/creator-link';

export default function OrganizationPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, errorCode, retry, reload } = useLoader(() => getOrganization(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state === 'loading') return <Loading />;
  if (state === 'error') {
    return <ErrorState message={errorCode === 'organization_not_found' ? t('organizations.page.notFound') : t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  }
  const page = data!;
  const org = page.organization;
  const closed = org.status === 'closed';

  const toggle = async () => {
    setBusy(true); setError(null);
    const res = page.isFollowing ? await unfollowOrganization(id) : await followOrganization(id);
    setBusy(false);
    if (res.error) { setError(t('organizations.common.saveFailed')); return; }
    void reload();
  };

  // Share (design: Org page, SN-02): the group's name and its page link only. The meeting place is never put in the
  // message — a private residence withholds it from everyone but followers and leads.
  const share = () => {
    void Share.share({ message: t('l06.page.shareMessage', { name: org.name, link: `https://${LINK_HOST}/org/${org.id}` }) }).catch(() => undefined);
  };

  return (
    <OrgScreen
      title={org.name}
      onBack={() => router.back()}
      footer={closed ? null : (
        <>
          {error ? <Text style={s.err} testID="org-follow-error">{error}</Text> : null}
          <Button title={t('l06.page.share')} variant="secondary" onPress={share} testID="org-share" />
          {page.viewer.canManage ? null : <Button title={page.isFollowing ? t('organizations.page.following') : t('organizations.page.follow')} variant={page.isFollowing ? 'secondary' : 'primary'}
            loading={busy} onPress={toggle} testID="org-follow" />}
          {page.viewer.canManage ? <Button title={t('organizations.page.manage')} variant="secondary" onPress={() => router.push({ pathname: '/(organization)/org/[id]/dashboard', params: { id } })} testID="org-manage" /> : null}
        </>
      )}
    >
      <Text style={s.meta}>
        {t(`organizations.signup.kinds.${org.kind}`)}
        {org.meetingPlace ? ` · ${org.meetingPlace}` : ''} · {t(`hootzas.venue.${formatVenueTypeLabel(org.venueType)}`)}
      </Text>
      {org.meetingPlaceWithheld ? <Text style={s.meta}>{t('organizations.page.placeWithheld')}</Text> : null}
      {closed ? <Note title={t('organizations.page.closedBanner')} body="" /> : null}
      <View style={s.stat} testID="org-follower-count">
        <Text style={s.statNum}>{page.followerCount}</Text>
        <Text style={s.meta}>{t('organizations.page.followers')}</Text>
      </View>
      <Text style={s.h}>{t('organizations.page.comingUp')}</Text>
      {page.events.length === 0 ? <Text style={s.meta} testID="org-no-events">{t('organizations.page.nothingYet')}</Text> : page.events.map((e) => (
        <View key={e.id} style={s.event} testID={`org-event-${e.id}`}>
          <Text style={s.eventTitle} onPress={() => router.push({ pathname: '/(hootzas)/[id]', params: { id: e.id } })}>{e.title}</Text>
          <Text style={s.meta}>{formatHootzaTimeRange(e.startTime, e.scheduledEndTime)}</Text>
          <Text style={s.meta}>
            {e.coverChargeAmount ? (e.coverChargeDescription || t('organizations.page.coverDisplay', { amount: formatCentsAsDollars(e.coverChargeAmount) })) : t('organizations.page.free')}
            {' · '}{t('organizations.page.going', { n: e.goingCount })}
          </Text>
        </View>
      ))}
      {(page.pastEvents ?? []).length > 0 ? (
        <>
          <Text style={s.h}>{t('l06.page.finished')}</Text>
          {page.pastEvents!.map((e) => (
            <View key={e.id} style={s.event} testID={`org-past-${e.id}`}>
              <Text style={s.eventTitle} onPress={() => router.push({ pathname: '/(hootzas)/[id]', params: { id: e.id } })}>{e.title}</Text>
              <Text style={s.meta}>
                {new Date(e.startTime).toLocaleDateString()}{' · '}{t('l06.page.came', { n: e.checkedInCount })}
              </Text>
            </View>
          ))}
        </>
      ) : null}
      <Note title={t('organizations.page.notOnMapTitle')} body={t('organizations.page.notOnMapBody')} />
    </OrgScreen>
  );
}

const s = StyleSheet.create({
  meta: { fontSize: 14, color: Colors.Muted },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  statNum: { fontSize: 28, fontWeight: '700', color: Colors.Ink },
  h: { fontSize: 16, fontWeight: '700', color: Colors.Ink, marginTop: 8 },
  event: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 14, gap: 4 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: FixedColors.hootza },
  err: { color: FixedColors.error, fontSize: 14 },
});
