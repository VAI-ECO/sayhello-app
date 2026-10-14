/**
 * ROOT LAYOUT
 *
 * Wraps entire app with providers and registers global handlers
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '../src/theme';
import { setUnauthorizedHandler, api } from '../src/api/client';
import { usePushHandling } from '../src/lib/push-handling';

export default function RootLayout() {
  const router = useRouter();
  // The saved session is read before any screen mounts: a screen opened directly (web reload, deep link)
  // must not fire its first request without the token.
  const [sessionReady, setSessionReady] = useState(false);

  // Register global 401 handler - navigates to sign-in on token expiry
  useEffect(() => {
    setUnauthorizedHandler(() => {
      console.log('[App] 401 received - navigating to sign-in');
      router.replace('/(auth)/sign-in-phone');
    });

    // Initialize API client (loads stored token)
    api.init().catch(() => {
      // The auth entry screen provides the retry UI for secure-storage failures.
      console.warn('[App] Could not initialize saved sign-in');
    }).finally(() => setSessionReady(true));
  }, [router]);

  usePushHandling(sessionReady);

  if (!sessionReady) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(hootzas)" />
        <Stack.Screen name="ambassador" />
        <Stack.Screen name="(hangout)" />
        <Stack.Screen name="influencer" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="(refer)" />
        <Stack.Screen name="store" />
        <Stack.Screen name="r/[code]" />
      </Stack>
    </ThemeProvider>
  );
}
