/**
 * Stripe PaymentSheet (iOS / Android) over the API's payment-intent routes. The API creates the intent (amount from
 * its own rows, never from the app) and returns `clientSecret`; the sheet collects the card and confirms it.
 * The publishable key comes from EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY; without it nothing here runs and the screens keep
 * "payments aren't connected". A confirmed sheet does NOT change any order or membership state: only the verified
 * webhook does, so callers reload from the server afterwards.
 */
import type { PaymentSheetOutcome, PaymentSheetRequest } from './payment-sheet.types';

export type { PaymentSheetOutcome, PaymentSheetRequest };

/** Read from the environment at build time (Expo inlines EXPO_PUBLIC_*). */
function publishableKey(): string {
  return (process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').trim();
}

export function paymentSheetAvailable(): boolean {
  return /^pk_(test|live)_/.test(publishableKey());
}

let initialisedKey: string | null = null;

export async function payWithSheet(request: PaymentSheetRequest): Promise<PaymentSheetOutcome> {
  const key = publishableKey();
  if (!paymentSheetAvailable() || request.provider === 'stub' || !request.clientSecret || request.clientSecret.endsWith('_secret_stub')) {
    return { status: 'not_connected' };
  }
  try {
    // Required lazily so the native module loads only when a payment is actually attempted.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stripe = require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');
    if (initialisedKey !== key) {
      await stripe.initStripe({ publishableKey: key, urlScheme: 'sayhello' });
      initialisedKey = key;
    }
    const init = await stripe.initPaymentSheet({
      paymentIntentClientSecret: request.clientSecret,
      merchantDisplayName: 'Say Hello',
      returnURL: 'sayhello://stripe-redirect',
      allowsDelayedPaymentMethods: false,
      // Apple Pay / Google Pay need the owner's merchant ids; the sheet shows cards until they exist.
    });
    if (init.error) return { status: 'failed', message: init.error.message };
    const result = await stripe.presentPaymentSheet();
    if (!result.error) return { status: 'paid' };
    return result.error.code === stripe.PaymentSheetError.Canceled
      ? { status: 'cancelled' }
      : { status: 'failed', message: result.error.message };
  } catch (error) {
    return { status: 'failed', message: error instanceof Error ? error.message : String(error) };
  }
}
