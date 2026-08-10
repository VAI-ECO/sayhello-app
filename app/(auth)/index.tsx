/**
 * AUTH ENTRY SCREEN
 *
 * Redirects to onboarding flow
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';

export default function AuthScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(onboarding)/value-cards');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.Purple} />
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
