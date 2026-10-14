import { pathForNotification, resolveDeepLink, resolveSafePushPath } from '../deep-links';

const ID = '123e4567-e89b-42d3-a456-426614174000';

describe('resolveDeepLink', () => {
  it.each([
    ['sayhello://r/Jamie', '/r/Jamie'],
    ['https://sayhello.world/r/Jamie?to=business', '/r/Jamie?to=business'],
    ['https://sayhello.world/Jamie', '/r/Jamie'],
    ['https://sayhello.world/join?code=Jamie&for=ambassador', '/r/Jamie?to=ambassador'],
    ['sayhello://claim?token=abcdefghijklmnop1234', '/claim?token=abcdefghijklmnop1234'],
    ['https://app.example.com/claim?token=abcdefghijklmnop1234', '/claim?token=abcdefghijklmnop1234'],
    ['sayhello://org/' + ID, '/org/' + ID],
    ['sayhello://hootza/' + ID, '/' + ID],
    ['sayhello://' + ID + '/chat', '/' + ID + '/chat'],
    ['sayhello://(admin)/payouts', '/admin/payouts'],
    ['/(tabs)', '/home'],
    ['/(tabs)/home', '/home'],
    ['/(auth)/entry', '/entry'],
    ['/(organization)/org/' + ID, '/org/' + ID],
    ['sayhello://', '/'],
    ['sayhello://ambassador/payouts', '/ambassador/payouts'],
    ['sayhello://store/orders?x=1', '/store/orders?x=1'],
  ])('%s -> %s', (input, expected) => {
    expect(resolveDeepLink(input)).toBe(expected);
  });
  it('does not turn real screens on the public host into creator codes', () => {
    expect(resolveDeepLink('https://sayhello.world/home')).toBe('/home');
    expect(resolveDeepLink('https://sayhello.world/hellos')).toBe('/hellos');
  });
  it('rejects foreign schemes, protocol-relative and traversal', () => {
    expect(resolveDeepLink('javascript://x')).toBeNull();
    expect(resolveDeepLink('//evil.com/x')).toBeNull();
    expect(resolveDeepLink('/admin/../x')).toBeNull();
    expect(resolveDeepLink('https://sayhello.world/join?code=bad%20code')).toBeNull();
  });
});

describe('push tap targets', () => {
  it('maps server kinds', () => {
    expect(pathForNotification({ kind: 'hello_reveal' })).toBe('/hellos');
    expect(pathForNotification({ kind: 'hello_reveal', helloId: ID })).toBe(`/hellos/${ID}`);
    expect(pathForNotification({ kind: 'hello_nudge', helloId: ID, path: '/home' })).toBe('/home');
    expect(pathForNotification({ kind: 'chat_message', helloId: ID, path: `/chat?helloId=${ID}` })).toBe(`/chat?helloId=${ID}`);
    expect(pathForNotification({ kind: 'chat_message', helloId: ID })).toBe(`/chat?helloId=${ID}`);
    expect(pathForNotification({ kind: 'chat_message' })).toBe('/hellos');
    expect(pathForNotification({ kind: 'changed', hootzaId: ID })).toBe(`/${ID}`);
    expect(pathForNotification({ kind: 'cancelled' })).toBe('/home');
    expect(pathForNotification(undefined)).toBe('/home');
  });
  it('follows a payload path only under known surfaces, with new prefixes', () => {
    expect(pathForNotification({ path: '/admin/reports' })).toBe('/admin/reports');
    expect(pathForNotification({ url: 'sayhello://ambassador/commissions' })).toBe('/ambassador/commissions');
    expect(pathForNotification({ path: '/influencer/toolkit' })).toBe('/influencer/toolkit');
    expect(pathForNotification({ path: '/store/orders' })).toBe('/store/orders');
    expect(pathForNotification({ path: '/org/' + ID })).toBe('/org/' + ID);
    expect(pathForNotification({ path: '/(admin)/reports' })).toBe('/admin/reports');
    expect(pathForNotification({ path: '/delete-account', kind: 'hello_reveal' })).toBe('/hellos');
    expect(resolveSafePushPath('https://evil.com/admin')).toBe('/admin');
  });
});
