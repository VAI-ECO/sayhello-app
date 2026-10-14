import { deviceTzOffsetMinutes, toUIFeedItem } from '../feed-model';
import type { HootzaItem, PostItem } from '../../api/feed';

const hootza = (over: Partial<HootzaItem> = {}): HootzaItem => ({
  type: 'hootza', id: 'h1', title: 'Trivia', venueType: 'public_place', locationName: 'Bell St', startTime: '2026-10-03T12:00:00Z',
  host: { id: 'u', fullName: 'Host' }, rsvpCount: 3, checkinCount: 0, createdAt: '2026-10-01T00:00:00Z', ...over,
});

describe('toUIFeedItem', () => {
  it('takes Tonight from the server, never from an hour in the app', () => {
    expect(toUIFeedItem(hootza({ isTonight: true })).isTonight).toBe(true);
    expect(toUIFeedItem(hootza({ isTonight: false })).isTonight).toBe(false);
    expect(toUIFeedItem(hootza()).isTonight).toBe(false);
  });
  it('says a private residence is one when the server withheld where', () => {
    const item = toUIFeedItem(hootza({ venueType: 'private_residence', locationName: undefined }));
    expect(item.locationName).toBeNull();
    expect(item.privateResidence).toBe(true);
    expect(toUIFeedItem(hootza({ venueType: 'private_residence', locationName: '12 Elm' })).privateResidence).toBe(false);
  });
  it('maps a Discount and a Holla to their Hello Hangout page', () => {
    const post = (type: 'special' | 'holla'): PostItem => ({
      type, id: 'p', title: 'Two for one', isAllDay: false, createdAt: '2026-10-03T00:00:00Z', dealEndDate: '2026-10-05T10:00:00Z',
      hangout: { id: 'l', businessName: 'Ridge Tavern', locationLat: 0, locationLng: 0, isFounding: false, directoryId: 'hh1' },
    });
    expect(toUIFeedItem(post('special'))).toMatchObject({ type: 'discount', directoryId: 'hh1', locationName: 'Ridge Tavern' });
    expect(toUIFeedItem(post('holla'))).toMatchObject({ type: 'holla', directoryId: 'hh1' });
  });
  it('carries the post id so the tapped Discount or Holla is selected on the directory page (§17.23)', () => {
    const post: PostItem = {
      type: 'special', id: 'p1', title: 'Two for one', isAllDay: false, createdAt: '2026-10-03T00:00:00Z',
      hangout: { id: 'l', businessName: 'Ridge Tavern', locationLat: 0, locationLng: 0, isFounding: false, directoryId: 'hh1' },
    };
    expect(toUIFeedItem(post).postId).toBe('p1');
    // A Hootza has no directory post.
    expect(toUIFeedItem(hootza()).postId).toBeUndefined();
  });
});

describe('deviceTzOffsetMinutes', () => {
  it('is minutes east of UTC and never -0', () => {
    expect(Object.is(deviceTzOffsetMinutes(new Date()), -0)).toBe(false);
    expect(deviceTzOffsetMinutes(new Date())).toBe(-new Date().getTimezoneOffset() || 0);
  });
});
