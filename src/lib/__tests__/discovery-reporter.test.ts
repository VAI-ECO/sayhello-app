import { createDiscoveryReporter, type ReporterDeps, type HeartbeatOutcome } from '../discovery-reporter';
import { encodeGeohash } from '../geohash';

jest.mock('expo-location', () => ({}));
jest.mock('../../api/map', () => ({ getOpenToHellos: jest.fn() }));
jest.mock('../../api/discovery', () => ({ getDiscoveryConfig: jest.fn(), postHeartbeat: jest.fn(), deleteHeartbeat: jest.fn() }));

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function setup(over: Partial<ReporterDeps> = {}) {
  const timers: Array<{ fn: () => void; ms: number; id: number; live: boolean }> = [];
  const calls = { config: 0, open: 0, read: 0, beat: [] as string[], clear: 0 };
  const deps: ReporterDeps = {
    getConfig: async () => { calls.config++; return { active: true, precision: 7, intervalSeconds: 60, ttlSeconds: 180 }; },
    getOpen: async () => { calls.open++; return true; },
    readCell: async (p) => { calls.read++; return { ok: true, cell: encodeGeohash(37.7749, -122.4194, p) }; },
    heartbeat: async (cell) => { calls.beat.push(cell); return 'ok' as HeartbeatOutcome; },
    clear: async () => { calls.clear++; },
    setTimer: (fn, ms) => { const t = { fn, ms, id: timers.length, live: true }; timers.push(t); return t.id; },
    clearTimer: (h) => { const t = timers[h as number]; if (t) t.live = false; },
    ...over,
  };
  return { deps, calls, timers, reporter: createDiscoveryReporter(deps) };
}

describe('discovery reporter (foreground only, off by default)', () => {
  it('does nothing in the background', async () => {
    const { reporter, calls } = setup();
    reporter.setOpen(true);
    await flush();
    expect(calls.config + calls.read + calls.beat.length).toBe(0);
  });

  it('server says inactive: no location read, no heartbeat', async () => {
    const { reporter, calls } = setup({ getConfig: async () => ({ active: false }) });
    reporter.setForeground(true);
    await flush();
    expect(calls.read).toBe(0);
    expect(calls.beat).toHaveLength(0);
  });

  it('Open to Hellos off: no location read, no heartbeat', async () => {
    const { reporter, calls } = setup({ getOpen: async () => false });
    reporter.setForeground(true);
    await flush();
    expect(calls.read).toBe(0);
    expect(calls.beat).toHaveLength(0);
  });

  it('sends only a cell of the server precision and repeats at the server interval', async () => {
    const { reporter, calls, timers } = setup();
    reporter.setForeground(true);
    await flush();
    expect(calls.beat).toHaveLength(1);
    expect(calls.beat[0]).toHaveLength(7);
    expect(calls.beat[0]).toBe(encodeGeohash(37.7749, -122.4194, 7));
    const next = timers.filter((t) => t.live).pop()!;
    expect(next.ms).toBe(60_000);
    next.live = false; next.fn();
    await flush();
    expect(calls.beat).toHaveLength(2);
  });

  it('going to the background stops the loop and deletes the stored cell', async () => {
    const { reporter, calls, timers } = setup();
    reporter.setForeground(true);
    await flush();
    reporter.setForeground(false);
    await flush();
    expect(calls.clear).toBe(1);
    expect(timers.some((t) => t.live)).toBe(false);
  });

  it('turning Open to Hellos off stops at once; turning it on starts', async () => {
    const { reporter, calls } = setup({ getOpen: async () => false });
    reporter.setForeground(true);
    await flush();
    expect(calls.beat).toHaveLength(0);
    reporter.setOpen(true);
    await flush();
    expect(calls.beat).toHaveLength(1);
    reporter.setOpen(false);
    await flush();
    expect(calls.clear).toBe(1);
    expect(reporter.state.running).toBe(false);
  });

  it('a refused location permission is silent and sends nothing', async () => {
    const { reporter, calls } = setup({ readCell: async () => ({ ok: false, problem: 'denied' }) });
    reporter.setForeground(true);
    await flush();
    expect(calls.beat).toHaveLength(0);
    expect(reporter.state.running).toBe(false);
  });

  it('discovery_off or not_open from the server ends the loop', async () => {
    const off = setup({ heartbeat: async () => 'off' });
    off.reporter.setForeground(true);
    await flush();
    expect(off.reporter.state.running).toBe(false);
    const closed = setup({ heartbeat: async () => 'not_open' });
    closed.reporter.setForeground(true);
    await flush();
    expect(closed.reporter.state.open).toBe(false);
  });
});
