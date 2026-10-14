/**
 * INFLUENCER STACK
 */

import { Stack } from 'expo-router';

export default function InfluencerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="earnings" />
      <Stack.Screen name="pick-code" />
      <Stack.Screen name="code-taken" />
    </Stack>
  );
}
