/**
 * H9 HELLO HANGOUT DASHBOARD — CANON-RL-02-SN-07 (P 375 "Hello Hangout dashboard"
 * 8j · T 834 / D 1440 "Business" in Work Surfaces · D 1440 H9 in Operator Surfaces).
 * RULES §19.7: the desktop owner portal — at 1024 px and up this screen is the
 * D frame's layout (dark rail, "Your wall", four stat tiles, the wall, the
 * permanent no-customer-list notice). Below that, the P frame.
 *
 * Data: GET /hello-hangouts (the owner's Hello Hangouts) then
 * GET /hello-hangouts/:id/manage — ownership is checked on the server; this
 * screen never sends an owner or role. ROLE-2 §6: their page, their posts, their
 * remaining slots, their renewal date, their Ambassador — never a customer list.
 *
 * Not built, recorded: "On people's maps" (no canon definition of the figure),
 * "Discounts used" (redemption backend, SN-06), card / receipts / checkout
 * (payment provider — no real charge in this slice).
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { useTopSpacerHeight } from '../../src/components/StatusBarSpacer';
import { listMyHelloHangouts, type HelloHangout } from '../../src/api/hangouts';
import { getManage, type ManageData } from '../../src/api/directory';
import { formatCents } from '../../src/lib/money-format';
import { FoundingBadge } from '../../src/components/hangout/FoundingBadge';
import { VenueCodeCard } from '../../src/components/hangout/VenueCodeCard';

type Section = 'wall' | 'billing';

function dayMonth(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HangoutDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const spacerHeight = useTopSpacerHeight(44);
  const [mine, setMine] = useState<HelloHangout[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<ManageData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'none' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<Section>('wall');

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    const list = await listMyHelloHangouts();
    if (list.error) {
      setRefreshing(false);
      setState('error');
      return;
    }
    const rows = list.data?.helloHangouts ?? [];
    setMine(rows);
    const id = selected && rows.some((r) => r.id === selected) ? selected : rows[0]?.id ?? null;
    if (!id) {
      setRefreshing(false);
      setState('none');
      return;
    }
    setSelected(id);
    const manage = await getManage(id);
    setRefreshing(false);
    if (manage.error || !manage.data) {
      setState('error');
      return;
    }
    setData(manage.data);
    setState('ready');
  }, [selected]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (state === 'loading' && !data) {
    return <View style={[styles.container, styles.centered]}><ActivityIndicator color={Colors.Ink} /></View>;
  }
  if (state === 'none') {
    return (
      <View style={[styles.container, styles.centered]} testID="dashboard-unavailable">
        <Text style={styles.muted}>{t('hangout.dashboard.unavailable')}</Text>
        <TouchableOpacity style={styles.darkButton} onPress={() => router.push('/(hangout)/signup')} accessibilityRole="button">
          <Text style={styles.darkButtonText}>{t('hangout.dashboard.signUp')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (state === 'error' && !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="dashboard-error">
          <Text accessibilityRole="alert" style={styles.muted}>{t('hangout.dashboard.loadFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!data) return null;

  const hh = data.helloHangout;
  const id = hh.id;
  const go = {
    post: () => router.push({ pathname: '/(hangout)/create-post', params: { helloHangoutId: id } }),
    preview: () => router.push({ pathname: '/(hangout)/preview', params: { helloHangoutId: id } }),
    edit: () => router.push({ pathname: '/(hangout)/edit', params: { helloHangoutId: id } }),
    hours: () => router.push({ pathname: '/(hangout)/hours', params: { helloHangoutId: id } }),
    posts: () => router.push({ pathname: '/(hangout)/posts', params: { helloHangoutId: id } }),
    hootzas: () => router.push('/(hootzas)/create'),
    photos: () => router.push({ pathname: '/(hangout)/photos', params: { helloHangoutId: id } }),
    category: () => router.push({ pathname: '/(hangout)/category', params: { helloHangoutId: id } }),
    billing: () => router.push({ pathname: '/(hangout)/billing', params: { helloHangoutId: id } }),
    redeem: () => router.push({ pathname: '/(hangout)/redeem', params: { helloHangoutId: id } }),
  };

  const statusBanner =
    hh.status === 'pending_payment' ? t('hangout.dashboard.statusPending')
      : hh.status === 'lapsed' ? t('hangout.dashboard.statusLapsed')
        : hh.status === 'cancelled' ? t('hangout.dashboard.statusCancelled')
          : null;
  const directoryNote = !data.directory.available
    ? t('hangout.dashboard.directoryUnavailable')
    : !data.directory.published
      ? t('hangout.dashboard.neverPublished')
      : data.directory.unpublishedChanges
        ? t('hangout.dashboard.unpublished')
        : null;

  const freeValue = data.slots.remaining > 0
    ? t('hangout.dashboard.freePostsValue', { left: data.slots.remaining, total: data.slots.freeSlots })
    : t('hangout.dashboard.noneLeft');

  const stats = [
    { key: 'selfies', label: t('hangout.dashboard.selfiesOnWall'), value: data.wall ? data.wall.selfies.toLocaleString() : '—', note: t('hangout.dashboard.takenHere') },
    { key: 'slots', label: t('hangout.dashboard.freePostsLeft'), value: freeValue, note: hh.founding ? t('hangout.dashboard.foundingThird') : '' },
    { key: 'renews', label: t('hangout.dashboard.renews'), value: hh.renewsAt ? dayMonth(hh.renewsAt) : t('hangout.dashboard.notYetPaid'), note: hh.founding && hh.renewsAt ? t('hangout.dashboard.renewsNote') : '' },
  ];

  const notices = (
    <>
      {statusBanner ? <Text style={styles.banner} testID="dashboard-status-banner">{statusBanner}</Text> : null}
      {!hh.pinSet ? <Text style={styles.banner} testID="dashboard-pin-missing">{t('hangout.dashboard.pinMissing')}</Text> : null}
      {directoryNote ? <Text style={styles.banner} testID="dashboard-directory-note">{directoryNote}</Text> : null}
    </>
  );

  const actionButtons = (
    <View style={styles.actionGrid}>
      {[
        ['preview', 'hangout.dashboard.yourListing', go.preview],
        ['edit', 'hangout.dashboard.editDetails', go.edit],
        ['hours', 'hangout.dashboard.hoursLink', go.hours],
        ['posts', 'hangout.dashboard.managePosts', go.posts],
        ['photos', 'hangoutBiz.nav.photos', go.photos],
        ['category', 'hangoutBiz.nav.category', go.category],
        ['membership', 'hangoutBiz.nav.membership', go.billing],
        ['redeem', 'hangoutBiz.nav.redeem', go.redeem],
      ].map(([key, label, fn]) => (
        <TouchableOpacity key={key as string} style={styles.actionTile} onPress={fn as () => void} accessibilityRole="button" testID={`dashboard-${key}`}>
          <Text style={styles.actionTileText}>{t(label as string)}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const wallPanel = (
    <View style={styles.wallPanel} testID="dashboard-wall">
      {data.wall === null ? (
        <Text style={styles.muted}>{t('hangout.dashboard.wallUnavailable')}</Text>
      ) : data.wall.tiles.length === 0 ? (
        <Text style={styles.muted}>{t('hangout.dashboard.wallEmpty')}</Text>
      ) : (
        <View style={styles.wallTiles}>
          {data.wall.tiles.map((tile) => (
            <View key={tile.helloId} style={styles.wallTile}>
              <View style={styles.wallImage} />
              <View style={styles.wallNames}>
                {tile.colors.map((c, i) => <View key={i} style={[styles.dot, { backgroundColor: c ?? Colors.Line, marginLeft: i ? -6 : 0 }]} />)}
                <Text style={styles.wallNameText} numberOfLines={1}>{tile.names.join(' and ')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      {/* Permanent, not dismissible: the refusal is the feature (H9 element register). */}
      <View style={styles.noList} testID="dashboard-no-customer-list">
        <Text style={styles.noListTitle}>{t('hangout.dashboard.noCustomerList')}</Text>
        <Text style={styles.muted}>{t('hangout.dashboard.noCustomerListBody')}</Text>
      </View>
    </View>
  );

  const billingPanel = (
    <View style={styles.card} testID="dashboard-billing">
      <Text style={styles.cardLabel}>{t('hangout.dashboard.billingTitle')}</Text>
      <View style={styles.billingRow}><Text style={styles.muted}>{t('hangout.dashboard.membership')}</Text><Text style={styles.billingValue}>{formatCents(hh.priceCents)}</Text></View>
      <View style={styles.billingRow}><Text style={styles.muted}>{t('hangout.dashboard.renews')}</Text><Text style={styles.billingValue}>{hh.renewsAt ? dayMonth(hh.renewsAt) : t('hangout.dashboard.notYetPaid')}</Text></View>
      <TouchableOpacity onPress={go.billing} accessibilityRole="button" testID="dashboard-billing-manage"><Text style={styles.billingValue}>{t('hangoutBiz.nav.membership')} ›</Text></TouchableOpacity>
    </View>
  );

  const codePanel = <VenueCodeCard helloHangoutId={id} />;

  const onNow = (
    <View style={styles.card} testID="dashboard-on-now">
      <Text style={styles.cardLabel}>{t('hangout.dashboard.onNow')}</Text>
      {data.onNow.length === 0 ? <Text style={styles.muted}>{t('hangout.dashboard.nothingOn')}</Text> : data.onNow.map((p) => (
        <TouchableOpacity key={p.id} style={styles.onNowRow} onPress={go.posts} accessibilityRole="button">
          <Text style={styles.onNowTitle}>{p.title}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const switcher = mine.length > 1 ? (
    <ScrollView horizontal contentContainerStyle={styles.switcher} showsHorizontalScrollIndicator={false}>
      {mine.map((m) => (
        <TouchableOpacity key={m.id} onPress={() => { setSelected(m.id); setState('loading'); setData(null); }} style={[styles.switchChip, m.id === id && styles.switchChipOn]} accessibilityRole="button">
          <Text style={[styles.switchText, m.id === id && styles.switchTextOn]}>{m.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : null;

  if (wide) {
    const rail: Array<[string, string, () => void, boolean]> = [
      ['wall', 'hangout.dashboard.railWall', () => setSection('wall'), section === 'wall'],
      ['listing', 'hangout.dashboard.railListing', go.preview, false],
      ['posts', 'hangout.dashboard.railPosts', go.posts, false],
      ['hootzas', 'hangout.dashboard.railHootzas', go.hootzas, false],
      ['billing', 'hangout.dashboard.railBilling', () => setSection('billing'), section === 'billing'],
    ];
    return (
      <View style={styles.wideRoot} testID="dashboard-desktop">
        <View style={styles.rail}>
          <Text style={styles.railName}>{hh.name}</Text>
          {rail.map(([key, label, fn, on]) => (
            <TouchableOpacity key={key} onPress={fn} style={[styles.railItem, on && styles.railItemOn]} accessibilityRole="button" testID={`rail-${key}`}>
              <Text style={[styles.railText, on && styles.railTextOn]}>{t(label)}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.railFoot}>
            <Text style={styles.railFootLabel}>{t('hangout.dashboard.yourAmbassador')}</Text>
            <Text style={styles.railFootName}>{data.ambassador?.displayName ?? t('hangout.dashboard.noAmbassador')}</Text>
          </View>
        </View>
        <ScrollView style={styles.wideMain} contentContainerStyle={styles.wideMainContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}>
          {switcher}
          <View style={styles.wideHeader}>
            <View style={{ gap: 5 }}>
              <View style={styles.titleRow}>
                <Text style={styles.wideTitle}>{t(section === 'wall' ? 'hangout.dashboard.yourWall' : 'hangout.dashboard.billingTitle')}</Text>
                {hh.founding ? <FoundingBadge size={16} withWord wordColor={Colors.Ink} /> : null}
              </View>
              {section === 'wall' ? <Text style={styles.muted}>{t('hangout.dashboard.wallSub')}</Text> : null}
            </View>
            <TouchableOpacity style={styles.darkPill} onPress={go.post} accessibilityRole="button" testID="dashboard-post-cta">
              <Text style={styles.darkPillText}>{t('hangout.dashboard.postSomething')}</Text>
            </TouchableOpacity>
          </View>
          {notices}
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.key} style={styles.stat} testID={`stat-${s.key}`}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                {s.note ? <Text style={styles.statNote}>{s.note}</Text> : null}
              </View>
            ))}
          </View>
          {actionButtons}
          {section === 'wall' ? wallPanel : billingPanel}
          {onNow}
          {codePanel}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="dashboard-phone">
      <View style={[styles.darkHeader, { paddingTop: spacerHeight + 4 }]}>
        <View style={styles.darkHeaderTop}>
          {hh.founding ? <FoundingBadge size={30} withWord /> : <View />}
        </View>
        <Text style={styles.darkSub} testID="dashboard-status">{hh.name}</Text>
        <Text style={styles.darkTitle}>{hh.status === 'active' ? t('hangout.dashboard.working') : hh.name}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.phoneBody} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}>
        {switcher}
        {notices}
        <View style={styles.card} testID="stat-this-month">
          <Text style={styles.muted}>{t('hangout.dashboard.saidHelloMonth')}</Text>
          {data.wall ? (
            <>
              <Text style={styles.bigValue}>{data.wall.thisMonth.toLocaleString()}</Text>
              <Text style={styles.muted}>{t('hangout.dashboard.lastMonth', { n: data.wall.lastMonth })}</Text>
            </>
          ) : <Text style={styles.muted}>{t('hangout.dashboard.wallUnavailable')}</Text>}
        </View>
        <View style={styles.twoUp}>
          {stats.map((s) => (
            <View key={s.key} style={[styles.card, styles.half]} testID={`stat-${s.key}`}>
              <Text style={styles.muted}>{s.label}</Text>
              <Text style={styles.midValue}>{s.value}</Text>
            </View>
          ))}
        </View>
        {onNow}
        {actionButtons}
        {wallPanel}
        {billingPanel}
        {codePanel}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('hangout.dashboard.yourAmbassador')}</Text>
          <Text style={styles.onNowTitle}>{data.ambassador?.displayName ?? t('hangout.dashboard.noAmbassador')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.postButton} onPress={go.post} accessibilityRole="button" testID="dashboard-post-cta">
          <Text style={styles.postButtonText}>{t('hangout.dashboard.postSomething')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBFA' },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  muted: { fontSize: 13, lineHeight: 19, color: Colors.Muted },
  darkButton: { backgroundColor: Colors.Ink, borderRadius: 12, minHeight: 48, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  darkButtonText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  darkHeader: { backgroundColor: Colors.Ink, paddingHorizontal: 20, paddingBottom: 18, gap: 12 },
  darkHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  darkSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  darkTitle: { fontSize: 24, lineHeight: 28, fontWeight: '800', color: Colors.Chalk, letterSpacing: -0.5 },
  phoneBody: { padding: 16, gap: 12, paddingBottom: 32 },
  banner: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 12, padding: 12, overflow: 'hidden' },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, backgroundColor: Colors.Chalk, padding: 14, gap: 6 },
  cardLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', color: Colors.Faint },
  bigValue: { fontSize: 34, lineHeight: 36, fontWeight: '800', color: Colors.Ink, letterSpacing: -1 },
  midValue: { fontSize: 22, fontWeight: '800', color: Colors.Ink },
  twoUp: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  half: { flexGrow: 1, flexBasis: '45%' },
  onNowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  onNowTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink, flex: 1 },
  chevron: { fontSize: 20, color: Colors.Faint },
  actionGrid: { gap: 8 },
  actionTile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, backgroundColor: Colors.Chalk, paddingHorizontal: 14, minHeight: 48 },
  actionTileText: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  wallPanel: { gap: 12 },
  wallTiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  wallTile: { width: 168, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.Chalk },
  wallImage: { height: 120, backgroundColor: '#2E2C29' },
  wallNames: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  wallNameText: { fontSize: 13, fontWeight: '600', color: Colors.Ink, flex: 1 },
  noList: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#D7D2CB', borderRadius: 12, padding: 14, gap: 4 },
  noListTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billingValue: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  footer: { borderTopWidth: 1, borderTopColor: Colors.Hairline, padding: 12, backgroundColor: '#FCFBFA' },
  postButton: { minHeight: 48, borderRadius: 12, backgroundColor: Colors.Ink, alignItems: 'center', justifyContent: 'center' },
  postButtonText: { fontSize: 16, fontWeight: '700', color: Colors.Chalk },
  switcher: { gap: 8 },
  switchChip: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  switchChipOn: { backgroundColor: Colors.Ink, borderColor: Colors.Ink },
  switchText: { fontSize: 13, color: Colors.Ink },
  switchTextOn: { color: Colors.Chalk, fontWeight: '700' },
  // Desktop portal (D 1440 H9)
  wideRoot: { flex: 1, flexDirection: 'row', backgroundColor: Colors.Chalk },
  rail: { width: 216, backgroundColor: Colors.Ink, paddingVertical: 22, gap: 4 },
  railName: { paddingHorizontal: 20, paddingBottom: 14, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', fontWeight: '700' },
  railItem: { paddingVertical: 11, paddingHorizontal: 20, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  railItemOn: { backgroundColor: 'rgba(255,255,255,0.09)', borderLeftColor: Colors.DeepFern },
  railText: { fontSize: 15, color: 'rgba(255,255,255,0.62)' },
  railTextOn: { color: Colors.Chalk, fontWeight: '700' },
  railFoot: { marginTop: 'auto', paddingHorizontal: 20, gap: 5 },
  railFootLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', fontWeight: '700' },
  railFootName: { fontSize: 14, color: 'rgba(255,255,255,0.86)' },
  wideMain: { flex: 1 },
  wideMainContent: { padding: 30, gap: 18 },
  wideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, borderBottomWidth: 1, borderBottomColor: Colors.Hairline, paddingBottom: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wideTitle: { fontSize: 28, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7 },
  darkPill: { backgroundColor: Colors.Ink, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18 },
  darkPillText: { color: Colors.Chalk, fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 3 },
  statLabel: { fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '700', color: Colors.Faint },
  statValue: { fontSize: 26, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.8 },
  statNote: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
});
