/**
 * A5 PAYOUTS — CANON-RL-03-SN-06 (Earned and Building, side by side, then the ledger).
 *
 * GET /ambassador/earnings — the server's own definition of the two halves:
 *   EARNED   the venue has paid us (a payout row exists only from the verified payment webhook)
 *            AND this Ambassador visited it in that paid term — "complete when the business pays
 *            AND is physically visited".
 *   BUILDING signed but not paid, or paid and still waiting on the visit. Provisional: it may
 *            never arrive, is not payable, and is never added into Earned.
 * No total, ever ("a total would imply money is sitting somewhere it can be taken from").
 * Figures are MA-05 slots (RULES §31): the server sends none until legal clears them, and the
 * row then shows "—". Withdraw is drawn present and INERT: the payout provider (Trolley,
 * §14.12) is not connected and the settlement hold and fulfilment window are owner-set and
 * unset (MONEY Part 3), so nothing here says or implies an amount can be withdrawn.
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import {
  getEarnings,
  getPayoutHistory,
  type BuildingUnpaid,
  type EarningRow,
  type Earnings,
  type PayoutRequest,
} from '../../api/ambassador';
import { formatCents } from '../../lib/money-format';
import { dayMonthYear } from '../../lib/ambassador-format';
import { AmbassadorShell, Card, Eyebrow } from './AmbassadorShell';
import { EarnedBuildingPair } from './EarnedBuildingPair';
import { TrolleyRecipientForm } from './TrolleyRecipientForm';

type Row = { key: string; venue: string; detail: string; kind: 'earned' | 'building' | 'reversed'; amountCents: number | null };

function rowsFrom(earnings: Earnings): { earned: Row[]; building: Row[]; reversed: Row[] } {
  const fromPayout = (r: EarningRow, kind: Row['kind'], detail: string): Row => ({
    key: r.id,
    venue: r.venue ?? t('ambassador.common.helloHangout'),
    detail,
    kind,
    amountCents: r.amountCents,
  });
  return {
    earned: earnings.earned.map((r) => fromPayout(r, 'earned', t('ambassador.earnedBuilding.paidVisited'))),
    building: earnings.building.map((r) =>
      'state' in r && r.state === 'building_waiting_payment'
        ? { key: `unpaid-${(r as BuildingUnpaid).helloHangoutId}`, venue: (r as BuildingUnpaid).venue, detail: t('ambassador.earnedBuilding.waitingPayment'), kind: 'building' as const, amountCents: null }
        : fromPayout(r as EarningRow, 'building', t('ambassador.earnedBuilding.waitingVisit'))
    ),
    reversed: earnings.reversed.map((r) => fromPayout(r, 'reversed', t('ambassador.earnedBuilding.reversed'))),
  };
}

function LedgerRow({ row, first }: { row: Row; first: boolean }) {
  const earned = row.kind === 'earned';
  const building = row.kind === 'building';
  return (
    <View style={[styles.row, !first && styles.rowBorder, building && styles.rowBuilding]} testID={`ledger-${row.kind}-${row.key}`}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.venue}>{row.venue}</Text>
        <Text style={styles.detail}>{row.detail}</Text>
      </View>
      <Text style={[styles.tag, earned && styles.tagEarned, building && styles.tagBuilding, row.kind === 'reversed' && styles.tagReversed]}>
        {t(earned ? 'ambassador.earnedBuilding.earnedLabel' : building ? 'ambassador.earnedBuilding.buildingLabel' : 'ambassador.earnedBuilding.reversedSection')}
      </Text>
      <Text style={[styles.amount, building && styles.amountBuilding]}>
        {row.amountCents === null ? t('ambassador.earnedBuilding.total') : formatCents(row.amountCents)}
      </Text>
    </View>
  );
}

export function EarningsView({ withHistory }: { withHistory?: boolean }) {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [history, setHistory] = useState<PayoutRequest[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const loadId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    const [res, hist] = await Promise.all([getEarnings(), withHistory ? getPayoutHistory() : Promise.resolve(null)]);
    if (id !== loadId.current) return;
    setRefreshing(false);
    if (res.error || !res.data) {
      setState('error');
      return;
    }
    setEarnings(res.data.earnings);
    setHistory(hist?.data?.payouts ?? []);
    setState('ready');
  }, [withHistory]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const rows = earnings ? rowsFrom(earnings) : null;
  const empty = rows ? rows.earned.length + rows.building.length + rows.reversed.length === 0 : false;

  return (
    <AmbassadorShell
      active="payouts"
      title={t('ambassador.earnedBuilding.title')}
      subtitle={t('ambassador.earnedBuilding.lead')}
      refreshing={refreshing}
      onRefresh={() => void load(true)}
      testID="ambassador-earnings"
    >
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="earned-loading" />
      ) : state === 'error' ? (
        <Card tone="error" testID="earned-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.earnedBuilding.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="earned-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <EarnedBuildingPair earnings={earnings} />

          {empty ? (
            <Text style={styles.body} testID="earned-empty">{t('ambassador.common.empty')}</Text>
          ) : rows ? (
            <View style={styles.list} testID="ledger">
              {[...rows.earned, ...rows.building].map((row, index) => (
                <LedgerRow key={row.key} row={row} first={index === 0} />
              ))}
            </View>
          ) : null}

          {rows && rows.reversed.length > 0 ? (
            <View style={{ gap: 10 }} testID="ledger-reversed">
              <Eyebrow>{t('ambassador.earnedBuilding.reversedSection')}</Eyebrow>
              <View style={styles.list}>
                {rows.reversed.map((row, index) => (
                  <LedgerRow key={row.key} row={row} first={index === 0} />
                ))}
              </View>
            </View>
          ) : null}

          <Text style={styles.small}>{t('ambassador.earnedBuilding.totalNote')}</Text>

          <Card testID="withdraw-gate">
            <Text style={styles.cardTitle}>{t('ambassador.earnedBuilding.withdrawTitle')}</Text>
            <Text style={styles.body}>{t('ambassador.earnedBuilding.withdrawBody')}</Text>
          </Card>
          <View
            style={styles.inert}
            accessible
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            accessibilityLabel={t('ambassador.earnedBuilding.withdraw')}
            testID="payouts-withdraw"
          >
            <Text style={styles.inertText}>{t('ambassador.earnedBuilding.withdraw')}</Text>
          </View>

          {withHistory ? <TrolleyRecipientForm /> : null}

          {withHistory ? (
            <View style={{ gap: 10 }}>
              <Eyebrow>{t('ambassador.payouts.recent')}</Eyebrow>
              {history.length === 0 ? (
                <Text style={styles.body} testID="payouts-history-empty">{t('ambassador.payouts.emptyHistory')}</Text>
              ) : (
                <View style={styles.list}>
                  {history.map((h, index) => (
                    <View key={h.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                      <Text style={[styles.venue, { flex: 1 }]}>{dayMonthYear(h.requestedAt ?? h.createdAt)}</Text>
                      <Text style={styles.detail}>{h.status}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13.5, lineHeight: 19, color: Colors.Muted },
  disclaimer: { fontSize: 12, lineHeight: 18, color: Colors.Faint, textAlign: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, paddingHorizontal: 16, backgroundColor: Colors.Chalk },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0EDE9' },
  rowBuilding: { backgroundColor: Colors.Bone },
  venue: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  detail: { fontSize: 14, color: Colors.Muted },
  tag: { fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', color: Colors.Muted },
  tagEarned: { color: Colors.DeepFern },
  tagBuilding: { color: Colors.Amber },
  tagReversed: { color: Colors.Muted },
  amount: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink, minWidth: 60, textAlign: 'right' },
  amountBuilding: { color: Colors.Faint },
  inert: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  inertText: { color: Colors.Faint, fontSize: 17.5, fontWeight: '700' },
});
