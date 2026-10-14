/**
 * AUTH ENTRY SCREEN
 *
 * Entry point: Check if user has auth token
 * - Has token → main app
 * - No token → sign in flow
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function AuthScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Initialize API client and check for stored token
    await api.init();

    // For now, since we have no token validation endpoint,
    // we'll check if initialization found a token
    // This would be improved with a proper /auth/me endpoint

    // Default to sign-in flow for unauthenticated users
    router.replace('/(auth)/sign-in-phone');
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.Purple} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Chalk,
  },
});
