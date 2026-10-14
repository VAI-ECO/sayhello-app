/**
 * CREATOR LINK — sayhello://r/:code and https://sayhello.world/r/:code.
 * Remembers the code, then goes through the auth entry, which restores a saved session and routes on.
 */
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setPendingCreatorCode } from '../../src/state/pending-creator-code';

export default function CreatorLinkScreen() {
  const router = useRouter();
  const { code, to } = useLocalSearchParams<{ code?: string; to?: string }>();
  useEffect(() => {
    setPendingCreatorCode(typeof code === 'string' ? code : null, typeof to === 'string' ? to : 'member');
    router.replace('/(auth)/entry');
  }, [code, to, router]);
  return null;
}
