/**
 * AUTH LAYOUT
 *
 * Auth flow:
 * 1. Value cards (placeholder)
 * 2. Phone number + terms consent
 * 3. OTP entry - account created here
 * 4. Name + date of birth
 * 5. Photo (skippable)
 * 6. Identity color picker - app re-themes on tap
 * 7. Permission primers (location, notifications)
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
