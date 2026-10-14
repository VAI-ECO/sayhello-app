/**
 * PRIVATE CHAT — two people who met and both chose to keep talking (§10.16).
 *
 * Design: "Chat · phone" CANON-00-SN-03 and "Chat · report a message"
 * CANON-00-SN-01 (P 375), with the back arrow, send arrow, report reason and
 * "Report sent" frames from Chat Moderation.dc.html — adapted from a Hootza room
 * to a two-person chat. Rendered fidelity is unverified.
 *
 * Server: GET/POST /hellos/:id/chat… (sayhello-api hello-chat.ts; runtime needs
 * draft migration 056). The server decides who may read and send:
 *   - participants only; no chat for a missed or never-met hello (§10.25)
 *   - blocking is silent (§24.8, SN-01): the blocker reads history but cannot send
 *   - either party can leave (§24.7)
 *   - "Hide it for me" hides one message on this phone's account only
 *   - Report names the message (§35.18), asks a reason (§35.19) with optional
 *     context (§35.20); the reporter is never told the outcome (§35.21)
 * No realtime: messages refresh on focus, on pull and after sending.
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import {
  getHelloChat,
  hideChatMessage,
  leaveChat,
  reportChatMessage,
  sendChatMessage,
  type ChatMessage,
  type ChatReportReason,
  type HelloChat,
} from '../../src/api/hellos';
import { getActiveHelloId } from '../../src/state/active-hello';

type Closed = 'not_open' | 'left' | null;
type Sheet =
  | { kind: 'actions'; message: ChatMessage }
  | { kind: 'reason'; message: ChatMessage }
  | { kind: 'sent' }
  | { kind: 'leave' }
  | null;

// Delivered order, most severe first; keys are §35.19 categories.
const REASON_ORDER: ChatReportReason[] = ['threat', 'sexual_content', 'harassment', 'hate_speech', 'spam', 'other'];

const CHAT_POLL_MS = 15_000;

export default function ChatScreen() {
  const router = useRouter();
  const navigation = useContext(NavigationContext);
  const params = useLocalSearchParams<{ helloId?: string }>();
  const helloId = (typeof params?.helloId === 'string' && params.helloId) || getActiveHelloId();

  const [chat, setChat] = useState<HelloChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [closed, setClosed] = useState<Closed>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [reason, setReason] = useState<ChatReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [acting, setActing] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const gen = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async (asRefresh = false) => {
    if (!helloId) { setLoading(false); setClosed('not_open'); return; }
    const mine = ++gen.current;
    if (asRefresh) setRefreshing(true);
    setLoadError(null);
    const res = await getHelloChat(helloId);
    if (!mounted.current || mine !== gen.current) return;
    setLoading(false);
    setRefreshing(false);
    if (res.error) {
      if (res.error.status === 403 || res.error.status === 404) { router.back(); return; }
      if (res.error.code === 'chat_left') { setClosed('left'); setChat(null); return; }
      if (res.error.code === 'chat_not_open') { setClosed('not_open'); setChat(null); return; }
      setLoadError(t('encounter.chat.loadFailed'));
      return;
    }
    setClosed(null);
    setChat(res.data?.chat ?? null);
  }, [helloId, router]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!navigation) return;
    return navigation.addListener('focus', () => { void load(); });
  }, [navigation, load]);

  // New-message delivery: there is no realtime or push provider yet, so an open chat re-reads the
  // server while it is on screen and the app is in the foreground. Opening/reading marks it read
  // server-side (063), which clears the unread badge on Connections.
  useEffect(() => {
    if (!helloId) return;
    const timer = setInterval(() => {
      if (AppState.currentState === 'active' && !busy.current) void load();
    }, CHAT_POLL_MS);
    const sub = AppState.addEventListener('change', (next) => { if (next === 'active') void load(); });
    return () => { clearInterval(timer); sub.remove(); };
  }, [helloId, load]);

  const name = chat?.person.displayName ?? '';

  async function send() {
    const body = draft.trim();
    if (!helloId || !body || busy.current || !chat?.canSend) return;
    busy.current = true;
    setSending(true);
    setSendError(null);
    const res = await sendChatMessage(helloId, body);
    busy.current = false;
    if (!mounted.current) return;
    setSending(false);
    if (res.error) {
      if (res.error.code === 'chat_left' || res.error.code === 'chat_not_open' || res.error.code === 'chat_blocked') {
        void load();
        return;
      }
      setSendError(t('encounter.chat.sendFailed'));
      return;
    }
    setDraft('');
    const sent = res.data?.message;
    if (sent) setChat(c => (c ? { ...c, messages: [...c.messages, sent] } : c));
    void load();
  }

  async function runSheetAction(action: () => Promise<{ error?: { message: string } }>, after: () => void) {
    if (acting) return;
    setActing(true);
    setSheetError(null);
    const res = await action();
    if (!mounted.current) return;
    setActing(false);
    if (res.error) { setSheetError(res.error.message || t('encounter.common.failed')); return; }
    after();
  }

  function openBlock() {
    const userId = chat?.person.userId;
    if (!userId) return;
    setSheet(null);
    // The delivered block confirmation (app/block.tsx) posts /safety/block and returns.
    router.push({ pathname: '/block', params: { userId, name } });
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Colors.Ink} />
      </View>
    );
  }

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('encounter.chat.backLabel')} hitSlop={12}>
        <Text style={styles.back}>{t('encounter.chat.back')}</Text>
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
      </View>
      {chat ? (
        <TouchableOpacity onPress={() => { setSheetError(null); setSheet({ kind: 'leave' }); }} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.headerAction}>{t('encounter.chat.leave')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (closed || !chat) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        {header}
        <View style={[styles.centered, styles.pad]}>
          {loadError ? (
            <TouchableOpacity onPress={() => { setLoading(true); void load(); }} accessibilityRole="button">
              <Text accessibilityRole="alert" style={styles.muted}>{loadError} {t('encounter.common.retry')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.muted}>{t(closed === 'left' ? 'encounter.chat.left' : 'encounter.chat.notOpen')}</Text>
          )}
        </View>
      </View>
    );
  }

  if (sheet?.kind === 'reason') {
    const message = sheet.message;
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.reportHeader}>
          <TouchableOpacity onPress={() => setSheet(null)} accessibilityRole="button">
            <Text style={styles.cancel}>{t('encounter.chat.reportCancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.reportTitle}>{t('encounter.chat.reportTitle')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <FlatList
          data={REASON_ORDER}
          keyExtractor={item => item}
          contentContainerStyle={styles.pad}
          ListHeaderComponent={
            <View style={styles.reportBlock}>
              <View style={styles.quote}>
                <Text style={styles.label}>{t('encounter.chat.reporting')}</Text>
                <Text style={styles.quoteText}>{`"${message.body}"`}</Text>
                <Text style={styles.meta}>{name}</Text>
              </View>
              <Text style={styles.label}>{t('encounter.chat.whatsWrong')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.reasonRow}
              onPress={() => setReason(item)}
              accessibilityRole="radio"
              accessibilityState={{ selected: reason === item }}
            >
              <Text style={[styles.reasonText, reason === item && styles.reasonSelected]}>
                {t(`encounter.chat.reasons.${item}`)}
              </Text>
              {reason === item ? <Text style={styles.check}>✓</Text> : null}
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.reportBlock}>
              <Text style={styles.label}>
                {t('encounter.chat.anythingElse')} <Text style={styles.optional}>{t('encounter.chat.optional')}</Text>
              </Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={2000}
                placeholder={t('encounter.chat.contextPlaceholder')}
                placeholderTextColor={Colors.Faint}
                accessibilityLabel={t('encounter.chat.anythingElse')}
                style={styles.context}
              />
              <Text style={styles.muted}>{t('encounter.chat.anonymity', { name })}</Text>
              {/* The sharing acknowledgement the report requires: the read scope, stated before sending (§23.14). */}
              <Text style={styles.muted}>{t('encounter.chat.readScope')}</Text>
              {sheetError ? <Text accessibilityRole="alert" style={styles.error}>{sheetError}</Text> : null}
              <TouchableOpacity
                style={[styles.primary, (!reason || acting) && styles.disabled]}
                disabled={!reason || acting}
                accessibilityRole="button"
                accessibilityState={{ disabled: !reason || acting, busy: acting }}
                onPress={() => {
                  if (!reason || !helloId) { setSheetError(t('encounter.chat.pickReason')); return; }
                  void runSheetAction(
                    () => reportChatMessage({ helloId, messageId: message.id, reason, details: details.trim() || undefined }),
                    () => { setReason(null); setDetails(''); setSheet({ kind: 'sent' }); }
                  );
                }}
              >
                <Text style={styles.primaryText}>{t('encounter.chat.sendIt')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  }

  if (sheet?.kind === 'sent') {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={[styles.sent, styles.pad]}>
          <View style={styles.sentMark}><Text style={styles.sentMarkText}>✓</Text></View>
          <Text style={styles.sentTitle}>{t('encounter.chat.sentTitle')}</Text>
          <Text style={styles.muted}>{t('encounter.chat.readScope')}</Text>
          <View style={styles.bullets}>
            <Text style={styles.muted}>{t('encounter.chat.sentNever', { name })}</Text>
            <Text style={styles.muted}>{t('encounter.chat.sentOutcome')}</Text>
            <Text style={styles.muted}>{t('encounter.chat.sentBlock')}</Text>
          </View>
        </View>
        <View style={[styles.pad, styles.sentActions]}>
          {chat.person.userId && chat.canSend ? (
            <TouchableOpacity style={styles.outline} onPress={openBlock} accessibilityRole="button">
              <Text style={styles.outlineText}>{t('encounter.chat.blockName', { name })}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.soft} onPress={() => setSheet(null)} accessibilityRole="button">
            <Text style={styles.outlineText}>{t('encounter.chat.backToChat')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.statusBar} />
      {header}
      <FlatList
        data={chat.messages}
        keyExtractor={m => m.id}
        style={styles.list}
        contentContainerStyle={styles.messages}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        ListEmptyComponent={<Text style={[styles.muted, styles.centerText]}>{t('encounter.chat.empty')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => { if (!item.mine) { setSheetError(null); setSheet({ kind: 'actions', message: item }); } }}
            disabled={item.mine}
            accessibilityRole={item.mine ? 'text' : 'button'}
            accessibilityHint={item.mine ? undefined : t('encounter.chat.thisMessage')}
            style={item.mine ? styles.mineWrap : styles.theirsWrap}
            testID={`chat-message-${item.id}`}
          >
            <Text style={item.mine ? styles.mine : styles.theirs}>{item.body}</Text>
          </TouchableOpacity>
        )}
      />

      {chat.canSend ? (
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={text => { setDraft(text); setSendError(null); }}
            placeholder={t('encounter.chat.placeholder', { name })}
            placeholderTextColor={Colors.Faint}
            accessibilityLabel={t('encounter.chat.placeholder', { name })}
            editable={!sending}
            multiline
            maxLength={2000}
            style={styles.input}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sending) && styles.disabled]}
            onPress={() => void send()}
            disabled={!draft.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel={t('encounter.chat.sendLabel')}
            accessibilityState={{ disabled: !draft.trim() || sending, busy: sending }}
          >
            {sending ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.sendText}>{t('encounter.chat.send')}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.composer}>
          <Text style={styles.muted}>{t('encounter.chat.blockedByYou')}</Text>
        </View>
      )}
      {sendError ? <Text accessibilityRole="alert" style={[styles.error, styles.pad]}>{sendError}</Text> : null}

      {sheet?.kind === 'actions' || sheet?.kind === 'leave' ? (
        <View style={styles.scrim}>
          <View style={styles.sheet} testID="chat-sheet">
            <View style={styles.grabber} />
            {sheet.kind === 'actions' ? (
              <>
                <Text style={styles.label}>{t('encounter.chat.thisMessage')}</Text>
                <View style={styles.quoteBubble}><Text style={styles.quoteText}>{sheet.message.body}</Text></View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.action} onPress={() => { setReason(null); setDetails(''); setSheet({ kind: 'reason', message: sheet.message }); }} accessibilityRole="button">
                    <Text style={styles.actionText}>{t('encounter.chat.reportIt')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.action}
                    disabled={acting}
                    accessibilityRole="button"
                    onPress={() => {
                      const id = sheet.message.id;
                      if (!helloId) return;
                      void runSheetAction(() => hideChatMessage(helloId, id), () => {
                        setChat(c => (c ? { ...c, messages: c.messages.filter(m => m.id !== id) } : c));
                        setSheet(null);
                      });
                    }}
                  >
                    <Text style={styles.actionText}>{t('encounter.chat.hideIt')}</Text>
                  </TouchableOpacity>
                  {chat.person.userId && chat.canSend ? (
                    <TouchableOpacity style={[styles.action, styles.actionLast]} onPress={openBlock} accessibilityRole="button">
                      <Text style={styles.actionText}>{t('encounter.chat.blockPerson')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text style={styles.muted}>{t('encounter.chat.blockNote')}</Text>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>{t('encounter.chat.leaveConfirm')}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.action}
                    disabled={acting}
                    accessibilityRole="button"
                    onPress={() => {
                      if (!helloId) return;
                      void runSheetAction(() => leaveChat(helloId), () => { setSheet(null); router.back(); });
                    }}
                  >
                    <Text style={styles.actionText}>{t('encounter.chat.leaveYes')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, styles.actionLast]} onPress={() => setSheet(null)} accessibilityRole="button">
                    <Text style={styles.actionText}>{t('encounter.chat.leaveNo')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {sheetError ? <Text accessibilityRole="alert" style={styles.error}>{sheetError}</Text> : null}
            {sheet.kind === 'actions' ? (
              <TouchableOpacity onPress={() => setSheet(null)} accessibilityRole="button" style={styles.closeSheet}>
                <Text style={styles.muted}>{t('encounter.chat.close')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center', marginTop: 24 },
  pad: { paddingHorizontal: 22 },
  statusBar: { height: 44 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  back: { fontSize: 17, color: Colors.Ink },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  headerAction: { fontSize: 14, fontWeight: '600', color: Colors.Muted },
  list: { flex: 1 },
  messages: { paddingHorizontal: 18, paddingVertical: 16, gap: 12 },
  theirsWrap: { alignSelf: 'flex-start', maxWidth: '78%' },
  mineWrap: { alignSelf: 'flex-end', maxWidth: '78%' },
  theirs: {
    backgroundColor: Colors.Bone,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 5,
    overflow: 'hidden',
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 15.5,
    lineHeight: 22,
    color: Colors.Ink,
  },
  mine: {
    backgroundColor: Colors.Ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 15.5,
    lineHeight: 22,
    color: Colors.Chalk,
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.Hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.Bone,
    borderRadius: 22,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15.5,
    color: Colors.Ink,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: Colors.Chalk, fontSize: 17 },
  disabled: { opacity: 0.4 },
  muted: { fontSize: 13, lineHeight: 20, color: Colors.Muted },
  error: { fontSize: 14, lineHeight: 20, color: Colors.SignalRed, marginTop: 8 },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(31,30,28,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 12,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.Line, alignSelf: 'center' },
  label: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  optional: { textTransform: 'none', letterSpacing: 0, fontWeight: '600', color: Colors.Faint },
  quoteBubble: { backgroundColor: Colors.Bone, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  quoteText: { fontSize: 15, lineHeight: 21, color: Colors.Ink },
  actions: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, overflow: 'hidden' },
  action: { padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.Hairline },
  actionLast: { borderBottomWidth: 0 },
  actionText: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  closeSheet: { alignSelf: 'center', paddingVertical: 4 },
  reportHeader: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancel: { fontSize: 15, color: Colors.Muted, fontWeight: '600' },
  reportTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  headerSpacer: { width: 48 },
  reportBlock: { gap: 10, paddingVertical: 8 },
  quote: { backgroundColor: Colors.Bone, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, gap: 3 },
  meta: { fontSize: 13, color: Colors.Muted },
  reasonRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonText: { fontSize: 16, color: Colors.Ink },
  reasonSelected: { fontWeight: '700' },
  check: { fontSize: 12, fontWeight: '800', color: Colors.Chalk, backgroundColor: Colors.Ink, width: 21, height: 21, borderRadius: 11, textAlign: 'center', lineHeight: 21, overflow: 'hidden' },
  context: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 58,
    fontSize: 15,
    color: Colors.Ink,
  },
  primary: { backgroundColor: Colors.Ink, borderRadius: 27, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 26 },
  primaryText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  sent: { flex: 1, justifyContent: 'center', gap: 22 },
  sentMark: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: Colors.Ink, alignItems: 'center', justifyContent: 'center' },
  sentMarkText: { fontSize: 20, fontWeight: '800', color: Colors.Ink },
  sentTitle: { fontSize: 30, lineHeight: 34, fontWeight: '800', color: Colors.Ink, letterSpacing: -0.75 },
  bullets: { borderTopWidth: 1, borderTopColor: Colors.Line, paddingTop: 20, gap: 13 },
  sentActions: { gap: 10, paddingBottom: 26 },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 27, height: 54, alignItems: 'center', justifyContent: 'center' },
  soft: { backgroundColor: Colors.Bone, borderRadius: 27, height: 54, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
});
