import { toMapDisplayPin } from '../lib/map-display';

describe('map connection payload handling', () => {
  it('does not render pending or missed encounters as pins', () => {
    expect(toMapDisplayPin({ id: 'pending', status: 'pending', from: 'waverly' })).toBeNull();
    expect(toMapDisplayPin({ id: 'missed', status: 'missed', metAt: '2026-09-19T00:00:00Z' })).toBeNull();
  });
  it('does not crash when the reveal gate omits identities and meeting details', () => {
    expect(toMapDisplayPin({ id: 'accepted', status: 'accepted' })).toBeNull();
  });
  it('uses a neutral name instead of leaking internal user IDs', () => {
    const pin = toMapDisplayPin({ id: 'revealed', status: 'accepted', metAt: '2026-09-19T00:00:00Z', user1Id: 'private-id' });
    expect(pin?.person1Name).toBe('a Say Hello member');
    expect(pin?.person2Name).toBe('a Say Hello member');
    expect(JSON.stringify(pin)).not.toContain('private-id');
  });
  it('preserves provided display data', () => {
    expect(toMapDisplayPin({ id: 'pin', metAt: '2026-09-19T00:00:00Z', user1FullName: 'Alex', user2FullName: 'Sam', locationName: 'Town', helloCode: 'ABC-DEFG' })).toEqual({ id: 'pin', timestamp: '2026-09-19T00:00:00Z', person1Name: 'Alex', person2Name: 'Sam', locationName: 'Town', pinNumber: 'ABC-DEFG' });
  });
});
