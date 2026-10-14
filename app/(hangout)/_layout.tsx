/**
 * HELLO HANGOUT (business) STACK — owner portal and the public directory.
 */

import { Stack } from 'expo-router';

export default function HangoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="hours" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="posts" />
      <Stack.Screen name="directory/index" />
      <Stack.Screen name="directory/[id]" />
      <Stack.Screen name="directory/wall" />
      <Stack.Screen name="directory/here" />
      <Stack.Screen name="redeem" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="category" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="directory/saved" />
      <Stack.Screen name="claim" />
    </Stack>
  );
}
