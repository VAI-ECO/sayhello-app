import { nudgeTapTarget } from '../use-nudge-handoff';

jest.mock('expo-notifications', () => ({ addNotificationResponseReceivedListener: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: jest.fn() }) }));

describe('push handoff', () => {
  it('only Waverly\'s nearby nudge opens Home', () => {
    expect(nudgeTapTarget({ kind: 'hello_nudge' })).toBe('/home');
    expect(nudgeTapTarget({ kind: 'hello_reveal' })).toBeNull();
    expect(nudgeTapTarget(undefined)).toBeNull();
  });
});
