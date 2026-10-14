/**
 * MY HELLO HANGOUTS — A2 / CANON-RL-03-SN-11 Portfolio (T table) · SN-12 Portfolio empty (P).
 *
 * GET /ambassador/hangouts: the Hello Hangouts this Ambassador looks after or signed.
 * "Origination never transfers; servicing does" — both facts are shown per row. Origination
 * date is displayed (§14.11). Nothing on a row says money is owed before the venue pays.
 *
 * Actions, all server-checked: Check in (→ visit-check-in with THIS venue's id) and, for a
 * Founding signup that has not paid, "Move to the deferred coupon" — the server refuses it
 * unless this Ambassador has two verified visits (§1.3), so the reasons are shown, never
 * assumed. Not built from the delivered portfolio, recorded: "QR flag" and "At risk" states
 * (need customer-scan and slipping/abandoned analytics, §16.25–16.29).
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { deferCoupon, getAmbassadorHangouts, type AmbassadorHangout, type BookState } from '../../src/api/ambassador';
import { AmbassadorShell, Card, useAmbassadorLayout } from '../../src/components/ambassador/AmbassadorShell';
import { dayMonth, dayMonthYear, stateLabel } from '../../src/lib/ambassador-format';

const STATE_COLOR: Record<BookState, string> = {
  complete: Colors.DeepFern,
  needs_visit: Colors.Amber,
  overdue: Colors.Amber,
  awaiting_payment: Colors.Muted,
  no_schedule: Colors.Muted,
  lapsed: Colors.Muted,
  cancelled: Colors.Muted,
};

function windowsVisited(h: AmbassadorHangout): number | null {
  if (!h.term) return null;
  return Number(h.term.window1.visited) + Number(h.term.window2.visited);
}

export default function MyHelloHangoutsScreen() {
  const router = useRouter();
  const layout = useAmbassadorLayout();
  const [hangouts, setHangouts] = useState<AmbassadorHangout[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [deferring, setDeferring] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(null);
  const loadId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    const res = await getAmbassadorHangouts();
    if (id !== loadId.current) return;
    setRefreshing(false);
    if (res.error || !res.data) {
      setState('error');
      return;
    }
    setHangouts(res.data.hangouts);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function defer(h: AmbassadorHangout) {
    if (deferring) return;
    setDeferring(h.id);
    setNotice(null);
    const res = await deferCoupon(h.id);
    setDeferring(null);
    if (res.error) {
      const known = ['second_visit_required', 'founding_window_closed', 'already_paid', 'not_founding', 'price_check_conflict', 'forbidden'];
      const code = res.error.code ?? '';
      setNotice({
        id: h.id,
        text: known.includes(code) ? t(`ambassador.hangouts.deferErrors.${code}`) : res.error.message || t('ambassador.hangouts.loadFailed'),
      });
      return;
    }
    setNotice({ id: h.id, text: t('ambassador.hangouts.deferDone') });
    void load();
  }

  const openCheckIn = (h: AmbassadorHangout) =>
    router.push({ pathname: '/ambassador/visit-check-in', params: { helloHangoutId: h.id } });

  const subtitle = state === 'ready' && hangouts.length > 0
    ? `${t('ambassador.hangouts.countInBook', { count: hangouts.length })} ${t('ambassador.hangouts.lead')}`
    : undefined;

  return (
    <AmbassadorShell active="hangouts" title={t('ambassador.hangouts.title')} subtitle={subtitle} refreshing={refreshing} onRefresh={() => void load(true)} testID="ambassador-hangouts">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="hangouts-loading" />
      ) : state === 'error' ? (
        <Card tone="error" testID="hangouts-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.hangouts.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="hangouts-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : hangouts.length === 0 ? (
        <View style={styles.gap} testID="hangouts-empty">
          <Text style={styles.emptyTitle}>{t('ambassador.hangouts.emptyTitle')}</Text>
          <Text style={styles.body}>{t('ambassador.hangouts.emptyBody')}</Text>
          <Card>
            <Text style={styles.cardTitle}>{t('ambassador.hangouts.goSignTitle')}</Text>
            <Text style={styles.body}>{t('ambassador.hangouts.goSignBody')}</Text>
          </Card>
          <TouchableOpacity onPress={() => router.push('/ambassador/find-business')} accessibilityRole="button" style={styles.solid} testID="hangouts-sign">
            <Text style={styles.solidText}>{t('ambassador.hangouts.signCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/ambassador/queue-offer')} accessibilityRole="button" style={styles.outline} testID="hangouts-queue-link">
            <Text style={styles.outlineText}>{t('ambassador.hangouts.offersCta')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gap}>
          {layout !== 'phone' ? (
            <View style={styles.tableHead} testID="hangouts-table-head">
              <Text style={[styles.th, styles.colName]}>{t('ambassador.hangouts.colName')}</Text>
              <Text style={[styles.th, styles.colVisits]}>{t('ambassador.hangouts.colVisits')}</Text>
              <Text style={[styles.th, styles.colRenews]}>{t('ambassador.hangouts.colRenews')}</Text>
              <Text style={[styles.th, styles.colState]}>{t('ambassador.hangouts.colState')}</Text>
            </View>
          ) : null}
          <View style={styles.list} testID="hangouts-list">
            {hangouts.map((h, index) => {
              const done = windowsVisited(h);
              const canDefer = h.state === 'awaiting_payment' && h.tier === 'founding' && h.youOriginated;
              const canVisit = h.state !== 'lapsed' && h.state !== 'cancelled';
              return (
                <View key={h.id} style={[styles.row, index > 0 && styles.rowBorder]} testID={`hangout-${h.id}`}>
                  <View style={layout === 'phone' ? styles.rowPhone : styles.rowWide}>
                    <View style={layout === 'phone' ? undefined : styles.colName}>
                      <Text style={styles.rowTitle}>{h.name}</Text>
                      <Text style={styles.rowMeta}>{h.address}</Text>
                      <Text style={styles.rowMeta}>
                        {[h.youOriginated ? t('ambassador.hangouts.youOriginated') : null, h.youService ? t('ambassador.hangouts.youService') : null, h.founding ? t('ambassador.hangouts.founding') : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                      <Text style={styles.rowMeta}>{t('ambassador.hangouts.originated', { date: dayMonthYear(h.originatedAt) })}</Text>
                    </View>
                    {layout !== 'phone' ? (
                      <>
                        <Text style={[styles.cell, styles.colVisits]}>{done === null ? '—' : t('ambassador.hangouts.visitsOf', { done, total: 2 })}</Text>
                        <Text style={[styles.cell, styles.colRenews]}>{h.renewsAt ? dayMonth(h.renewsAt) : '—'}</Text>
                      </>
                    ) : null}
                    <View style={layout === 'phone' ? styles.statePhone : styles.colState}>
                      <Text style={[styles.stateText, { color: STATE_COLOR[h.state] }]} testID={`hangout-state-${h.id}`}>{stateLabel(h.state)}</Text>
                      {layout === 'phone' && done !== null ? (
                        <Text style={styles.rowMeta}>{t('ambassador.hangouts.visitsOf', { done, total: 2 })}{h.renewsAt ? ` · ${t('ambassador.hangouts.colRenews')} ${dayMonth(h.renewsAt)}` : ''}</Text>
                      ) : null}
                    </View>
                  </View>
                  {h.state === 'awaiting_payment' ? <Text style={styles.rowMeta}>{t('ambassador.hangouts.awaitingPaymentNote')}</Text> : null}
                  {h.dueBy && (h.state === 'needs_visit' || h.state === 'overdue') ? (
                    <Text style={styles.rowMeta}>{t('ambassador.hangouts.dueBy', { date: dayMonth(h.dueBy) })}</Text>
                  ) : null}
                  <View style={styles.rowActions}>
                    {canVisit ? (
                      <TouchableOpacity onPress={() => openCheckIn(h)} accessibilityRole="button" style={styles.smallSolid} testID={`hangout-checkin-${h.id}`}>
                        <Text style={styles.smallSolidText}>{t('ambassador.hangouts.checkIn')}</Text>
                      </TouchableOpacity>
                    ) : null}
                    {canVisit && h.youService ? (
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/ambassador/owner-claim', params: { helloHangoutId: h.id, name: h.name } })}
                        accessibilityRole="button"
                        style={styles.smallOutline}
                        testID={`hangout-owner-link-${h.id}`}
                      >
                        <Text style={styles.smallOutlineText}>{t('ambassadorS3.ownerClaim.cta')}</Text>
                      </TouchableOpacity>
                    ) : null}
                    {canDefer ? (
                      <TouchableOpacity
                        onPress={() => void defer(h)}
                        disabled={deferring !== null}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: deferring !== null, busy: deferring === h.id }}
                        style={[styles.smallOutline, deferring !== null && styles.disabled]}
                        testID={`hangout-defer-${h.id}`}
                      >
                        <Text style={styles.smallOutlineText}>{t('ambassador.hangouts.deferCta')}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {canDefer && (!notice || notice.id !== h.id) ? <Text style={styles.rowMeta}>{t('ambassador.hangouts.deferNeedsSecond')}</Text> : null}
                  {notice?.id === h.id ? <Text accessibilityRole="alert" style={styles.notice} testID={`hangout-notice-${h.id}`}>{notice.text}</Text> : null}
                </View>
              );
            })}
          </View>
          <Card>
            <Text style={styles.cardTitle}>{t('ambassador.hangouts.originNeverTransfers')}</Text>
            <Text style={styles.body}>{t('ambassador.hangouts.originNeverTransfersBody')}</Text>
          </Card>
          <TouchableOpacity onPress={() => router.push('/ambassador/find-business')} accessibilityRole="button" style={styles.solid} testID="hangouts-sign">
            <Text style={styles.solidText}>{t('ambassador.hangouts.signCta')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  emptyTitle: { fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.6, color: Colors.Ink },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  smallSolid: { backgroundColor: Colors.Ink, borderRadius: 22, minHeight: 44, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  smallSolidText: { color: Colors.Chalk, fontSize: 15, fontWeight: '700' },
  smallOutline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 22, minHeight: 44, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  smallOutlineText: { color: Colors.Ink, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  tableHead: { flexDirection: 'row', gap: 14, backgroundColor: '#F7F5F2', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12 },
  th: { fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: Colors.Muted, fontWeight: '700' },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, overflow: 'hidden' },
  row: { padding: 16, gap: 8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0EDE9' },
  rowWide: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  rowPhone: { gap: 6 },
  colName: { flex: 1.6 },
  colVisits: { flex: 0.7 },
  colRenews: { flex: 0.9 },
  colState: { flex: 0.8 },
  cell: { fontSize: 15.5, color: Colors.Ink },
  statePhone: { gap: 2 },
  stateText: { fontSize: 15.5, fontWeight: '700' },
  rowTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  rowMeta: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notice: { fontSize: 14.5, lineHeight: 21, color: Colors.Ink },
});
