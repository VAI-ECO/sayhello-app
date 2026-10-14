const mockInitStripe = jest.fn();
const mockInitSheet = jest.fn();
const mockPresent = jest.fn();
jest.mock('@stripe/stripe-react-native', () => ({
  initStripe: (...a: unknown[]) => mockInitStripe(...a),
  initPaymentSheet: (...a: unknown[]) => mockInitSheet(...a),
  presentPaymentSheet: (...a: unknown[]) => mockPresent(...a),
  PaymentSheetError: { Canceled: 'Canceled' },
}));

const KEY = 'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY';

function load() {
  jest.resetModules();
  return require('../payment-sheet.native') as typeof import('../payment-sheet.native');
}

describe('payment sheet (native)', () => {
  const saved = process.env[KEY];
  beforeEach(() => { mockInitStripe.mockReset(); mockInitSheet.mockReset(); mockPresent.mockReset(); });
  afterEach(() => { if (saved === undefined) delete process.env[KEY]; else process.env[KEY] = saved; });

  it('is not connected without a publishable key and never touches Stripe', async () => {
    delete process.env[KEY];
    const m = load();
    expect(m.paymentSheetAvailable()).toBe(false);
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_x' })).toEqual({ status: 'not_connected' });
    expect(mockInitSheet).not.toHaveBeenCalled();
  });

  it('is not connected for the stub provider even with a key', async () => {
    process.env[KEY] = 'pk_test_abc';
    const m = load();
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_stub', provider: 'stub' })).toEqual({ status: 'not_connected' });
    expect(mockInitSheet).not.toHaveBeenCalled();
  });

  it('presents the sheet and reports paid / cancelled / failed', async () => {
    process.env[KEY] = 'pk_test_abc';
    const m = load();
    mockInitSheet.mockResolvedValue({});
    mockPresent.mockResolvedValueOnce({});
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_x', provider: 'stripe' })).toEqual({ status: 'paid' });
    expect(mockInitStripe).toHaveBeenCalledWith(expect.objectContaining({ publishableKey: 'pk_test_abc' }));
    expect(mockInitSheet).toHaveBeenCalledWith(expect.objectContaining({ paymentIntentClientSecret: 'pi_1_secret_x' }));
    mockPresent.mockResolvedValueOnce({ error: { code: 'Canceled', message: 'c' } });
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_x' })).toEqual({ status: 'cancelled' });
    mockPresent.mockResolvedValueOnce({ error: { code: 'Failed', message: 'declined' } });
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_x' })).toEqual({ status: 'failed', message: 'declined' });
    mockInitSheet.mockResolvedValueOnce({ error: { code: 'Failed', message: 'bad secret' } });
    expect(await m.payWithSheet({ clientSecret: 'pi_1_secret_x' })).toEqual({ status: 'failed', message: 'bad secret' });
  });

  it('web/default module never attempts a payment', async () => {
    const m = require('../payment-sheet') as typeof import('../payment-sheet');
    expect(m.paymentSheetAvailable()).toBe(false);
    expect(await m.payWithSheet({ clientSecret: 'x' })).toEqual({ status: 'not_connected' });
  });
});
