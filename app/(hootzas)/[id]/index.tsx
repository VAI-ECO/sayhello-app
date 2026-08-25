/**
 * HOOTZA PAGE — live · ended · cancelled
 *
 * GET /api/hootzas/:id
 * POST /api/hootzas/:id/rsvp
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  getHootza,
  getCheckinCount,
  getRsvpCount,
  rsvpHootza,
  postHootzaAgain,
  type Hootza,
  type RsvpStatus,
} from '../../../src/api/hootzas';
import { api } from '../../../src/api/client';
import {
  formatCentsAsDollars,
  formatClock,
  formatHootzaTimeRange,
} from '../../../src/lib/hootza-format';
import {
  applyPostAgainTemplate,
  resetHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';

type ViewState = 'loading' | 'error' | 'empty' | 'data';

export default function HootzaPageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [postAgainLoading, setPostAgainLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setViewState('loading');
    setErrorMessage(null);

    const [hootzaRes, profileRes] = await Promise.all([
      getHootza(id),
      api.user.getProfile(),
    ]);

    if (hootzaRes.error || !hootzaRes.data?.hootza) {
      setViewState('error');
      setErrorMessage(hootzaRes.error?.message ?? t('error.notFound'));
      return;
    }

    setHootza(hootzaRes.data.hootza);
    const profile = profileRes.data as { id?: string } | undefined;
    if (profile?.id) setUserId(String(profile.id));
    setViewState('data');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isHost = Boolean(hootza && userId && hootza.hostUserId === userId);
  const goingCount = hootza ? getRsvpCount(hootza) : 0;
  const checkinCount = hootza ? getCheckinCount(hootza) : 0;
  const hostName = hootza?.host?.fullName ?? t('hootzas.common.host');

  async function handleRsvp(next: RsvpStatus) {
    if (!id || !hootza || hootza.status !== 'live') return;
    setRsvpLoading(true);
    const res = await rsvpHootza(id, next);
    setRsvpLoading(false);
    if (!res.error) setRsvpStatus(next);
  }

  async function handlePostAgain() {
    if (!id) return;
    setPostAgainLoading(true);
    const res = await postHootzaAgain(id);
    setPostAgainLoading(false);
    if (res.error || !res.data?.template) return;
    resetHootzaCreateDraft();
    applyPostAgainTemplate(id, res.data.template);
    router.push('/(hootzas)/create');
  }

  if (viewState === 'loading') {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="hootza-loading">
          <ActivityIndicator size="large" color={FixedColors.hootza} />
          <Text style={styles.loadingText}>{t('hootzas.common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (viewState === 'error') {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="hootza-error">
          <Text style={styles.errorTitle}>{errorMessage}</Text>
          <Button title={t('error.retry')} onPress={load} testID="hootza-retry" />
        </View>
      </ScreenContainer>
    );
  }

  if (!hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="hootza-empty">
          <Text style={styles.emptyText}>{t('hootzas.common.empty')}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  const showAddress =
    hootza.venueType === 'public_place' ||
    (hootza.venueType === 'private_residence' && rsvpStatus === 'going');

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          testID="hootza-back"
        >
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
        </TouchableOpacity>

        {hootza.status === 'live' && (
          <View style={styles.liveBadge} testID="hootza-live-badge">
            <Text style={styles.liveBadgeText}>{t('hootzas.status.live')}</Text>
          </View>
        )}

        {hootza.status === 'ended' && (
          <View style={styles.endedBand} testID="hootza-ended-band">
            <Text style={styles.bandLabel}>{t('hootzas.status.ended')}</Text>
            <Text style={styles.bandSub}>
              {t('hootzas.status.endedAt', {
                time: hootza.actualEndTime
                  ? formatClock(new Date(hootza.actualEndTime))
                  : hootza.scheduledEndTime
                    ? formatClock(new Date(hootza.scheduledEndTime))
                    : t('hootzas.create.endHint'),
              })}
            </Text>
          </View>
        )}

        {hootza.status === 'cancelled' && (
          <View style={styles.cancelledBand} testID="hootza-cancelled-band">
            <Text style={styles.bandLabel}>{t('hootzas.status.cancelled')}</Text>
            <Text style={styles.bandSubLight}>
              {t('hootzas.status.cancelledNotice', {
                host: hostName,
                date: new Date(hootza.cancelledAt ?? hootza.startTime).toLocaleDateString(
                  undefined,
                  { weekday: 'short' }
                ),
              })}
            </Text>
          </View>
        )}

        <Text style={styles.meta}>
          {t('hootzas.common.hootza')} ·{' '}
          {hootza.status === 'cancelled'
            ? t('hootzas.status.wasScheduled', {
                time: formatClock(new Date(hootza.startTime)),
              })
            : formatHootzaTimeRange(hootza.startTime, hootza.scheduledEndTime)}
        </Text>

        <Text
          style={[styles.title, hootza.status === 'cancelled' && styles.titleCancelled]}
          testID="hootza-title"
        >
          {hootza.title}
        </Text>

        <Text style={styles.hostLine}>{t('hootzas.common.hostedBy', { name: hostName })}</Text>

        <View style={styles.detailList}>
          <DetailRow
            title={
              hootza.venueType === 'public_place'
                ? t('hootzas.venue.publicPlace')
                : t('hootzas.venue.privateResidence')
            }
            subtitle={showAddress && hootza.locationName ? hootza.locationName : undefined}
          />
          {hootza.coverChargeAmount != null && hootza.coverChargeAmount > 0 && (
            <DetailRow
              title={t('hootzas.page.coverCharge', {
                amount: formatCentsAsDollars(hootza.coverChargeAmount),
              })}
              subtitle={t('hootzas.page.coverCollect', { host: hostName })}
            />
          )}
        </View>

        {hootza.description ? <Text style={styles.description}>{hootza.description}</Text> : null}

        {hootza.status === 'cancelled' && hootza.cancellationReason ? (
          <View style={styles.hostReasonBox}>
            <Text style={styles.sectionLabel}>{t('hootzas.page.fromHost')}</Text>
            <Text style={styles.hostReason}>{hootza.cancellationReason}</Text>
          </View>
        ) : null}

        {hootza.status === 'ended' && (
          <View style={styles.statsRow}>
            <StatCard value={String(checkinCount)} label={t('hootzas.page.checkedIn')} />
            <StatCard value={t('hootzas.common.notAvailable')} label={t('hootzas.page.hellosSaid')} />
          </View>
        )}

        {hootza.status === 'live' && (
          <View style={styles.goingBlock}>
            <Text style={styles.sectionLabel}>
              {t('hootzas.page.goingCount', { count: goingCount })}
            </Text>
          </View>
        )}

        {hootza.status !== 'live' && (
          <View style={styles.chatRow}>
            <Text style={styles.chatTitle}>{t('hootzas.page.chatRow')}</Text>
            <Text style={styles.chatSub}>
              {hootza.status === 'ended'
                ? t('hootzas.page.chatClosedEnded')
                : t('hootzas.page.chatClosedCancelled')}
            </Text>
          </View>
        )}

        {isHost && hootza.status === 'live' && (
          <Button
            title={t('hootzas.host.title')}
            onPress={() => router.push(`/(hootzas)/${id}/host-controls`)}
            style={styles.hostCta}
            testID="hootza-host-controls"
          />
        )}

        {!isHost && hootza.status === 'live' && (
          <TouchableOpacity
            onPress={() => router.push(`/(hootzas)/${id}/comments`)}
            style={styles.commentsLink}
            testID="hootza-comments-link"
          >
            <Text style={styles.commentsLinkText}>{t('hootzas.comments.title')}</Text>
          </TouchableOpacity>
        )}

        {hootza.status === 'live' && !isHost && (
          <View style={styles.footer}>
            {hootza.venueType === 'private_residence' && rsvpStatus !== 'going' && (
              <Text style={styles.privateNote}>{t('hootzas.venue.privateBeforeRsvp')}</Text>
            )}
            {rsvpStatus === 'going' ? (
              <>
                <Button
                  title={t('hootzas.page.youreGoing')}
                  onPress={() => handleRsvp('not_going')}
                  loading={rsvpLoading}
                  variant="secondary"
                  testID="hootza-rsvp-going"
                />
                <Text style={styles.footerNote}>{t('hootzas.page.tapAgain')}</Text>
                <Button
                  title={t('hootzas.checkIn.submit')}
                  onPress={() => router.push(`/(hootzas)/${id}/check-in`)}
                  style={styles.checkInBtn}
                  testID="hootza-check-in-link"
                />
              </>
            ) : (
              <>
                <Button
                  title={t('hootzas.page.imGoing')}
                  onPress={() => handleRsvp('going')}
                  loading={rsvpLoading}
                  testID="hootza-rsvp-go"
                />
                <Text style={styles.footerNote}>{t('hootzas.page.turnUpPoint')}</Text>
              </>
            )}
          </View>
        )}

        {hootza.status === 'ended' && isHost && (
          <View style={styles.footer}>
            <Button
              title={t('hootzas.page.postAgain')}
              onPress={handlePostAgain}
              loading={postAgainLoading}
              variant="secondary"
              testID="hootza-post-again"
            />
            <Text style={styles.footerNote}>{t('hootzas.page.postAgainHint')}</Text>
          </View>
        )}

        {hootza.status === 'cancelled' && (
          <View style={styles.footer}>
            <View style={styles.rsvpClosed}>
              <Text style={styles.rsvpClosedText}>{t('hootzas.page.rsvpClosed')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function DetailRow({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailTitle}>{title}</Text>
      {subtitle ? <Text style={styles.detailSub}>{subtitle}</Text> : null}
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, color: Colors.Muted },
  errorTitle: { fontSize: 17, color: Colors.Ink, textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 17, color: Colors.Muted },
  backButton: { paddingHorizontal: 22, paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  liveBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: 22,
    marginBottom: 12,
    backgroundColor: FixedColors.hootza,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: Colors.Chalk,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  endedBand: {
    backgroundColor: Colors.Ink,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginBottom: 12,
  },
  cancelledBand: {
    backgroundColor: Colors.SignalRed,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginBottom: 12,
  },
  bandLabel: {
    color: Colors.Chalk,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  bandSub: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 2 },
  bandSubLight: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },
  meta: {
    paddingHorizontal: 22,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: FixedColors.hootza,
    marginBottom: 5,
  },
  title: {
    paddingHorizontal: 22,
    fontSize: 27,
    fontWeight: '800',
    color: Colors.Ink,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  titleCancelled: {
    color: Colors.Muted,
    textDecorationLine: 'line-through',
  },
  hostLine: { paddingHorizontal: 22, fontSize: 15, color: Colors.Muted, marginTop: 6 },
  detailList: {
    marginTop: 13,
    marginHorizontal: 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  detailRow: { paddingVertical: 10, backgroundColor: Colors.Chalk },
  detailTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  detailSub: { fontSize: 14, color: Colors.Muted, marginTop: 2 },
  description: {
    paddingHorizontal: 22,
    marginTop: 13,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.Ink,
  },
  hostReasonBox: {
    marginHorizontal: 22,
    marginTop: 15,
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 15,
  },
  hostReason: { fontSize: 15, lineHeight: 22, color: Colors.Ink },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginBottom: 7,
  },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, marginTop: 15 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 14,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.Ink },
  statLabel: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  goingBlock: { paddingHorizontal: 22, marginTop: 13 },
  chatRow: {
    marginHorizontal: 22,
    marginTop: 13,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 13,
  },
  chatTitle: { fontSize: 15, fontWeight: '700', color: Colors.Muted },
  chatSub: { fontSize: 13, color: Colors.Faint, marginTop: 2 },
  hostCta: { marginHorizontal: 22, marginTop: 16 },
  commentsLink: { marginHorizontal: 22, marginTop: 12, paddingVertical: 8 },
  commentsLinkText: { fontSize: 16, fontWeight: '600', color: FixedColors.hootza },
  footer: { paddingHorizontal: 22, paddingTop: 14, gap: 8 },
  footerNote: { textAlign: 'center', fontSize: 13, color: Colors.Faint },
  privateNote: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginBottom: 4 },
  checkInBtn: { marginTop: 4 },
  rsvpClosed: {
    backgroundColor: Colors.Bone,
    borderRadius: 27,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsvpClosedText: { fontSize: 16, fontWeight: '700', color: Colors.Faint },
});
