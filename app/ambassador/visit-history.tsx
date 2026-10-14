/**
 * VISIT HISTORY and TERM SCHEDULE (CANON-RL-03 "Visit history"; §14.1–14.3, §14.8).
 *
 * Two real reads: GET /ambassador/hangouts (each Hello Hangout's term and its two visit
 * windows — the window dates come from that venue's own maintenance schedule, which starts at
 * payment) and GET /ambassador/visits (this Ambassador's verified visits: GPS + scan).
 * "This page is your evidence, not ours." A venue that has not paid has no term yet, and says so.
 */

import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  getAmbassadorHangouts,
  getAmbassadorVisits,
  type AmbassadorHangout,
  type AmbassadorVisit,
} from '../../src/api/ambassador';
import { AmbassadorShell, Card, Eyebrow } from '../../src/components/ambassador/AmbassadorShell';
import { dayMonth, dayMonthYear } from '../../src/lib/ambassador-format';

function windowStatus(visited: boolean, starts: string, ends: string): { label: string; color: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (visited) return { label: t('ambassador.visitHistory.windowVisited'), color: Colors.DeepFern };
  if (today < starts) return { label: t('ambassador.visitHistory.windowLater'), color: Colors.Muted };
  if (today <= ends) return { label: t('ambassador.visitHistory.windowOpen'), color: Colors.Amber };
  return { label: t('ambassador.visitHistory.windowDue'), color: Colors.Amber };
}

export default function VisitHistoryScreen() {
  const [visits, setVisits] = useState<AmbassadorVisit[]>([]);
  const [book, setBook] = useState<AmbassadorHangout[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const loadId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    const [visitsRes, bookRes] = await Promise.all([getAmbassadorVisits(), getAmbassadorHangouts()]);
    if (id !== loadId.current) return;
    setRefreshing(false);
    if (visitsRes.error || bookRes.error || !visitsRes.data || !bookRes.data) {
      setState('error');
      return;
    }
    setVisits(visitsRes.data.visits);
    setBook(bookRes.data.hangouts);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const scheduled = book.filter((h) => h.status !== 'cancelled');

  return (
    <AmbassadorShell
      active="visits"
      title={t('ambassador.visitHistory.title')}
      subtitle={t('ambassador.visitHistory.lead')}
      refreshing={refreshing}
      onRefresh={() => void load(true)}
      testID="ambassador-visit-history"
    >
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="visit-history-loading" />
      ) : state === 'error' ? (
        <Card tone="error" testID="visit-history-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.visitHistory.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="visit-history-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          {scheduled.length > 0 ? (
            <View style={styles.gap} testID="term-schedule">
              <Eyebrow>{t('ambassador.visitHistory.termTitle')}</Eyebrow>
              <Text style={styles.body}>{t('ambassador.visitHistory.termLead')}</Text>
              {scheduled.map((h) => (
                <Card key={h.id} testID={`term-${h.id}`}>
                  <Text style={styles.cardTitle}>{h.name}</Text>
                  {h.term ? (
                    <>
                      <Text style={styles.meta}>{t('ambassador.visitHistory.termStarts', { from: dayMonthYear(h.term.starts), to: dayMonthYear(h.term.ends) })}</Text>
                      {([['windowOne', h.term.window1], ['windowTwo', h.term.window2]] as const).map(([key, w]) => {
                        const s = windowStatus(w.visited, w.starts, w.ends);
                        return (
                          <View key={key} style={styles.windowRow}>
                            <Text style={styles.windowName}>{t(`ambassador.visitHistory.${key}`)}</Text>
                            <Text style={styles.meta}>{t('ambassador.visitHistory.rangeFmt', { from: dayMonth(w.starts), to: dayMonth(w.ends) })}</Text>
                            <Text style={[styles.windowState, { color: s.color }]} testID={`term-${h.id}-${key}`}>{s.label}</Text>
                          </View>
                        );
                      })}
                    </>
                  ) : (
                    <Text style={styles.meta}>{t('ambassador.visitHistory.noTerm')}</Text>
                  )}
                </Card>
              ))}
            </View>
          ) : null}

          <Eyebrow>{t('ambassador.visitHistory.historyTitle')}</Eyebrow>
          {visits.length === 0 ? (
            <View style={styles.gap} testID="visit-history-empty">
              <Text style={styles.cardTitle}>{t('ambassador.visitHistory.empty')}</Text>
              <Text style={styles.body}>{t('ambassador.visitHistory.emptyBody')}</Text>
            </View>
          ) : (
            <View style={styles.list} testID="visit-history-list">
              {visits.map((v, index) => (
                <View key={v.id} style={[styles.row, index > 0 && styles.rowBorder]} testID={`visit-${v.id}`}>
                  <Text style={styles.cardTitle}>{v.venue ?? t('ambassador.common.helloHangout')}</Text>
                  {v.address ? <Text style={styles.meta}>{v.address}</Text> : null}
                  <Text style={styles.meta}>{dayMonthYear(v.visitedAt)}</Text>
                  <Text style={styles.meta}>
                    {[
                      v.visitWindow != null ? t('ambassador.visitHistory.windowNumber', { n: v.visitWindow }) : t('ambassador.visitHistory.outsideWindow'),
                      v.qrStandSerial ? t('ambassador.visitHistory.proofStand', { code: v.qrStandSerial }) : t('ambassador.visitHistory.proofCode'),
                    ].join(' · ')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  meta: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  windowName: { fontSize: 15, fontWeight: '700', color: Colors.Ink, minWidth: 74 },
  windowState: { fontSize: 14, fontWeight: '700' },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, overflow: 'hidden' },
  row: { padding: 16, gap: 3 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0EDE9' },
});
