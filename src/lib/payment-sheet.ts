/**
 * Stripe PaymentSheet - web / unsupported platforms. There is no native sheet here, so paying is never attempted and
 * the screens keep their honest "payments aren't connected" state. The native implementation is payment-sheet.native.ts.
 */
import type { PaymentSheetOutcome, PaymentSheetRequest } from './payment-sheet.types';

export type { PaymentSheetOutcome, PaymentSheetRequest };

export function paymentSheetAvailable(): boolean {
  return false;
}

export async function payWithSheet(_request: PaymentSheetRequest): Promise<PaymentSheetOutcome> {
  return { status: 'not_connected' };
}
