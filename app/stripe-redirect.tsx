/**
 * sayhello://stripe-redirect - Stripe's return URL after a redirect-based payment method. The sheet finishes on its own;
 * this route only keeps the router from showing "not found", and puts the person back where they were.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function StripeRedirectScreen() {
  const router = useRouter();
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home' as never);
  }, [router]);
  return null;
}
