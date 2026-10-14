/**
 * W8-B strings: store demo account (admin) and card payments. No figure appears here; amounts come from the server.
 * "Demo account" is the Hello Admin word for the sign-in the app store testers use ("review" is a banned word in copy).
 */
export const w8bEn = {
  w8b: {
    demo: {
      title: 'App store demo account',
      lead: 'One phone number signs in without a text message, using a fixed code as long as a sign-in code. Off until you turn it on. Every sign-in through it is recorded in Audit.',
      phone: 'Phone number',
      phoneHint: 'International format, for example +15550001234',
      code: 'Fixed code',
      codeHint: 'Digits only, as many as a sign-in code has (the otp_length setting). Stored only as a hash. It cannot be read back; set a new one to change it.',
      reason: 'Reason',
      turnOn: 'Turn on',
      turnOff: 'Turn off',
      on: 'On for {{phone}}',
      off: 'Off',
      saved: 'Saved and recorded in Audit.',
      cleared: 'Turned off and recorded in Audit.',
      invalid: 'Enter a phone number in international format, a code of digits and a reason.',
      failed: 'Could not save. Try again.',
      managedAbove: 'Changed from the demo account section above.',
    },
    pay: {
      notConnected: "Payments aren't connected yet.",
      sheetFailed: 'The payment did not go through. You have not been charged. Try again.',
      cancelled: 'Payment cancelled. You have not been charged.',
      paid: 'Your payment went through. It can take a moment to show here.',
      preparing: 'Preparing your payment...',
      payNow: 'Pay now',
    },
  },
};
