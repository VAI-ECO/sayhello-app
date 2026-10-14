export type PaymentSheetOutcome =
  /** The sheet confirmed the payment. The server still decides the final state (verified webhook). */
  | { status: 'paid' }
  | { status: 'cancelled' }
  | { status: 'failed'; message?: string }
  /** No publishable key, no native sheet (web), or the server's provider is the stub: nothing was attempted. */
  | { status: 'not_connected' };

export interface PaymentSheetRequest {
  /** From the API's payment-intent route (POST /store/orders/:id/pay, /hello-hangouts/:id/checkout, /:id/renew). */
  clientSecret: string;
  /** The API's `provider` field; the local stub cannot be paid through a real sheet. */
  provider?: string;
}
