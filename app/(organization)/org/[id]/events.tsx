/**
 * ORGANIZATION EVENT LIST (leads). Org-hosted Hootzas on the one Hootza model; counts, never rosters.
 * GET /api/organizations/:id/events, POST /api/organizations/:id/events/:hootzaId/post-to-feed
 */
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { Colors, FixedColors } from '../../../../src/theme/tokens';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgEvents, postOrgEventToFeed, updateOrgEventFlags } from '../../../../src/api/organizations';
import { formatHootzaTimeRange } from '../../../../src/lib/hootza-format';
import { OrgScreen, Loading, ErrorState, orgStyles } from '../../../../src/components/organization/parts';

export default function OrganizationEvents() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, retry, reload } = useLoader(() => getOrgEvents(id));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const events = data!.events;
  // A closed group cannot post, feed or edit events; the screen says so instead of offering controls that would be refused.
  const closed = data!.organizationStatus === 'closed';
  const canEdit = data!.canManage && !closed;

  const putOnFeed = async (hootzaId: string) => {
    setBusy(hootzaId); setError(null);
    const res = await postOrgEventToFeed(id, hootzaId);
    setBusy(null);
    if (res.error) {
      setError(res.error.code === 'out_of_free_posts' ? t('organizations.events.compose.outOfPosts')
        : res.error.code === 'organization_closed' ? t('l06.events.closedGroup') : t('organizations.common.saveFailed'));
      return;
    }
    void reload();
  };

  const setFlag = async (hootzaId: string, patch: { adultsOnly?: boolean; chatEnabled?: boolean }) => {
    setBusy(hootzaId); setError(null);
    const res = await updateOrgEventFlags(id, hootzaId, patch);
    setBusy(null);
    if (res.error) { setError(res.error.code === 'organization_closed' ? t('l06.events.closedGroup') : t('organizations.common.saveFailed')); return; }
    void reload();
  };

  return (
    <OrgScreen title={t('organizations.events.title')} onBack={() => router.back()}
      footer={canEdit ? <Button title={t('organizations.events.new')} onPress={() => router.push({ pathname: '/(organization)/org/[id]/new-event', params: { id } })} testID="org-events-new" /> : null}>
      {error ? <Text style={orgStyles.error} testID="org-events-error">{error}</Text> : null}
      {closed && data!.canManage ? <Text style={orgStyles.hint} testID="org-events-closed">{t('l06.events.closedGroup')}</Text> : null}
      {events.length === 0 ? <Text style={orgStyles.hint} testID="org-events-empty">{t('organizations.events.empty')}</Text> : events.map((e) => (
        <View key={e.id} style={s.card} testID={`org-ev-${e.id}`}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(hootzas)/[id]', params: { id: e.id } })} accessibilityRole="button">
            <Text style={s.title}>{e.title}</Text>
          </TouchableOpacity>
          <Text style={orgStyles.hint}>{formatHootzaTimeRange(e.startTime, e.scheduledEndTime)}</Text>
          <Text style={orgStyles.hint}>
            {t('organizations.events.goingN', { n: e.goingCount })} · {t('organizations.events.checkedIn', { n: e.checkInCount ?? 0 })}
            {e.status && e.status !== 'live' ? ` · ${t(e.status === 'cancelled' ? 'organizations.events.cancelled' : 'organizations.events.ended')}` : ''}
          </Text>
          {e.adultsOnly ? <Text style={orgStyles.hint} testID={`org-ev-adults-badge-${e.id}`}>{t('hootzas.create.adultsToggle')}</Text> : null}
          {e.chatEnabled ? <Text style={orgStyles.hint} testID={`org-ev-chat-badge-${e.id}`}>{t('hootzas.create.chatToggle')}</Text> : null}
          {e.status === 'live' && canEdit ? (
            <>
              <View style={s.flag}>
                <Text style={[orgStyles.hint, { flex: 1 }]}>{t('hootzas.create.chatToggle')}</Text>
                <Switch value={e.chatEnabled === true} disabled={busy === e.id} onValueChange={(v) => setFlag(e.id, { chatEnabled: v })} accessibilityLabel={t('hootzas.create.chatToggle')} testID={`org-ev-chat-${e.id}`} />
              </View>
              <View style={s.flag}>
                <Text style={[orgStyles.hint, { flex: 1 }]}>{t('hootzas.create.adultsToggle')}</Text>
                <Switch value={e.adultsOnly === true} disabled={busy === e.id} onValueChange={(v) => setFlag(e.id, { adultsOnly: v })} accessibilityLabel={t('hootzas.create.adultsToggle')} testID={`org-ev-adults-${e.id}`} />
              </View>
            </>
          ) : null}
          {e.status === 'ended' && canEdit ? (
            <Button title={t('l06.events.postAgain')} variant="secondary" testID={`org-ev-again-${e.id}`}
              onPress={() => router.push({ pathname: '/(organization)/org/[id]/new-event', params: { id, fromHootzaId: e.id } })} />
          ) : null}
          {e.status === 'live' && canEdit ? (
            e.postedToFeed ? <Text style={orgStyles.hint}>{t('organizations.events.onFeed')}</Text> : (
              <>
                <Text style={orgStyles.hint}>{t('organizations.events.onPageOnly')}</Text>
                <Button title={t('organizations.events.putOnFeed')} variant="secondary" loading={busy === e.id} onPress={() => putOnFeed(e.id)} testID={`org-ev-feed-${e.id}`} />
              </>
            )
          ) : null}
        </View>
      ))}
    </OrgScreen>
  );
}
const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 14, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: FixedColors.hootza },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
