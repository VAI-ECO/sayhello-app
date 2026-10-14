/**
 * HELLO ADMIN STACK — staff back office. Every screen is gated on the server by its own permission
 * (§23.10); this stack only lays them out.
 */

import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="audit" />
      <Stack.Screen name="roles" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="applications" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="two-factor" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="report-detail" />
      <Stack.Screen name="selfie-removal" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="campaigns" />
      <Stack.Screen name="operations" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="system" />
      <Stack.Screen name="drawings" />
      <Stack.Screen name="store" />
      <Stack.Screen name="fulfilment" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="overrides" />
      <Stack.Screen name="venue-links" />
      <Stack.Screen name="see-layer" />
    </Stack>
  );
}
