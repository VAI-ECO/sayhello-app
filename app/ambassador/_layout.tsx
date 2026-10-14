/**
 * AMBASSADOR STACK
 */

import { Stack } from 'expo-router';

export default function AmbassadorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="counter" />
      <Stack.Screen name="earned-building" />
      <Stack.Screen name="hangouts" />
      <Stack.Screen name="queue-offer" />
      <Stack.Screen name="visit-check-in" />
      <Stack.Screen name="visit-history" />
      <Stack.Screen name="commissions" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="store" />
      <Stack.Screen name="stands" />
      <Stack.Screen name="find-business" />
      <Stack.Screen name="confirm-details" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="owner-claim" />
      <Stack.Screen name="my-code" />
      <Stack.Screen name="account" />
      <Stack.Screen name="opt-out" />
      <Stack.Screen name="territory" />
      <Stack.Screen name="toolkit" />
    </Stack>
  );
}
