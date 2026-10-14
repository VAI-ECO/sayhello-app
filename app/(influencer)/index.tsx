/**
 * CREATOR — access and Overview (CANON-RL-04-SN-01 "Two streams" · Signup Flows 03 Creator).
 *
 * Access is decided by GET /influencer/me — a record, not a role value:
 *   no code, no application  → the application (name · where people find you · phone),
 *   application submitted    → "with the reviewers",
 *   approved, no code yet    → pick your code,
 *   has a code               → Two streams: businesses signed on the code (A) and Ambassadors who
 *                              came through the channel (B), Earned and Building side by side.
 * Every figure is an MA-05 slot: until the server clears it the screen describes the mechanism and
 * quantifies nothing ("No figure. No example. No 'up to'." — SN-09).
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  applyAsInfluencer,
  getInfluencerEarnings,
  getInfluencerMe,
  type InfluencerEarnings,
  type InfluencerMe,
} from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { EarnedBuildingTiles } from '../../src/components/ambassador/EarnedBuildingPair';
import { formatCents } from '../../src/lib/money-format';

type Loaded = { me: InfluencerMe; earnings: InfluencerEarnings | null };

export default function CreatorHomeScreen() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<Loaded | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    const meRes = await getInfluencerMe();
    if (id !== loadId.current) return;
    if (!meRes || meRes.error || !meRes.data) {
      setRefreshing(false);
      setState('error');
      return;
    }
    const me = meRes.data.me;
    let earnings: InfluencerEarnings | null = null;
    if (me.isInfluencer) {
      const res = await getInfluencerEarnings();
      if (id !== loadId.current) return;
      earnings = res?.data?.earnings ?? null;
    }
    setData({ me, earnings });
    setRefreshing(false);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (state === 'loading' && !data) {
    return (
      <InfluencerShell title={t('influencer.overview.title')}>
        <ActivityIndicator color={Colors.Ink} testID="creator-loading" />
      </InfluencerShell>
    );
  }
  if (state === 'error' && !data) {
    return (
      <InfluencerShell title={t('influencer.overview.title')}>
        <Card tone="error" testID="creator-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('influencer.access.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="creator-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      </InfluencerShell>
    );
  }
  if (!data) return null;

  if (!data.me.isInfluencer) {
    return <Application me={data.me} onChanged={() => void load()} goPick={() => router.push('/(influencer)/pick-code')} />;
  }

  const { earnings } = data;
  const cleared = Boolean(earnings?.figuresCleared) && earnings?.flatRateCents != null;
  const rate = cleared ? t('influencer.overview.rateFmt', { amount: formatCents(earnings!.flatRateCents!) }) : null;
  const streams = [
    { key: 'a', color: Colors.Fern, title: t('influencer.overview.streamATitle'), sub: t('influencer.overview.streamASub') },
    { key: 'b', color: Colors.Plum, title: t('influencer.overview.streamBTitle'), sub: t('influencer.overview.streamBSub') },
  ];

  return (
    <InfluencerShell active="overview" title={t('influencer.overview.title')} subtitle={t('influencer.overview.lead')} refreshing={refreshing} onRefresh={() => void load(true)} testID="creator-overview">
      {streams.map((s) => (
        <Card key={s.key} testID={`creator-stream-${s.key}`}>
          <Text style={[styles.eyebrow, { color: s.color }]}>{t('influencer.overview.stream')}</Text>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.body}>{s.sub}</Text>
          {rate ? <Text style={styles.rate}>{rate}</Text> : null}
        </Card>
      ))}
      {!cleared ? (
        <Card testID="creator-before-clearance">
          <Text style={styles.cardTitle}>{t('influencer.overview.beforeClearanceTitle')}</Text>
          <Text style={styles.body}>{t('influencer.overview.beforeClearanceBody')}</Text>
        </Card>
      ) : null}

      <EarnedBuildingTiles
        earnedCount={earnings ? earnings.earned.length : null}
        buildingCount={earnings ? earnings.building.length : null}
        earnedSubKey="influencer.earnings.earnedSub"
        onOpen={() => router.push('/(influencer)/earnings')}
      />

      <Card>
        <Text style={styles.cardTitle}>{t('influencer.overview.flatTitle')}</Text>
        <Text style={styles.body}>{t('influencer.overview.flatBody')}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>{t('influencer.overview.paidTitle')}</Text>
        <Text style={styles.body}>{t('influencer.overview.paidBody')}</Text>
      </Card>
      <Text style={styles.small}>{t('figures.ma05Disclaimer')}</Text>

      <View style={styles.actions}>
        {([
          ['links', 'influencer.overview.linksCta', '/(influencer)/my-links'],
          ['ambassadors', 'influencer.overview.ambassadorsCta', '/(influencer)/ambassadors'],
          ['earnings', 'influencer.overview.earningsCta', '/(influencer)/earnings'],
          ['toolkit', 'influencer.overview.toolkitCta', '/(influencer)/toolkit'],
          ['account', 'influencer.overview.accountCta', '/(influencer)/account'],
        ] as const).map(([key, label, path]) => (
          <TouchableOpacity key={key} onPress={() => router.push(path)} accessibilityRole="button" style={styles.outline} testID={`creator-open-${key}`}>
            <Text style={styles.outlineText}>{t(label)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </InfluencerShell>
  );
}

function Application({ me, onChanged, goPick }: { me: InfluencerMe; onChanged: () => void; goPick: () => void }) {
  const [form, setForm] = useState({ fullName: '', channel: '', phone: '' });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (sending) return;
    if (Object.values(form).some((v) => !v.trim())) {
      setMessage(t('influencer.access.required'));
      return;
    }
    setSending(true);
    setMessage(null);
    const res = await applyAsInfluencer({ fullName: form.fullName.trim(), channel: form.channel.trim(), phone: form.phone.trim() });
    setSending(false);
    if (res.error) {
      if (res.error.code === 'applications_unavailable') setMessage(t('influencer.access.unavailable'));
      else if (res.error.code === 'application_open' || res.error.code === 'already_influencer') onChanged();
      else setMessage(res.error.message || t('influencer.access.loadFailed'));
      return;
    }
    onChanged();
  }

  if (me.canPickCode) {
    return (
      <InfluencerShell title={t('influencer.access.approvedTitle')} subtitle={t('influencer.access.approvedBody')} testID="creator-approved">
        <TouchableOpacity onPress={goPick} accessibilityRole="button" style={styles.solid} testID="creator-pick-code">
          <Text style={styles.solidText}>{t('influencer.access.pickCta')}</Text>
        </TouchableOpacity>
      </InfluencerShell>
    );
  }
  if (me.application?.status === 'submitted') {
    return (
      <InfluencerShell title={t('influencer.access.submittedTitle')} subtitle={t('influencer.access.lead')} testID="creator-application-open">
        <Card><Text style={styles.body}>{t('influencer.access.submittedBody')}</Text></Card>
      </InfluencerShell>
    );
  }
  if (!me.applicationsAvailable) {
    return (
      <InfluencerShell title={t('influencer.access.title')} subtitle={t('influencer.access.lead')} testID="creator-application-unavailable">
        <Card><Text style={styles.body}>{t('influencer.access.unavailable')}</Text></Card>
      </InfluencerShell>
    );
  }

  const fields: { key: keyof typeof form; label: string; hint?: string; keyboardType?: 'phone-pad' }[] = [
    { key: 'fullName', label: t('influencer.access.fullName') },
    { key: 'channel', label: t('influencer.access.channel'), hint: t('influencer.access.channelHint') },
    { key: 'phone', label: t('influencer.access.phone'), keyboardType: 'phone-pad' },
  ];

  return (
    <InfluencerShell title={t('influencer.access.title')} subtitle={t('influencer.access.lead')} testID="creator-application">
      {me.application ? <Text style={styles.body} testID="creator-application-reviewed">{t('influencer.access.reviewedNote')}</Text> : null}
      {fields.map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            value={form[f.key]}
            onChangeText={(v) => { setForm((prev) => ({ ...prev, [f.key]: v })); setMessage(null); }}
            editable={!sending}
            keyboardType={f.keyboardType}
            placeholder={f.hint}
            placeholderTextColor={Colors.Faint}
            accessibilityLabel={f.label}
            style={styles.input}
            testID={`creator-apply-${f.key}`}
          />
        </View>
      ))}
      <Text style={styles.small}>{t('influencer.access.note')}</Text>
      {message ? <Text accessibilityRole="alert" style={styles.error} testID="creator-apply-message">{message}</Text> : null}
      <TouchableOpacity
        onPress={() => void submit()}
        disabled={sending}
        accessibilityRole="button"
        accessibilityState={{ disabled: sending, busy: sending }}
        style={[styles.solid, sending && styles.disabled]}
        testID="creator-apply-submit"
      >
        <Text style={styles.solidText}>{sending ? t('influencer.access.sending') : t('influencer.access.submit')}</Text>
      </TouchableOpacity>
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 14.5, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  eyebrow: { fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '800' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  rate: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  field: { gap: 6 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  input: { backgroundColor: '#F2EFEB', borderRadius: 13, minHeight: 52, paddingHorizontal: 18, paddingVertical: 12, fontSize: 17, color: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  actions: { gap: 12, marginTop: 6 },
});
