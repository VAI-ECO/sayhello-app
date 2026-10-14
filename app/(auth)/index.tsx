/**
 * AUTH ENTRY SCREEN
 *
 * Entry point: Check if user has auth token
 * - Has token → main app
 * - No token → sign in flow
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, useTheme } from '../../src/theme';
import { identityColorFromProfile } from '../../src/theme/profile-color';
import { api } from '../../src/api/client';

export default function AuthScreen() {
  const router = useRouter();
  const { setIdentityColor } = useTheme();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsChecking(true);
    setError(null);
    try {
      await api.init();
      if (!api.hasSession()) {
        setIdentityColor(Colors.Purple);
        router.replace('/(auth)/sign-in-phone');
        return;
      }
      // /users/me already authenticates and checks blocked/deleted accounts.
      const profile = await api.user.getProfile();
      if (profile.error?.status === 401) {
        router.replace('/(auth)/sign-in-phone');
      } else if (profile.error) {
        // A network outage is not a logout. Keep the saved session and offer retry.
        setError(profile.error.message);
      } else if (profile.data) {
        setIdentityColor(identityColorFromProfile(profile.data));
        router.replace('/(tabs)');
      } else {
        setError('Could not check your account. Please try again.');
      }
    } catch {
      setError('Could not read your saved sign-in. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

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
