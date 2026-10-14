/**
 * HOOTZAS STACK
 */

import { Stack } from 'expo-router';

export default function HootzasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/host-controls" />
      <Stack.Screen name="[id]/check-in-code" />
      <Stack.Screen name="[id]/check-in" />
      <Stack.Screen name="[id]/host-mode-prompt" />
      <Stack.Screen name="[id]/host-mode-window" />
      <Stack.Screen name="[id]/comments" />
      <Stack.Screen name="[id]/whos-here" />
      <Stack.Screen name="[id]/edit" />
      <Stack.Screen name="[id]/cancel-confirm" />
      <Stack.Screen name="[id]/end-vs-cancel" />
      <Stack.Screen name="create/index" />
      <Stack.Screen name="create/how-it-runs" />
      <Stack.Screen name="create/post-error" />
      <Stack.Screen name="empty" />
      <Stack.Screen name="discount/compose" />
      <Stack.Screen name="discount/out-of-posts" />
    </Stack>
  );
}
