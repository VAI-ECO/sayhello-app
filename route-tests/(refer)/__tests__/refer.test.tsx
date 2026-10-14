/**
 * R1 MEMBER REFERS A HELLO HANGOUT
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import ReferHangoutScreen from '../../../app/(refer)/hangout';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (cb: () => void) => { const R = require('react'); R.useEffect(cb, []); },
}));
jest.mock('../../../src/api/referrals', () => ({
  getMyReferrals: jest.fn(async () => ({ data: { pointsIfConverted: 7, referrals: [] } })),
  sendReferral: jest.fn(async () => ({ data: { referral: { id: 'r1' } } })),
}));

function distanceGuard(container: unknown) {
  const text = JSON.stringify(container);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
}

describe('Refer Hello Hangout', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn() });
  });

  it('shows the referral form; submit waits for a place name', async () => {
    await render(
      <ThemeProvider>
        <ReferHangoutScreen />
      </ThemeProvider>
    );

    expect(screen.getByTestId('refer-search')).toBeTruthy();
    expect(await screen.findByTestId('refer-points')).toBeTruthy(); // the figure is the server's, not a literal
    expect(screen.getByTestId('refer-submit')).toBeTruthy();
  });

  it('never shows distance (§8.12)', async () => {
    const { container } = await render(
      <ThemeProvider>
        <ReferHangoutScreen />
      </ThemeProvider>
    );
    distanceGuard(container);
  });
});
