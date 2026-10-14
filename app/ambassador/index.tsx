/**
 * AMBASSADOR — access and Overview (CANON-RL-03-SN-10 Overview · SN-17 Ambassador application).
 *
 * One entry for the role. The role is added to a personal account (ROLE-3 §1) and granted by a
 * reviewer after an application (§2), so this screen decides which side the user is on — from
 * GET /ambassador/me, never from the client:
 *   not an Ambassador → the application (form, or "with the reviewers"),
 *   an Ambassador     → the Overview: the book, what needs a visit next, and Earned and
 *                       Building SIDE BY SIDE (CLAUDE.md — Building never looks as certain).
 * Loading, error+retry and refocus refresh are real; nothing here is invented.
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Switch } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  applyAsAmbassador,
  getAmbassadorHangouts,
  getAmbassadorMe,
  getEarnings,
  setAwayMode,
  type AmbassadorHangout,
  type AmbassadorMe,
  type Earnings,
} from '../../src/api/ambassador';
import { AmbassadorShell, Card, Eyebrow, useAmbassadorLayout } from '../../src/components/ambassador/AmbassadorShell';
import { EarnedBuildingPair } from '../../src/components/ambassador/EarnedBuildingPair';
import { dayMonth } from '../../src/lib/ambassador-format';

type Loaded = { me: AmbassadorMe; book: AmbassadorHangout[]; earnings: Earnings | null };

export default function AmbassadorHomeScreen() {
  const router = useRouter();
  const layout = useAmbassadorLayout();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<Loaded | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    const meRes = await getAmbassadorMe();
    if (id !== loadId.current) return;
    if (meRes.error || !meRes.data) {
      setRefreshing(false);
      setState('error');
      return;
    }
    const me = meRes.data.me;
    if (!me.isAmbassador) {
      setData({ me, book: [], earnings: null });
      setRefreshing(false);
      setState('ready');
      return;
    }
    const [bookRes, earningsRes] = await Promise.all([getAmbassadorHangouts(), getEarnings()]);
    if (id !== loadId.current) return;
    setRefreshing(false);
    if (bookRes.error || !bookRes.data) {
      setState('error');
      return;
    }
    setData({ me, book: bookRes.data.hangouts, earnings: earningsRes.data?.earnings ?? null });
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (state === 'loading' && !data) {
    return (
      <AmbassadorShell title={t('ambassador.overview.title')}>
        <ActivityIndicator color={Colors.Ink} testID="ambassador-loading" />
      </AmbassadorShell>
    );
  }
  if (state === 'error' && !data) {
    return (
      <AmbassadorShell title={t('ambassador.overview.title')}>
        <Card tone="error" testID="ambassador-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.access.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="ambassador-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      </AmbassadorShell>
    );
  }
  if (!data) return null;

  if (!data.me.isAmbassador) {
    return <ApplicationView me={data.me} onSent={() => void load()} />;
  }

  return (
    <Overview
      data={data}
      layout={layout}
      refreshing={refreshing}
      onRefresh={() => void load(true)}
      go={(path) => router.push(path as never)}
      onAwayChanged={(awayMode) => setData((prev) => (prev ? { ...prev, me: { ...prev.me, awayMode } } : prev))}
    />
  );
}

// ── Not an Ambassador: the application ──────────────────────────────────────────
function ApplicationView({ me, onSent }: { me: AmbassadorMe; onSent: () => void }) {
  const [form, setForm] = useState({ fullName: '', workArea: '', phone: '', startingPlaces: '' });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // "Applies through your channel": the Creator code the sign-up link carried (?ref=code).
  const params = useLocalSearchParams<{ ref?: string }>();
  const channelCode = typeof params?.ref === 'string' && /^[a-zA-Z0-9]{1,20}$/.test(params.ref) ? params.ref : undefined;
  const open = me.application?.status === 'submitted';
  const reviewedBefore = me.application && me.application.status !== 'submitted';

  async function submit() {
    if (sending) return;
    if (Object.values(form).some((v) => !v.trim())) {
      setMessage(t('ambassador.access.required'));
      return;
    }
    setSending(true);
    setMessage(null);
    const res = await applyAsAmbassador({
      fullName: form.fullName.trim(),
      workArea: form.workArea.trim(),
      phone: form.phone.trim(),
      startingPlaces: form.startingPlaces.trim(),
      ...(channelCode ? { referredByCode: channelCode } : {}),
    });
    setSending(false);
    if (res.error) {
      if (res.error.code === 'applications_unavailable') setMessage(t('ambassador.access.unavailable'));
      else if (res.error.code === 'application_open') onSent();
      else if (res.error.code === 'already_ambassador') onSent();
      else setMessage(res.error.message || t('ambassador.access.loadFailed'));
      return;
    }
    onSent();
  }

  if (open) {
    return (
      <AmbassadorShell title={t('ambassador.access.submittedTitle')} subtitle={t('ambassador.access.lead')} testID="ambassador-application-open">
        <Card>
          <Text style={styles.body}>{t('ambassador.access.submittedBody')}</Text>
        </Card>
      </AmbassadorShell>
    );
  }
  if (!me.applicationsAvailable) {
    return (
      <AmbassadorShell title={t('ambassador.access.title')} subtitle={t('ambassador.access.lead')} testID="ambassador-application-unavailable">
        <Card>
          <Text style={styles.body}>{t('ambassador.access.unavailable')}</Text>
        </Card>
      </AmbassadorShell>
    );
  }

  const fields: { key: keyof typeof form; label: string; multiline?: boolean; keyboardType?: 'phone-pad' }[] = [
    { key: 'fullName', label: t('ambassador.access.fullName') },
    { key: 'workArea', label: t('ambassador.access.workArea') },
    { key: 'phone', label: t('ambassador.access.phone'), keyboardType: 'phone-pad' },
    { key: 'startingPlaces', label: t('ambassador.access.startingPlaces'), multiline: true },
  ];

  return (
    <AmbassadorShell title={t('ambassador.access.title')} subtitle={t('ambassador.access.lead')} testID="ambassador-application">
      {reviewedBefore ? <Text style={styles.muted} testID="ambassador-application-reviewed">{t('ambassador.access.reviewedNote')}</Text> : null}
      {channelCode ? <Text style={styles.muted} testID="ambassador-application-channel">{t('ambassador.access.throughChannel')}</Text> : null}
      {fields.map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            value={form[f.key]}
            onChangeText={(v) => { setForm((prev) => ({ ...prev, [f.key]: v })); setMessage(null); }}
            editable={!sending}
            multiline={f.multiline}
            keyboardType={f.keyboardType}
            accessibilityLabel={f.label}
            style={[styles.input, f.multiline && styles.inputMulti]}
            placeholderTextColor={Colors.Faint}
            testID={`ambassador-apply-${f.key}`}
          />
        </View>
      ))}
      {message ? <Text accessibilityRole="alert" style={styles.error} testID="ambassador-apply-message">{message}</Text> : null}
      <TouchableOpacity
        onPress={() => void submit()}
        disabled={sending}
        accessibilityRole="button"
        accessibilityState={{ disabled: sending, busy: sending }}
        style={[styles.solid, sending && styles.disabled]}
        testID="ambassador-apply-submit"
      >
        <Text style={styles.solidText}>{sending ? t('ambassador.access.sending') : t('ambassador.access.submit')}</Text>
      </TouchableOpacity>
    </AmbassadorShell>
  );
}

// ── An Ambassador: the Overview ─────────────────────────────────────────────────
function Overview({
  data,
  layout,
  refreshing,
  onRefresh,
  go,
  onAwayChanged,
}: {
  data: Loaded;
  layout: 'phone' | 'tablet' | 'desktop';
  refreshing: boolean;
  onRefresh: () => void;
  go: (path: string) => void;
  onAwayChanged: (awayMode: boolean) => void;
}) {
  const { me, book, earnings } = data;
  const [awayBusy, setAwayBusy] = useState(false);
  const [awayError, setAwayError] = useState(false);

  const complete = book.filter((h) => h.state === 'complete').length;
  const owed = book.filter((h) => h.state === 'needs_visit' || h.state === 'overdue');
  const eligibility = me.eligibility;

  async function toggleAway(next: boolean) {
    setAwayBusy(true);
    setAwayError(false);
    const res = await setAwayMode(next);
    setAwayBusy(false);
    if (res.error) {
      setAwayError(true);
      return;
    }
    onAwayChanged(next);
  }

  const stats = [
    { key: 'book', value: String(book.length), label: t('ambassador.overview.inBook'), color: Colors.Ink },
    { key: 'complete', value: String(complete), label: t('ambassador.overview.complete'), color: Colors.Fern },
    { key: 'owed', value: String(owed.length), label: t('ambassador.overview.needVisit'), color: Colors.Amber },
  ];

  return (
    <AmbassadorShell active="overview" title={t('ambassador.overview.title')} refreshing={refreshing} onRefresh={onRefresh} testID="ambassador-overview">
      {eligibility?.reason === 'visit_overdue' ? (
        <Card tone="error" testID="ambassador-behind">
          <Text style={styles.cardTitle}>{t('ambassador.overview.behindTitle')}</Text>
          <Text style={styles.body}>{t('ambassador.overview.behindBody')}</Text>
          <Text style={styles.body}>{t('ambassador.overview.behindList', { names: eligibility.behind.map((b) => b.name).join(', ') })}</Text>
        </Card>
      ) : null}

      {book.length === 0 ? (
        <>
          <Card testID="ambassador-book-empty">
            <Text style={styles.cardTitle}>{t('ambassador.overview.noRadiusTitle')}</Text>
            <Text style={styles.body}>{t('ambassador.overview.noRadiusBody')}</Text>
          </Card>
        </>
      ) : (
        <View style={[styles.statRow, layout === 'phone' && styles.statRowPhone]} testID="ambassador-stats">
          {stats.map((s) => (
            <View key={s.key} style={styles.stat}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <EarnedBuildingPair earnings={earnings} onOpen={() => go('/ambassador/earned-building')} />

      <Eyebrow>{t('ambassador.overview.needsNext')}</Eyebrow>
      {owed.length === 0 ? (
        <Text style={styles.muted} testID="ambassador-nothing-due">{t('ambassador.overview.nothingDue')}</Text>
      ) : (
        owed.map((h) => (
          <TouchableOpacity
            key={h.id}
            onPress={() => go('/ambassador/hangouts')}
            accessibilityRole="button"
            testID={`ambassador-owed-${h.id}`}
          >
            <Card>
              <Text style={styles.cardTitle}>
                {t(h.state === 'overdue' ? 'ambassador.overview.visitOverdue' : 'ambassador.overview.visitOwed', { name: h.name })}
              </Text>
              {h.dueBy ? (
                <Text style={styles.body}>
                  {t(h.state === 'overdue' ? 'ambassador.overview.overdueBody' : 'ambassador.overview.dueBy', { date: dayMonth(h.dueBy) })}
                </Text>
              ) : null}
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Card>
        <View style={styles.awayRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{t('ambassador.overview.awayTitle')}</Text>
            <Text style={styles.body}>{t('ambassador.overview.awayBody')}</Text>
          </View>
          <Switch
            value={me.awayMode}
            onValueChange={(v) => void toggleAway(v)}
            disabled={awayBusy}
            accessibilityLabel={t('ambassador.overview.awayTitle')}
            testID="ambassador-away"
          />
        </View>
        {awayError ? <Text accessibilityRole="alert" style={styles.error}>{t('ambassador.overview.awayFailed')}</Text> : null}
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => go('/ambassador/find-business')} accessibilityRole="button" style={styles.solid} testID="ambassador-sign">
          <Text style={styles.solidText}>{t('ambassador.overview.signCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/hangouts')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-book">
          <Text style={styles.outlineText}>{t('ambassador.overview.hangoutsCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/queue-offer')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-queue">
          <Text style={styles.outlineText}>{t('ambassador.overview.offersCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/visit-history')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-visits">
          <Text style={styles.outlineText}>{t('ambassador.overview.visitsCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/signup')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-payout-setup">
          <Text style={styles.outlineText}>{t('ambassador.signup.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/stands')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-stands">
          <Text style={styles.outlineText}>{t('stands.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/territory')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-territory">
          <Text style={styles.outlineText}>{t('ambRole.territory.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/toolkit')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-toolkit">
          <Text style={styles.outlineText}>{t('ambRole.toolkit.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/my-code')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-my-code">
          <Text style={styles.outlineText}>{t('ambRole.myCode.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/account')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-account">
          <Text style={styles.outlineText}>{t('ambRole.account.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/ambassador/store')} accessibilityRole="button" style={styles.outline} testID="ambassador-open-shop">
          <Text style={styles.outlineText}>{t('ambassador.store.title')}</Text>
        </TouchableOpacity>
      </View>
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  muted: { fontSize: 15, lineHeight: 23, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  field: { gap: 6 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  input: {
    backgroundColor: '#F2EFEB',
    borderRadius: 13,
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 17,
    color: Colors.Ink,
  },
  inputMulti: { minHeight: 104, textAlignVertical: 'top' },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 34, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.Line, paddingVertical: 18 },
  statRowPhone: { gap: 22 },
  stat: { gap: 3 },
  statValue: { fontSize: 34, lineHeight: 34, fontWeight: '700' },
  statLabel: { fontSize: 14, color: Colors.Muted },
  awayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { gap: 12, marginTop: 6 },
});
