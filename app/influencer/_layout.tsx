/**
 * INFLUENCER (CREATOR) STACK
 */

import { Stack } from 'expo-router';

export default function InfluencerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="pick-code" />
      <Stack.Screen name="code-taken" />
      <Stack.Screen name="my-links" />
      <Stack.Screen name="ambassadors" />
      <Stack.Screen name="toolkit" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
