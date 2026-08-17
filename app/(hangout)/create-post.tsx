/**
 * H10 CREATE A POST
 * POST /api/feed/posts — needs hangoutId param
 */

import { Redirect, useLocalSearchParams } from 'expo-router';

export default function HangoutCreatePostScreen() {
  const { hangoutId } = useLocalSearchParams<{ hangoutId?: string }>();

  if (hangoutId) {
    return (
      <Redirect
        href={{
          pathname: '/(hootzas)/discount/compose',
          params: { hangoutId },
        }}
      />
    );
  }

  return (
    <Redirect
      href={{
        pathname: '/(hootzas)/discount/compose',
      }}
    />
  );
}
