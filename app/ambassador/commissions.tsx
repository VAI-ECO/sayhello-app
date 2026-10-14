/**
 * COMMISSIONS TRACKER (ROLE-3; S3 stage 07; API GET /ambassador/commissions).
 *
 * Three honest columns — Paid to you / Owed to you / Building — then one row per Hello Hangout term:
 * the Hello Hangout, its term year, how you got it, and where it stands. "Owed" is Earned (the
 * business paid AND was visited) that the payout provider has not yet paid. Building is a count of
 * Hello Hangouts, never dollars, and never added into anything: it may not arrive. Every figure is
 * withheld by the server until legal clears it (MA-05) and then shows "—". Withdrawal gates are
 * named, never implied open.
 */
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getCommissions, type CommissionRow, type CommissionWhere } from '../../src/api/ambassador-s3';
import { AmbassadorShell, Card, Eyebrow } from '../../src/components/ambassador/AmbassadorShell';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { dayMonth } from '../../src/lib/ambassador-format';

const STAND_KEY: Record<CommissionWhere, string> = {
  paid: 'ambassadorS3.commissions.standPaid',
  owed: 'ambassadorS3.commissions.standOwed',
  building_waiting_payment: 'ambassadorS3.commissions.standWaitingPayment',
  building_waiting_visit: 'ambassadorS3.commissions.standWaitingVisit',
};

function money(cents: number | null | undefined, cleared: boolean): string {
  return cleared && typeof cents === 'number' ? formatCents(cents) : t('ambassadorS3.commissions.figure');
}

function Row({ row, cleared, first }: { row: CommissionRow; cleared: boolean; first: boolean }) {
  const building = row.where.startsWith('building');
  const due = row.visit?.dueBy && (row.visit.state === 'needs_visit' || row.visit.state === 'overdue') ? row.visit.dueBy : null;
  return (
    <View style={[styles.row, !first && styles.rowBorder, building && styles.rowBuilding]} testID={`commission-${row.id}`}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.venue}>{row.venue ?? t('ambassador.common.helloHangout')}</Text>
        <Text style={styles.meta}>
          {[row.termYear ? t('ambassadorS3.commissions.term', { year: row.termYear }) : null,
            t(row.route === 'signed_by_you' ? 'ambassadorS3.commissions.routeSigned' : 'ambassadorS3.commissions.routeTaken')]
            .filter(Boolean).join(' · ')}
        </Text>
        <Text style={[styles.stand, row.where === 'paid' && styles.standPaid, row.where === 'owed' && styles.standOwed]}>{t(STAND_KEY[row.where])}</Text>
        {due ? <Text style={styles.meta}>{t('ambassadorS3.commissions.visitDue', { date: dayMonth(due) })}</Text> : null}
      </View>
      <Text style={[styles.amount, building && styles.amountBuilding]}>{building ? '' : money(row.amountCents, cleared)}</Text>
    </View>
  );
}

export default function CommissionsScreen() {
  const router = useRouter();
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getCommissions();
    return res?.data ? { data: res.data.commissions } : res && res.error ? { error: res.error } : undefined;
  });
  const rows = data ? [...data.earned, ...data.building] : [];

  return (
    <AmbassadorShell title={t('ambassador.commissions.title')} subtitle={t('ambassadorS3.commissions.lead')} refreshing={refreshing} onRefresh={onRefresh} onBack={() => router.back()} testID="ambassador-commissions">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="commissions-loading" />
      ) : state === 'error' || !data ? (
        <Card tone="error" testID="commissions-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassadorS3.commissions.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="commissions-retry">
            <Text style={styles.outlineText}>{t('ambassadorS3.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <View style={styles.cards}>
            <View style={[styles.card, styles.cardPaid]} testID="commissions-paid-card">
              <Text style={styles.cardLabel}>{t('ambassador.commissions.paidToYou')}</Text>
              <Text style={styles.cardAmount}>{money(data.totals.paidCents, data.figuresCleared)}</Text>
            </View>
            <View style={[styles.card, styles.cardOwed]} testID="commissions-owed-card">
              <Text style={styles.cardLabel}>{t('ambassadorS3.commissions.owedToYou')}</Text>
              <Text style={styles.cardAmount}>{money(data.totals.owedCents, data.figuresCleared)}</Text>
              <Text style={styles.cardSub}>{t('ambassadorS3.commissions.owedSub')}</Text>
            </View>
            <View style={[styles.card, styles.cardBuilding]} testID="commissions-building-card">
              <Text style={styles.cardLabelBuilding}>{t('ambassador.commissions.building')}</Text>
              <Text style={styles.cardAmountBuilding}>{t('ambassadorS3.commissions.buildingCount', { count: data.totals.buildingCount })}</Text>
              <Text style={styles.cardSub}>{t('ambassador.commissions.buildingSub')}</Text>
            </View>
          </View>

          {rows.length === 0 ? (
            <Card testID="commissions-empty">
              <Text style={styles.body}>{t('ambassadorS3.commissions.empty')}</Text>
            </Card>
          ) : (
            <View style={styles.list} testID="commissions-list">
              {rows.map((r, i) => <Row key={`${r.where}-${r.id}`} row={r} cleared={data.figuresCleared} first={i === 0} />)}
            </View>
          )}

          {data.reversed.length > 0 ? (
            <Card testID="commissions-reversed">
              <Eyebrow>{t('ambassador.earnedBuilding.reversedSection')}</Eyebrow>
              {data.reversed.map((r) => (
                <Text key={r.id} style={styles.meta}>{`${r.venue ?? t('ambassador.common.helloHangout')}${r.termYear ? ` · ${t('ambassadorS3.commissions.term', { year: r.termYear })}` : ''}`}</Text>
              ))}
            </Card>
          ) : null}

          {!data.figuresCleared ? <Text style={styles.meta} testID="commissions-withheld">{t('ambassadorS3.commissions.withheld')}</Text> : null}
          <TouchableOpacity onPress={() => router.push('/ambassador/payouts')} accessibilityRole="button" style={styles.outline} testID="commissions-to-payouts">
            <Text style={styles.outlineText}>{t('ambassadorS3.commissions.toPayouts')}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>{t('figures.ma05Disclaimer')}</Text>
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  meta: { fontSize: 13.5, lineHeight: 19, color: Colors.Muted },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { flexGrow: 1, flexBasis: 150, borderRadius: 12, padding: 14, gap: 4 },
  cardPaid: { borderWidth: 1.5, borderColor: Colors.Fern },
  cardOwed: { borderWidth: 1.5, borderColor: Colors.Ink },
  cardBuilding: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.Line, backgroundColor: Colors.Bone },
  cardLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Fern },
  cardLabelBuilding: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Muted },
  cardAmount: { fontSize: 28, fontWeight: '800', color: Colors.Ink },
  cardAmountBuilding: { fontSize: 22, fontWeight: '800', color: Colors.Muted },
  cardSub: { fontSize: 13, color: Colors.Muted },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.Line },
  rowBuilding: { backgroundColor: Colors.Bone },
  venue: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  stand: { fontSize: 14, fontWeight: '700', color: Colors.Muted },
  standPaid: { color: Colors.Fern },
  standOwed: { color: Colors.Ink },
  amount: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  amountBuilding: { color: Colors.Muted },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  disclaimer: { fontSize: 12, color: Colors.Faint, textAlign: 'center' },
});
