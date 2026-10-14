import { createBleConfirmer, normalizeUuid, type BleDeps, type BleDevice, type LostResult, type ProofResult } from '../ble-confirm';

jest.mock('../../api/discovery', () => ({}));

const MARKER = '5a11e110';
const OWN = `${MARKER}-aaaa-aaaa-aaaa-aaaaaaaaaaaa`;
const PEER = `${MARKER}-bbbb-bbbb-bbbb-bbbbbbbbbbbb`;
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

function setup(over: Partial<BleDeps> = {}, validForMs = 600_000) {
  let clock = 1_000_000;
  let deviceCb: ((d: BleDevice) => void) | null = null;
  const log = { adv: [] as string[], scans: 0, stoppedAdv: 0, stoppedScan: 0, posts: [] as Array<{ token: string; rssi: number }[]>, pins: 0, lost: [] as number[] };
  const timers: Array<{ fn: () => void; ms: number }> = [];
  const deps: BleDeps = {
    supported: true,
    getToken: async () => ({ status: 'ok', token: { ownToken: OWN, appMarker: MARKER, validUntil: new Date(clock + validForMs).toISOString(), enterRssiDbm: -80, exitRssiDbm: -90, sampleIntervalSeconds: 30, outOfRangeSamples: 3, graceMinutes: 5, graceUntil: new Date(clock + 300_000).toISOString() } }),
    ensurePermissions: async () => true,
    startAdvertising: (u) => { log.adv.push(u); },
    stopAdvertising: () => { log.stoppedAdv++; },
    startScan: () => { log.scans++; },
    stopScan: () => { log.stoppedScan++; },
    onDevice: (cb) => { deviceCb = cb; return () => { deviceCb = null; }; },
    postProof: async (_id, heard) => { log.posts.push(heard); return { status: 'confirmed' } as ProofResult; },
    postLost: async (_id, n) => { log.lost.push(n); return { status: 'closed', waverly: 'We lost the connection. Nothing to do with you.' } as LostResult; },
    readPin: async () => { log.pins++; return undefined; },
    now: () => clock,
    setTimer: (fn, ms) => { timers.push({ fn, ms }); return timers.length - 1; },
    clearTimer: () => undefined,
    ...over,
  };
  return { deps, log, timers, hear: (d: BleDevice) => deviceCb?.(d), advance: (ms: number) => { clock += ms; } };
}

describe('BLE fine confirmation (foreground, silent on failure)', () => {
  it('advertises its own token, scans, and posts only when the OTHER token is heard strongly enough', async () => {
    const { deps, log, hear } = setup();
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    expect(log.adv).toEqual([OWN]);
    expect(log.scans).toBe(1);
    hear({ serviceUUIDs: [OWN], rssi: -40 });            // own token echo: ignored
    hear({ serviceUUIDs: ['0000180d-0000-1000-8000-00805f9b34fb'], rssi: -40 }); // unrelated device: never uploaded
    hear({ serviceUUIDs: [PEER], rssi: -88 });           // weaker than the enter threshold
    await flush();
    expect(log.posts).toHaveLength(0);
    hear({ serviceUUIDs: [PEER.toUpperCase()], rssi: -70 });
    await flush();
    expect(await done).toBe('confirmed');
    expect(log.posts).toHaveLength(1);
    expect(log.posts[0]).toEqual([{ token: PEER, rssi: -70 }]);   // only marker-prefixed tokens, best signal
    expect(log.stoppedAdv).toBe(1);
    expect(log.stoppedScan).toBe(1);
  });

  it('a server miss keeps listening and says nothing', async () => {
    let n = 0;
    const { deps, hear, advance } = setup({ postProof: async () => ({ status: (++n < 2 ? 'miss' : 'confirmed') as ProofResult['status'] }) });
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    hear({ serviceUUIDs: [PEER], rssi: -60 });
    await flush();
    expect(c.running).toBe(true);
    advance(3000);
    hear({ serviceUUIDs: [PEER], rssi: -60 });
    await flush();
    expect(await done).toBe('confirmed');
  });

  it('times out at the server window and stops the radio', async () => {
    const { deps, timers, log } = setup({}, 120_000);
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    expect(timers[0].ms).toBe(120_000);
    timers[0].fn();
    expect(await done).toBe('timeout');
    expect(log.stoppedScan).toBe(1);
  });

  it('is a quiet no-op when unsupported (web), off, closed, or permission is refused', async () => {
    expect(await createBleConfirmer(setup({ supported: false }).deps).start('h')).toBe('unsupported');
    expect(await createBleConfirmer(setup({ getToken: async () => ({ status: 'off' }) }).deps).start('h')).toBe('unavailable');
    expect(await createBleConfirmer(setup({ getToken: async () => ({ status: 'closed' }) }).deps).start('h')).toBe('unavailable');
    const s = setup({ ensurePermissions: async () => false });
    expect(await createBleConfirmer(s.deps).start('h')).toBe('unavailable');
    expect(s.log.adv).toHaveLength(0);
    expect(s.log.scans).toBe(0);
  });

  it('stop() ends the run and silences the radio', async () => {
    const { deps, log } = setup();
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    c.stop();
    expect(await done).toBe('stopped');
    expect(log.stoppedAdv).toBe(1);
  });

  it('normalizes UUID spelling', () => {
    expect(normalizeUuid(' {5A11E110-AAAA} ')).toBe('5a11e110-aaaa');
  });
});


