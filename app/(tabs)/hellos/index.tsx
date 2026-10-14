/**
 * CONNECTIONS — people you have said hello to
 *
 * WIRE: GET /hellos (name once revealed, unread chat, Note / Chat / Report / Block). PIXEL is P11.
 * §19.1 — at zero, empty invitation, never a failure state.
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components';
import { Colors } from '../../../src/theme';
import { getHellos, type ConnectionHello, type EncounterHello } from '../../../src/api/hellos';
import { routeForHello } from '../../../src/lib/encounter';
import { setActiveHelloId } from '../../../src/state/active-hello';
import { t } from '../../../src/i18n';
import { ConnectionAvatar } from '../../../src/components/consumer/ConnectionAvatar';
import { connectionPlaceDay } from '../../../src/lib/connection-meta';

export default function HellosScreen() {
  const router = useRouter();
  const [hellos, setHellos] = useState<ConnectionHello[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const result = await getHellos();

    if (result.error) {
      // Keep what was already on screen on a bad signal; only say it did not load.
      setError(t('account.connections.loadFailed'));
    } else {
      setHellos(result.data?.hellos ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.Ink} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('tabs.hellos')}</Text>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/hellos/points')}
        accessibilityRole="button"
        testID="open-connections-points"
      >
        <Text style={styles.rowAction}>{t('encounter.connections.open')}</Text>
      </TouchableOpacity>

      {error ? (
        <TouchableOpacity onPress={() => load()} accessibilityRole="button" testID="connections-retry">
          <Text accessibilityRole="alert" style={styles.error}>{error} {t('l03.connections.retry')}</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={hellos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty} testID="connections-empty">
            <Text style={styles.emptyMark}>👋</Text>
            <Text style={styles.emptyBody}>{t('l03.connections.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hello = item as unknown as EncounterHello;
          const person = hello.person;
          const code = hello.helloCode ?? (item as { hello_code?: string }).hello_code;
          const title = person
            ? person.displayName
            : item.status === 'pending'
              ? t('account.connections.pending')
              : item.status === 'missed'
                ? t('account.connections.stillOpen')
                : code
                  ? `${t('account.connections.hello')} ${code}`
                  : t('account.connections.hello');
          // Private chat: both continued, revealed, accepted (§10.16). The server decides again on open.
          const chatReady = hello.status === 'accepted' && Boolean(hello.revealedAt) && Boolean(hello.bothContinued) && Boolean(hello.chatOpened);
          const unread = hello.unreadChat ?? 0;
          const canSafety = Boolean(person) && Boolean(hello.revealedAt);
          const placeDay = connectionPlaceDay(hello);
          // The permanent pin exists for a revealed, accepted Hello (§10.8, §10.25: a missed one has none). The map opens
          // on it with ?pin=<hello id> (lane09 map patch); the server still decides whether the pin can be shown.
          const onMap = hello.status === 'accepted' && Boolean(hello.revealedAt);
          return (
            <TouchableOpacity
              style={styles.row}
              testID={`connection-${item.id}`}
              accessibilityRole="button"
              onPress={() => {
                // Open this hello's current step from its server status.
                setActiveHelloId(item.id);
                router.push(routeForHello(item as EncounterHello));
              }}
            >
              <View style={styles.rowHead}>
                {person ? (
                  <ConnectionAvatar selfieUrl={hello.selfieUrl} displayName={person.displayName} identityColor={person.identityColor} />
                ) : null}
                <View style={styles.rowHeadText}>
                  <Text style={styles.rowTitle}>{title}</Text>
                  <Text style={styles.rowMeta}>{t(`account.connections.meta.${String(item.status)}`)}</Text>
                  {placeDay ? <Text style={styles.rowMeta} testID={`connection-place-${item.id}`}>{placeDay}</Text> : null}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/hellos/${item.id}`)}
                  accessibilityRole="button"
                  testID={`connection-note-${item.id}`}
                >
                  <Text style={styles.rowAction}>{t('account.connections.note')}</Text>
                </TouchableOpacity>
                {onMap ? (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(tabs)/map', params: { pin: item.id } })}
                    accessibilityRole="button"
                    testID={`connection-map-${item.id}`}
                  >
                    <Text style={styles.rowAction}>{t('connectionLink.onMap')}</Text>
                  </TouchableOpacity>
                ) : null}
                {chatReady ? (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(encounter)/chat', params: { helloId: item.id } })}
                    accessibilityRole="button"
                    testID={`connection-chat-${item.id}`}
                  >
                    <Text style={styles.rowAction}>
                      {unread > 0 ? t('account.connections.chatUnread', { count: unread }) : t('account.connections.chat')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {canSafety ? (
                  <>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/report', params: { type: 'hello', id: item.id, name: person!.displayName, userId: person!.userId ?? '' } })}
                      accessibilityRole="button"
                      testID={`connection-report-${item.id}`}
                    >
                      <Text style={styles.rowAction}>{t('account.connections.report')}</Text>
                    </TouchableOpacity>
                    {person!.userId ? (
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/block', params: { userId: person!.userId as string, name: person!.displayName } })}
                        accessibilityRole="button"
                        testID={`connection-block-${item.id}`}
                      >
                        <Text style={styles.rowAction}>{t('account.connections.block')}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={hellos.length === 0 ? styles.emptyList : styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.7,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 40,
    gap: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 12,
  },
  emptyMark: {
    fontSize: 40,
    opacity: 0.4,
  },
  emptyBody: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  row: {
    borderWidth: 2,
    borderColor: Colors.Ink,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    backgroundColor: Colors.Chalk,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowHeadText: { flex: 1 },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.Ink,
    letterSpacing: -0.4,
  },
  rowMeta: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.6,
    marginTop: 4,
  },
  rowAction: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.Ink,
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginBottom: 12,
  },
});
