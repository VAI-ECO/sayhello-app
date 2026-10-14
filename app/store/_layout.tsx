/**
 * WAVERLY'S PLACE STACK (S3 stage 10) — also carries the Ambassador Shop (same screens, ?shop=ambassador),
 * and the drawing status view.
 */
import { Stack } from 'expo-router';

export default function StoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="product" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order" />
      <Stack.Screen name="drawings" />
    </Stack>
  );
}