describe('LOST: consecutive out-of-range samples after the grace window (10.23)', () => {
  // timers[0] = the server window, timers[1] = the first sample (grace end + one interval)
  const GRACE_PLUS = 300_000 + 30_000;

  it('does not sample during grace; three misses in a row report lost and close', async () => {
    const { deps, log, timers, advance } = setup();
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    expect(timers[1].ms).toBe(GRACE_PLUS);
    advance(GRACE_PLUS); timers[1].fn(); await flush();            // miss 1
    expect(log.lost).toEqual([]);
    advance(30_000); timers[2].fn(); await flush();                // miss 2
    expect(log.lost).toEqual([]);
    advance(30_000); timers[3].fn(); await flush();                // miss 3 -> report
    expect(log.lost).toEqual([3]);
    expect(await done).toBe('lost');
    expect(c.lostPhrase).toBe('We lost the connection. Nothing to do with you.');
    expect(log.stoppedScan).toBe(1);
  });

  it('an in-range sample (peer heard at the EXIT level) resets the count', async () => {
    const { deps, log, timers, advance, hear } = setup({ postProof: async () => ({ status: 'miss' }) });
    const c = createBleConfirmer(deps);
    void c.start('h1');
    await flush();
    advance(GRACE_PLUS);
    hear({ serviceUUIDs: [PEER], rssi: -88 });                     // below enter (-80), above exit (-90): stays connected
    timers[1].fn(); await flush();                                 // in range -> misses 0
    advance(30_000); timers[2].fn(); await flush();                // miss 1
    advance(30_000); timers[3].fn(); await flush();                // miss 2
    expect(log.lost).toEqual([]);
    c.stop();
  });

  it('a heard signal weaker than the exit level does not count as in range', async () => {
    const { deps, log, timers, advance, hear } = setup({ postProof: async () => ({ status: 'miss' }) });
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    advance(GRACE_PLUS);
    hear({ serviceUUIDs: [PEER], rssi: -95 });
    timers[1].fn(); await flush();
    advance(30_000); timers[2].fn(); await flush();
    advance(30_000); timers[3].fn(); await flush();
    expect(log.lost).toEqual([3]);
    expect(await done).toBe('lost');
  });

  it('a server that is not convinced keeps the phone sampling, silently', async () => {
    let n = 0;
    const { deps, timers, advance } = setup({ postLost: async () => ({ status: (++n < 2 ? 'open' : 'closed') as LostResult['status'] }) as LostResult, postProof: async () => ({ status: 'miss' }) });
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    for (let i = 1; i <= 4; i++) { advance(i === 1 ? GRACE_PLUS : 30_000); timers[i].fn(); await flush(); }
    expect(await done).toBe('lost');
  });

  it('once confirmed, nothing is sampled any more', async () => {
    const { deps, log, hear } = setup();
    const c = createBleConfirmer(deps);
    const done = c.start('h1');
    await flush();
    hear({ serviceUUIDs: [PEER], rssi: -60 });
    await flush();
    expect(await done).toBe('confirmed');
    expect(log.lost).toEqual([]);
  });
});
