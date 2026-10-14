/**
 * Hangout API client — create posts to /hello-hangouts
 */

import { createHelloHangout } from '../hangouts';
import { api } from '../client';

jest.mock('../client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('hangouts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts create body to /hello-hangouts', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        helloHangout: { id: 'hh-1', price_cents: 19900 },
        pricing: { listPriceCents: 34900, couponOffCents: 15000, priceCents: 19900 },
      },
    });

    const result = await createHelloHangout({
      name: 'Cafe',
      address: '1 Main',
      lat: 0,
      lng: 0,
      tier: 'founding',
    });

    expect(api.post).toHaveBeenCalledWith('/hello-hangouts', {
      name: 'Cafe',
      address: '1 Main',
      lat: 0,
      lng: 0,
      tier: 'founding',
    });
    expect(result.data?.pricing?.priceCents).toBe(19900);
  });
});
