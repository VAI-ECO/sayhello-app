jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));
jest.mock('../../api/hellos', () => ({ getHellos: jest.fn() }));

import { deriveLive } from '../use-live-hellos';
import type { EncounterHello } from '../../api/hellos';

const NOW = Date.parse('2026-10-02T12:00:00Z');
const inMinutes = (m: number) => new Date(NOW + m * 60_000).toISOString();

describe('deriveLive — countdowns (RULES §10.13-10.15, §10.25)', () => {
  it('counts a missed connection down to the same reveal, soonest first, alongside accepted ones', () => {
    const hellos: EncounterHello[] = [
      { id: 'a', status: 'accepted', revealScheduledAt: inMinutes(120) },
      { id: 'm', status: 'missed', revealScheduledAt: inMinutes(30) },
    ];
    const { countdowns } = deriveLive(hellos, NOW);
    expect(countdowns.map((c) => c.hello.id)).toEqual(['m', 'a']);
    expect(countdowns[0].msRemaining).toBe(30 * 60_000);
  });

  it('leaves a missed connection out of the countdowns once it is revealed, or when the server gives no reveal time', () => {
    const hellos: EncounterHello[] = [
      { id: 'revealed', status: 'missed', revealScheduledAt: inMinutes(-5), revealedAt: inMinutes(-4), revealSeen: false },
      { id: 'noclock', status: 'missed' },
    ];
    const { countdowns, reveals } = deriveLive(hellos, NOW);
    expect(countdowns).toEqual([]);
    // A revealed missed connection stays on top of Home until opened (§10.24).
    expect(reveals.map((h) => h.id)).toEqual(['revealed']);
  });

  it('never counts down a pending nudge or a closed hello', () => {
    const { countdowns, nudges } = deriveLive(
      [{ id: 'p', status: 'pending' }, { id: 'c', status: 'closed', revealScheduledAt: inMinutes(10) }],
      NOW,
    );
    expect(countdowns).toEqual([]);
    expect(nudges.map((h) => h.id)).toEqual(['p']);
  });
});
