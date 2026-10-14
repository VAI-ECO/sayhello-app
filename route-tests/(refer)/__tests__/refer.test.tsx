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

  it('shows referral form with disabled submit', async () => {
    await render(
      <ThemeProvider>
        <ReferHangoutScreen />
      </ThemeProvider>
    );

    expect(screen.getByTestId('refer-search')).toBeTruthy();
    expect(screen.getByTestId('refer-unavailable')).toBeTruthy();
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
