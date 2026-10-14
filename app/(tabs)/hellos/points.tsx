/**
 * CONNECTIONS · POINTS EARNED — CANON-RL-01-SN-51 (P 375, delivered 2026-09-20)
 *
 * One line per hello award in this person's OWN ledger (GET /points/connections):
 *   accept, revealed   → the person: name, "Place · Day", +N   (design rows 1, 3)
 *   accept, unrevealed → "Said Hello", Day, +N — no name, no place before reveal
 *                        (§10.6, §10.41)                          (design row 4 wording)
 *   continue           → "Kept a conversation going", Day, +N    (design row 2)
 *   selfie             → not in the frame; marked copy, for design review
 * Nothing is computed here and nothing reads as pending or owed: a line exists only
 * because the server ledger has it. A person line whose chat is open opens the chat
 * ("that line in Connections becomes a chat"); other lines open nothing.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { getConnectionsPoints, type ConnectionPointsEntry } from '../../../src/api/points';
import { setActiveHelloId } from '../../../src/state/active-hello';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "Tuesday" inside the last week (the design's form); a short date beyond it. */
export function entryDay(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return now - d.getTime() < WEEK_MS
    ? d.toLocaleDateString(undefined, { weekday: 'long' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function lineFor(entry: ConnectionPointsEntry): { title: string; meta: string; person: boolean } {
  const day = entryDay(entry.createdAt);
  if (entry.kind === 'continue') return { title: t('encounter.connections.kept'), meta: day, person: false };
  if (entry.kind === 'selfie') {
    return {
      title: t('encounter.connections.selfie'),
      meta: entry.revealed && entry.locationName ? t('encounter.connections.placeDay', { place: entry.locationName, day }) : day,
      person: false,
    };
  }
  if (entry.revealed && entry.displayName) {
    return {
      title: entry.displayName,
      meta: entry.locationName ? t('encounter.connections.placeDay', { place: entry.locationName, day }) : day,
      person: true,
    };
  }
  return { title: t('encounter.connections.said'), meta: day, person: false };
}

export default function ConnectionsPointsScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<ConnectionPointsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    const res = await getConnectionsPoints();
    setLoading(false);
    setRefreshing(false);
    if (res.error) { setError(t('encounter.connections.failed')); return; }
    setEntries(res.data?.entries ?? []);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">{t('encounter.connections.title')}</Text>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.Ink} /></View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
          ListHeaderComponent={error ? (
            <TouchableOpacity onPress={() => void load()} accessibilityRole="button">
              <Text accessibilityRole="alert" style={styles.error}>{error} {t('encounter.common.retry')}</Text>
            </TouchableOpacity>
          ) : null}
          ListEmptyComponent={!error ? <Text style={styles.meta}>{t('encounter.connections.empty')}</Text> : null}
          renderItem={({ item, index }) => {
            const line = lineFor(item);
            const opensChat = line.person && item.chatOpen && item.helloId;
            const row = (
              <View style={[styles.row, index === entries.length - 1 && styles.rowLast]} testID={`points-line-${item.id}`}>
                <View style={[styles.avatar, { backgroundColor: line.person && item.identityColor ? item.identityColor : index % 2 ? '#CFC9C1' : '#D8D3CC' }]} />
                <View style={styles.text}>
                  <Text style={styles.name}>{line.title}</Text>
                  {line.meta ? <Text style={styles.meta}>{line.meta}</Text> : null}
                </View>
                <Text style={styles.points}>{t('encounter.connections.points', { points: item.points })}</Text>
              </View>
            );
            return opensChat ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setActiveHelloId(item.helloId!);
                  router.push({ pathname: '/(encounter)/chat', params: { helloId: item.helloId! } });
                }}
              >
                {row}
              </TouchableOpacity>
            ) : row;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  statusBar: { height: 44 },
  header: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 14 },
  title: { fontSize: 27, lineHeight: 31, fontWeight: '700', letterSpacing: -0.7, color: Colors.Ink },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 24, paddingBottom: 34 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16.5, fontWeight: '600', color: Colors.Ink },
  meta: { fontSize: 13.5, color: Colors.Muted },
  points: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  error: { fontSize: 14, color: Colors.SignalRed, marginBottom: 12 },
});
