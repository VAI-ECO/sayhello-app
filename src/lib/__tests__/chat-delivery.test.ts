import { mergeMessages, startChatDelivery, FALLBACK_POLL_MS, type UpdatesResult } from '../chat-delivery';
import type { ChatMessage } from '../../api/hellos';

const m = (id: string): ChatMessage => ({ id, body: id, mine: false, createdAt: id });
const ok = (messages: ChatMessage[], canSend = true): UpdatesResult => ({ data: { chat: { messages, canSend } } });

/** Resolves sleeps on demand and records them, so the loop can be stepped without real time. */
function harness() {
  const sleeps: number[] = [];
  const waiting: Array<() => void> = [];
  let t = 0;
  return {
    sleeps,
    sleep: (ms: number) => { sleeps.push(ms); return new Promise<void>((r) => waiting.push(r)); },
    release: async () => { waiting.splice(0).forEach((r) => r()); await flush(); },
    now: () => t,
    advance: (ms: number) => { t += ms; },
  };
}
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

describe('mergeMessages', () => {
  it('appends only unseen messages and keeps the same array when nothing is new', () => {
    const base = [m('a'), m('b')];
    expect(mergeMessages(base, [m('b'), m('c')]).map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(mergeMessages(base, [m('a')])).toBe(base);
    expect(mergeMessages(base, [])).toBe(base);
  });
});

describe('startChatDelivery', () => {
  it('delivers messages from the long-poll using the last seen id as cursor', async () => {
    const h = harness();
    const onMessages = jest.fn();
    let last: string | null = 'm1';
    const fetchUpdates = jest.fn()
      .mockImplementationOnce(async () => { h.advance(5000); return ok([m('m2')]); })
      .mockImplementation(() => new Promise<UpdatesResult>(() => undefined)); // second call: held forever
    const stop = startChatDelivery({
      fetchUpdates, getAfterId: () => last, isActive: () => true, sleep: h.sleep, now: h.now,
      onMessages: (msgs, canSend) => { last = msgs[msgs.length - 1].id; onMessages(msgs, canSend); },
      onClosed: jest.fn(), onFallbackPoll: jest.fn(),
    });
    await flush();
    expect(fetchUpdates).toHaveBeenNthCalledWith(1, 'm1', 6);
    expect(onMessages).toHaveBeenCalledWith([m('m2')], true);
    expect(fetchUpdates).toHaveBeenNthCalledWith(2, 'm2', 6);
    stop();
  });

  it('falls back to the full re-read after a failure, then tries the long-poll again', async () => {
    const h = harness();
    const onFallbackPoll = jest.fn();
    const fetchUpdates = jest.fn()
      .mockResolvedValueOnce({ error: { status: 0 } })
      .mockImplementation(() => new Promise<UpdatesResult>(() => undefined));
    const stop = startChatDelivery({
      fetchUpdates, getAfterId: () => null, isActive: () => true, sleep: h.sleep, now: h.now,
      onMessages: jest.fn(), onClosed: jest.fn(), onFallbackPoll,
    });
    await flush();
    expect(h.sleeps).toEqual([FALLBACK_POLL_MS]);
    await h.release();
    expect(onFallbackPoll).toHaveBeenCalledTimes(1);
    expect(fetchUpdates).toHaveBeenCalledTimes(2);
    stop();
  });

  it('uses polling only when the server has no long-poll endpoint (404)', async () => {
    const h = harness();
    const onFallbackPoll = jest.fn();
    const fetchUpdates = jest.fn().mockResolvedValue({ error: { status: 404 } });
    const stop = startChatDelivery({
      fetchUpdates, getAfterId: () => null, isActive: () => true, sleep: h.sleep, now: h.now,
      onMessages: jest.fn(), onClosed: jest.fn(), onFallbackPoll,
    });
    await flush(); await h.release(); await flush(); await h.release();
    expect(fetchUpdates).toHaveBeenCalledTimes(1);
    expect(onFallbackPoll).toHaveBeenCalledTimes(2);
    stop();
  });

  it('reports a closed chat and stops', async () => {
    const h = harness();
    const onClosed = jest.fn();
    const fetchUpdates = jest.fn().mockResolvedValue({ error: { status: 409, code: 'chat_left' } });
    startChatDelivery({
      fetchUpdates, getAfterId: () => null, isActive: () => true, sleep: h.sleep, now: h.now,
      onMessages: jest.fn(), onClosed, onFallbackPoll: jest.fn(),
    });
    await flush();
    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(fetchUpdates).toHaveBeenCalledTimes(1);
  });

  it('backs off when the server answers empty immediately instead of holding', async () => {
    const h = harness();
    const fetchUpdates = jest.fn().mockResolvedValue(ok([]));
    const stop = startChatDelivery({
      fetchUpdates, getAfterId: () => null, isActive: () => true, sleep: h.sleep, now: h.now,
      onMessages: jest.fn(), onClosed: jest.fn(), onFallbackPoll: jest.fn(),
    });
    await flush();
    expect(fetchUpdates).toHaveBeenCalledTimes(1);
    expect(h.sleeps).toEqual([1000]);
    stop();
  });

  it('fetches nothing while the app is backgrounded', async () => {
    const h = harness();
    const fetchUpdates = jest.fn();
    const stop = startChatDelivery({
      fetchUpdates, getAfterId: () => null, isActive: () => false, sleep: h.sleep, now: h.now,
      onMessages: jest.fn(), onClosed: jest.fn(), onFallbackPoll: jest.fn(),
    });
    await flush();
    expect(fetchUpdates).not.toHaveBeenCalled();
    stop();
  });
});
