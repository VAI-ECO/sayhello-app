/**
 * HOOTZA CHAT (CANON-00-SN-03 as drawn in Hootzas.dc "Hootza chat"; RULES §28.19-28.20, §35.18)
 * Group only, one chat per Hootza, host-activated. The header and the first line state what the surface
 * must always state: who can read it ("Everyone going") and when it closes. Read-only once the Hootza has
 * ended. No one-to-one anywhere, no friend requests, no points here — the hello happens in the room.
 * GET/POST /api/hootzas/:id/chat[/messages]; Report on any message from another person goes to /report
 * (type hootza_chat); a host or lead can remove a message (DELETE .../messages/:messageId).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  getHootzaChat,
  removeHootzaChatMessage,
  sendHootzaChatMessage,
  type HootzaChatMessage,
  type HootzaChatRoom,
} from '../../../src/api/hootzas';

export default function HootzaChatScreen() {
  const router = useRouter();
  // D frame: the message column stays capped at 720 so lines stay readable (00-SN-03 D 1440).
  const chatColumn = useWindowDimensions().width >= 1024 ? { maxWidth: 720 } : null;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [room, setRoom] = useState<HootzaChatRoom | null>(null);
  const [messages, setMessages] = useState<HootzaChatMessage[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'not_on' | 'not_going'>('loading');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const busy = useRef(false);
  const list = useRef<FlatList<HootzaChatMessage>>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await getHootzaChat(id);
    if (res.error || !res.data) {
      const code = res.error?.code;
      setState(code === 'chat_not_on' ? 'not_on' : code === 'not_going' ? 'not_going' : 'error');
      return;
    }
    setRoom(res.data.chat);
    setMessages(res.data.messages);
    setState('ready');
  }, [id]);

  useEffect(() => { setState('loading'); void load(); }, [load]);

  async function send() {
    const body = draft.trim();
    if (!id || !body || busy.current) return;
    busy.current = true;
    setSending(true);
    setSendError(null);
    const res = await sendHootzaChatMessage(id, body);
    busy.current = false;
    setSending(false);
    if (res.error) {
      setSendError(res.error.code === 'chat_closed' ? t('s2c.hootzaChat.closedNote') : t('s2c.hootzaChat.sendFailed'));
      if (res.error.code === 'chat_closed') void load();
      return;
    }
    setDraft('');
    await load();
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }

  async function remove(messageId: string) {
    if (!id) return;
    const res = await removeHootzaChatMessage(id, messageId);
    if (!res.error) setMessages(prev => prev.filter(m => m.id !== messageId));
  }

  const closes = room?.closesAt
    ? new Date(room.closesAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : t('s2c.hootzaChat.closesWhenEnds');

  return (
    <ScreenContainer style={chatColumn ? { ...styles.screen, ...chatColumn } : styles.screen}>
      <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace(`/(hootzas)/${id}`))} style={styles.header} accessibilityRole="button" testID="chat-back">
        <Text style={styles.back}>{t('hootzas.common.back')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{room?.title ?? ''}</Text>
          {room ? <Text style={styles.sub}>{t('s2c.hootzaChat.subtitle', { when: closes })}</Text> : null}
        </View>
      </TouchableOpacity>

      {state === 'loading' ? (
        <View style={styles.centered}><ActivityIndicator color={FixedColors.hootza} testID="chat-loading" /></View>
      ) : state === 'not_on' || state === 'not_going' ? (
        <View style={styles.centered}><Text style={styles.empty} testID="chat-blocked">{t(state === 'not_on' ? 's2c.hootzaChat.notOn' : 's2c.hootzaChat.notGoing')}</Text></View>
      ) : state === 'error' ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{t('s2c.hootzaChat.loadFailed')}</Text>
          <Button title={t('error.retry')} onPress={() => { setState('loading'); void load(); }} testID="chat-retry" />
        </View>
      ) : (
        <>
          <FlatList
            ref={list}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.turnedOn} testID="chat-first-line">
                {room?.turnedOnBy ? t('s2c.hootzaChat.turnedOn', { name: room.turnedOnBy }) : t('s2c.hootzaChat.turnedOnNoName')}
              </Text>
            }
            ListEmptyComponent={<Text style={styles.empty} testID="chat-empty">{t('s2c.hootzaChat.empty')}</Text>}
            renderItem={({ item }) => (
              <View style={[styles.msg, item.mine && styles.msgMine]}>
                <Text style={styles.author}>{item.mine ? '' : item.senderName ?? ''}{item.fromHost ? ` · ${t('s2c.hootzaChat.host')}` : ''}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <View style={styles.actions}>
                  {!item.mine ? (
                    <TouchableOpacity onPress={() => router.push({ pathname: '/report', params: { type: 'hootza_chat', id: item.id, name: item.senderName ?? '' } })} accessibilityRole="button" testID={`chat-report-${item.id}`}>
                      <Text style={styles.action}>{t('s2c.hootzaChat.report')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {room?.canManage ? (
                    <TouchableOpacity onPress={() => void remove(item.id)} accessibilityRole="button" testID={`chat-remove-${item.id}`}>
                      <Text style={styles.action}>{t('s2c.hootzaChat.remove')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
          />
          {room?.open ? (
            <View style={styles.composer}>
              <TextInput value={draft} onChangeText={setDraft} placeholder={t('s2c.hootzaChat.placeholder')} maxLength={2000} testID="chat-input" />
              {sendError ? <Text accessibilityRole="alert" style={styles.error}>{sendError}</Text> : null}
              <Button title={t('s2c.hootzaChat.send')} onPress={() => void send()} loading={sending} disabled={!draft.trim()} testID="chat-send" />
            </View>
          ) : (
            <View style={styles.composer}><Text style={styles.sub} testID="chat-closed">{t('s2c.hootzaChat.closedNote')}</Text></View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.Hairline },
  back: { fontSize: 16, color: Colors.Ink },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  sub: { fontSize: 13, color: Colors.Muted },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
  list: { padding: 20, gap: 12 },
  turnedOn: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginBottom: 8 },
  empty: { fontSize: 15, color: Colors.Muted, textAlign: 'center' },
  error: { fontSize: 14, color: Colors.SignalRed },
  msg: { backgroundColor: Colors.Bone, borderRadius: 14, padding: 12, alignSelf: 'flex-start', maxWidth: '88%' },
  msgMine: { alignSelf: 'flex-end', backgroundColor: Colors.Hairline },
  author: { fontSize: 13, fontWeight: '700', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 21, color: Colors.Ink, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 6 },
  action: { fontSize: 12, color: Colors.Muted },
  composer: { padding: 16, gap: 8, borderTopWidth: 1, borderColor: Colors.Hairline },
});
