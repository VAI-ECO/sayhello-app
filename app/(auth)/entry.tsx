/**
 * AUTH ENTRY SCREEN
 *
 * Entry point: Check if user has auth token
 * - Has token → main app
 * - No token → sign in flow
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, useTheme } from '../../src/theme';
import { identityColorFromProfile } from '../../src/theme/profile-color';
import { api } from '../../src/api/client';
import { SplashSequence, SPLASH_SEQUENCE_MS } from '../../src/components/consumer/SplashSequence';

// SN-13: leaves ~600ms after the sequence (or once the session check is ready, whichever is later);
// hard ceiling 3s; a tap anywhere skips it.
const SPLASH_LEAVE_MS = SPLASH_SEQUENCE_MS + 600;
const SPLASH_CEILING_MS = 3000;

export default function AuthScreen() {
  const router = useRouter();
  const { setIdentityColor } = useTheme();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splashOver, setSplashOver] = useState(false);
  const startedAt = useRef(Date.now());
  const skip = useRef<(() => void) | null>(null);

  useEffect(() => {
    checkAuth();
    const ceiling = setTimeout(() => setSplashOver(true), SPLASH_CEILING_MS);
    return () => clearTimeout(ceiling);
  }, []);

  /** Resolves when the splash has had its time (or was tapped). Resolves at once when it already has. */
  const splashDone = () => new Promise<void>(resolve => {
    const wait = SPLASH_LEAVE_MS - (Date.now() - startedAt.current);
    if (wait <= 0) { resolve(); return; }
    const timer = setTimeout(resolve, wait);
    skip.current = () => { clearTimeout(timer); resolve(); };
  });

  const checkAuth = async () => {
    setIsChecking(true);
    setError(null);
    try {
      await api.init();
      if (!api.hasSession()) {
        setIdentityColor(Colors.Purple);
        // No sign-in on this device: the front door (SN-14), which offers sign-in and sign-up.
        await splashDone();
        router.replace('/(auth)/front-door');
        return;
      }
      // /users/me already authenticates and checks blocked/deleted accounts.
      const profile = await api.user.getProfile();
      if (profile.error?.status === 401) {
        await splashDone();
        router.replace('/(auth)/sign-in-phone');
      } else if (profile.error) {
        // A network outage is not a logout. Keep the saved session and offer retry.
        setError(profile.error.message);
      } else if (profile.data) {
        setIdentityColor(identityColorFromProfile(profile.data));
        await splashDone();
        router.replace('/(tabs)/home');
      } else {
        setError('Could not check your account. Please try again.');
      }
    } catch {
      setError('Could not read your saved sign-in. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking && !splashOver) {
    return (
      <Pressable style={{ flex: 1 }} onPress={() => skip.current?.()} accessibilityRole="button" accessibilityLabel="Say Hello" testID="splash-skip">
        <SplashSequence />
      </Pressable>
    );
  }
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.Purple} />
      </View>
    );
  }

  if (!error) return null;
  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert">{error}</Text>
      <Pressable onPress={checkAuth} accessibilityRole="button" accessibilityLabel="Try again" style={{ padding: 16, minHeight: 44 }}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Chalk,
  },
});
