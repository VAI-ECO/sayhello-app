jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));
jest.mock('../../api/hellos', () => ({ placeHelloPin: jest.fn() }));
jest.mock('../../api/client', () => ({ addSessionChangeListener: jest.fn() }));

import { refineMeetingPin, resetMeetingPinState, type PinDeps } from '../meeting-pin';

const pos = { lat: 13.7563, lng: 100.5018 };

function deps(overrides: Partial<PinDeps> = {}): PinDeps & { post: jest.Mock; readPosition: jest.Mock } {
  return {
    readPosition: jest.fn().mockResolvedValue(pos),
    post: jest.fn().mockResolvedValue({ placed: true }),
    ...overrides,
  } as PinDeps & { post: jest.Mock; readPosition: jest.Mock };
}

beforeEach(() => resetMeetingPinState());

describe('refineMeetingPin (RULES §8.3, §10.8; migration 261)', () => {
  it('sends this phone’s position once and settles the Hello', async () => {
    const d = deps();
    expect(await refineMeetingPin('h1', d)).toBe('placed');
    expect(d.post).toHaveBeenCalledWith('h1', pos);
    expect(await refineMeetingPin('h1', d)).toBe('already');
    expect(d.post).toHaveBeenCalledTimes(1);
  });

  it('settles when the server already holds a pin, and never sends a second position', async () => {
    const d = deps({ post: jest.fn().mockResolvedValue({ placed: false }) });
    expect(await refineMeetingPin('h1', d)).toBe('already');
    expect(await refineMeetingPin('h1', d)).toBe('already');
    expect(d.post).toHaveBeenCalledTimes(1);
  });

  it('reads nothing and sends nothing without a position (permission not granted): limited mode, silent, retryable', async () => {
    const d = deps({ readPosition: jest.fn().mockResolvedValue(null) });
    expect(await refineMeetingPin('h1', d)).toBe('no_position');
    expect(d.post).not.toHaveBeenCalled();
    // A later screen may try again and succeed.
    const later = deps();
    expect(await refineMeetingPin('h1', later)).toBe('placed');
  });

  it('stays retryable after a failed request and never throws', async () => {
    const failing = deps({ post: jest.fn().mockResolvedValue(null) });
    expect(await refineMeetingPin('h1', failing)).toBe('error');
    const throwing = deps({ post: jest.fn().mockRejectedValue(new Error('network')) });
    expect(await refineMeetingPin('h1', throwing)).toBe('error');
    expect(await refineMeetingPin('h1', deps())).toBe('placed');
  });

  it('does not run two requests for one Hello at once', async () => {
    let release: (v: { placed: boolean }) => void = () => undefined;
    const slow = deps({ post: jest.fn().mockImplementation(() => new Promise((r) => { release = r; })) });
    const first = refineMeetingPin('h1', slow);
    await Promise.resolve();
    await Promise.resolve();
    expect(await refineMeetingPin('h1', slow)).toBe('already');
    release({ placed: true });
    expect(await first).toBe('placed');
    expect(slow.post).toHaveBeenCalledTimes(1);
  });
});
