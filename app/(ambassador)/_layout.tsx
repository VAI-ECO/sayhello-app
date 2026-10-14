/**
 * AMBASSADOR STACK
 */

import { Stack } from 'expo-router';

export default function AmbassadorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="earned-building" />
      <Stack.Screen name="hangouts" />
      <Stack.Screen name="queue-offer" />
      <Stack.Screen name="visit-check-in" />
      <Stack.Screen name="visit-history" />
      <Stack.Screen name="commissions" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="store" />
      <Stack.Screen name="find-business" />
      <Stack.Screen name="confirm-details" />
      <Stack.Screen name="photo" />
    </Stack>
  );
}
