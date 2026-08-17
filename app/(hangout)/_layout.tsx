/**
 * HELLO HANGOUT (business) STACK
 */

import { Stack } from 'expo-router';

export default function HangoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="directory/index" />
      <Stack.Screen name="directory/[id]" />
      <Stack.Screen name="redeem" />
    </Stack>
  );
}
