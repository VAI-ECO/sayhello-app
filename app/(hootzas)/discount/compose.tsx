/**
 * DISCOUNT COMPOSER — kept as a route for existing links; the composer itself is
 * the Hello Hangout H10 composer (app/(hangout)/create-post.tsx), which carries
 * both clocks (§17.6) and edit / repost.
 *
 * VERTICAL-BUILD-06: this screen used to post a Discount with no deal dates and a
 * "post to the feed / page only" switch that the server never received (the post
 * went to the feed either way). It now opens the one composer instead of keeping a
 * second one with a dead control.
 */

import { Redirect, useLocalSearchParams } from 'expo-router';

export default function DiscountComposeScreen() {
  const { hangoutId, helloHangoutId } = useLocalSearchParams<{ hangoutId?: string; helloHangoutId?: string }>();
  const id = helloHangoutId ?? hangoutId;
  return <Redirect href={id ? { pathname: '/(hangout)/create-post', params: { helloHangoutId: id } } : { pathname: '/(hangout)/create-post' }} />;
}
