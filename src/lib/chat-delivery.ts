/**
 * Chat new-message delivery with a fallback (APP-STORE-BUILD-PLAN B-10).
 *
 * Preferred path: long-poll GET /hellos/:id/chat/messages?after=&wait= (sayhello-api hello-chat.ts) — the server holds
 * the request and answers the moment the other person sends. Fallback: the screen's full re-read (GET /hellos/:id/chat)
 * every FALLBACK_POLL_MS, used when the long-poll fails, the server does not have the endpoint (404/405), or it returns
 * at once with nothing (a server that ignores `wait`). Pure of React so it can be tested with injected fetch and clock.
 */
import type { ChatMessage } from '../api/hellos';

/** Requested server hold, seconds. Kept under the API client's 10 s request timeout and the server's own cap. */
export const LONGPOLL_WAIT_SECONDS = 6;
/** The previous behaviour, now the fallback cadence. */
export const FALLBACK_POLL_MS = 15_000;
/** An empty answer faster than this means the server did not hold: back off instead of hammering. */
const MIN_HELD_MS = 500;
const IDLE_CHECK_MS = 2_000;

export type UpdatesResult =
  | { data: { chat: { messages: ChatMessage[]; canSend: boolean } }; error?: undefined }
  | { data?: undefined; error: { status?: number; code?: string; message?: string } };

export interface DeliveryOptions {
  fetchUpdates: (afterId: string | null, waitSeconds: number) => Promise<UpdatesResult>;
  getAfterId: () => string | null;
  /** False while the app is backgrounded: nothing is fetched. */
  isActive: () => boolean;
  onMessages: (messages: ChatMessage[], canSend: boolean) => void;
  /** The server says the chat closed for this viewer (left / not open / blocker send path). */
  onClosed: () => void;
  /** Full re-read used by the fallback. */
  onFallbackPoll: () => Promise<void> | void;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const CLOSED_CODES = new Set(['chat_left', 'chat_not_open', 'chat_blocked']);

/** Appends messages not already present (by id), keeping the order received. */
export function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  return added.length === 0 ? existing : [...existing, ...added];
}

/** Starts the loop; call the returned function to stop it. */
export function startChatDelivery(opts: DeliveryOptions): () => void {
  const timers = new Set<{ id: ReturnType<typeof setTimeout>; wake: () => void }>();
  // The default sleep is cancelled by stop(), so leaving the screen leaves no timer behind.
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    const t = { id: setTimeout(() => { timers.delete(t); resolve(); }, ms), wake: resolve };
    timers.add(t);
  }));
  const now = opts.now ?? Date.now;
  let stopped = false;
  let pollOnly = false;

  const fallback = async () => {
    await sleep(FALLBACK_POLL_MS);
    if (!stopped && opts.isActive()) await opts.onFallbackPoll();
  };

  (async () => {
    while (!stopped) {
      if (!opts.isActive()) { await sleep(IDLE_CHECK_MS); continue; }
      if (pollOnly) { await fallback(); continue; }

      const startedAt = now();
      let res: UpdatesResult;
      try {
        res = await opts.fetchUpdates(opts.getAfterId(), LONGPOLL_WAIT_SECONDS);
      } catch {
        res = { error: { status: 0 } };
      }
      if (stopped) return;

      if (res.error) {
        if (res.error.code && CLOSED_CODES.has(res.error.code)) { opts.onClosed(); return; }
        if (res.error.status === 404 || res.error.status === 405) pollOnly = true;
        await fallback();
        continue;
      }
      const { messages, canSend } = res.data.chat;
      if (messages.length > 0) opts.onMessages(messages, canSend);
      else if (now() - startedAt < MIN_HELD_MS) await sleep(MIN_HELD_MS * 2);
    }
  })();

  return () => {
    stopped = true;
    for (const t of timers) { clearTimeout(t.id); t.wake(); }
    timers.clear();
  };
}
