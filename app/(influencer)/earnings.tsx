/**
 * INFLUENCER EARNINGS — CANON-RL-04-SN-04: "What has cleared, and what is still building."
 *
 * GET /influencer/earnings. EARNED and BUILDING side by side (ROLE-4 §6); Building reads provisional
 * and is never added into Earned; NO total. Every figure is an MA-05 slot ("—") until the server
 * clears it. Two streams (§2.15): businesses signed directly on the code, and Hello Hangouts
 * originated by Ambassadors who came through the channel. Payouts are not open (provider not
 * connected) — said, not implied.
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getInfluencerEarnings, type InfluencerEarnings } from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { EarnedBuildingTiles } from '../../src/components/ambassador/EarnedBuildingPair';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';

type Row = { key: string; venue: string; detail: string; kind: 'earned' | 'building' | 'reversed'; amountCents: number | null };

function rowsFrom(e: InfluencerEarnings) {
  const stream = (s: 'direct' | 'via_ambassador') => t(s === 'direct' ? 'influencer.earnings.directOnCode' : 'influencer.earnings.viaChannel');
  const paid = (r: InfluencerEarnings['earned'][number], kind: Row['kind'], tail: string): Row => ({
    key: r.id, venue: r.venue ?? t('ambassador.common.helloHangout'), detail: `${stream(r.stream)} · ${tail}`, kind, amountCents: r.amountCents,
  });
  return {
    earned: e.earned.map((r) => paid(r, 'earned', t('influencer.earnings.paid'))),
    building: e.building.map((r): Row => ({
      key: `unpaid-${r.helloHangoutId}`, venue: r.venue, detail: `${stream(r.stream)} · ${t('influencer.earnings.waitingPayment')}`, kind: 'building', amountCents: null,
    })),
    reversed: e.reversed.map((r) => paid(r, 'reversed', t('influencer.earnings.reversed'))),
  };
}

function LedgerRow({ row, first }: { row: Row; first: boolean }) {
  const building = row.kind === 'building';
  return (
    <View style={[styles.row, !first && styles.rowBorder, building && styles.rowBuilding]} testID={`creator-ledger-${row.kind}-${row.key}`}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.venue}>{row.venue}</Text>
        <Text style={styles.detail}>{row.detail}</Text>
      </View>
      <Text style={[styles.tag, row.kind === 'earned' && styles.tagEarned, building && styles.tagBuilding]}>
        {t(row.kind === 'earned' ? 'ambassador.earnedBuilding.earnedLabel' : building ? 'ambassador.earnedBuilding.buildingLabel' : 'influencer.earnings.reversedSection')}
      </Text>
      <Text style={[styles.amount, building && styles.amountBuilding]}>
        {row.amountCents === null ? t('ambassador.earnedBuilding.total') : formatCents(row.amountCents)}
      </Text>
    </View>
  );
}

export default function InfluencerEarningsScreen() {
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getInfluencerEarnings();
    return res?.data ? { data: res.data.earnings } : res && res.error ? { error: res.error } : undefined;
  });
  const rows = data ? rowsFrom(data) : null;
  const empty = rows ? rows.earned.length + rows.building.length + rows.reversed.length === 0 : false;

  return (
    <InfluencerShell active="earnings" title={t('influencer.earnings.title')} subtitle={t('influencer.earnings.lead')} refreshing={refreshing} onRefresh={onRefresh} testID="creator-earnings">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="creator-earnings-loading" />
      ) : state === 'error' || !data || !rows ? (
        <Card tone="error" testID="creator-earnings-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('influencer.earnings.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="creator-earnings-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <EarnedBuildingTiles earnedCount={data.earned.length} buildingCount={data.building.length} earnedSubKey="influencer.earnings.earnedSub" />
          <Eyebrow>{t('influencer.earnings.hangoutsTitle')}</Eyebrow>
          {empty ? (
            <Text style={styles.body} testID="creator-earnings-empty">{t('influencer.earnings.empty')}</Text>
          ) : (
            <View style={styles.list} testID="creator-ledger">
              {[...rows.earned, ...rows.building].map((row, index) => <LedgerRow key={row.key} row={row} first={index === 0} />)}
            </View>
          )}
          {rows.reversed.length > 0 ? (
            <View style={{ gap: 10 }} testID="creator-ledger-reversed">
              <Eyebrow>{t('influencer.earnings.reversedSection')}</Eyebrow>
              <View style={styles.list}>
                {rows.reversed.map((row, index) => <LedgerRow key={row.key} row={row} first={index === 0} />)}
              </View>
            </View>
          ) : null}
          <Text style={styles.small}>{t('influencer.earnings.totalNote')}</Text>
          <Card testID="creator-payout-note"><Text style={styles.body}>{t('influencer.earnings.payoutNote')}</Text></Card>
          <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>
        </>
      )}
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13.5, lineHeight: 19, color: Colors.Muted },
  disclaimer: { fontSize: 12, lineHeight: 18, color: Colors.Faint, textAlign: 'center' },
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
  amount: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink, minWidth: 40, textAlign: 'right' },
  amountBuilding: { color: Colors.Faint },
});
