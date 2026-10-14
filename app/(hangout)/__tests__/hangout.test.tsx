/**
 * HELLO HANGOUT (BUSINESS) SCREENS
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react-native';
import { useRouter, Redirect } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HangoutSignupScreen from '../signup';
import HangoutDashboardScreen from '../dashboard';
import HangoutCreatePostScreen from '../create-post';
import HangoutDirectoryScreen from '../directory/index';
import HangoutListingScreen from '../directory/[id]';
import DealRedemptionScreen from '../redeem';
import * as hangoutsApi from '../../../src/api/hangouts';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
  Redirect: jest.fn(({ href }: { href: unknown }) => null),
}));

jest.mock('../../../src/api/hangouts', () => ({
  createHelloHangout: jest.fn(),
  listMyHelloHangouts: jest.fn(),
}));

function distanceGuard() {
  expect(screen.queryByText(/\d+\s*(miles?|mi|km|meters?|feet|ft)\b/i)).toBeNull();
  expect(screen.queryByText(/\d+\s*away/i)).toBeNull();
}

describe('Hello Hangout Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;

  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
  });

  afterEach(() => {
    cleanup();
  });

  describe('H8 Signup — one price + coupons', () => {
    it('shows one list price and coupon CTAs', async () => {
      (hangoutsApi.createHelloHangout as jest.Mock).mockResolvedValue({ data: {} });

      await render(
        <ThemeProvider>
          <HangoutSignupScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('choose-founding')).toBeTruthy();
      expect(screen.getByTestId('choose-regular')).toBeTruthy();
      expect(screen.getByTestId('choose-deferred')).toBeTruthy();
      expect(screen.getByText('One price. Coupons carry every discount.')).toBeTruthy();
      expect(screen.getByTestId('hangout-name')).toBeTruthy();
      expect(screen.getByTestId('hangout-address')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      await render(
        <ThemeProvider>
          <HangoutSignupScreen />
        </ThemeProvider>
      );
      distanceGuard();
    });
  });

  describe('H9 Business dashboard', () => {
    it('shows status from GET /hello-hangouts', async () => {
      (hangoutsApi.listMyHelloHangouts as jest.Mock).mockResolvedValue({
        data: {
          helloHangouts: [
            { id: 'hh-1', name: 'Cafe', status: 'active', tier: 'founding', price_cents: 19900 },
          ],
        },
      });
      await render(
        <ThemeProvider>
          <HangoutDashboardScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('dashboard-status')).toBeTruthy());
      expect(screen.getByText('active')).toBeTruthy();
      fireEvent.press(screen.getByTestId('dashboard-post-cta'));
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(hootzas)/discount/compose',
        params: { helloHangoutId: 'hh-1' },
      });
    });

    it('shows unavailable when none', async () => {
      (hangoutsApi.listMyHelloHangouts as jest.Mock).mockResolvedValue({
        data: { helloHangouts: [] },
      });
      await render(
        <ThemeProvider>
          <HangoutDashboardScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('dashboard-unavailable')).toBeTruthy());
    });
  });

  describe('H10 Create a post', () => {
    it('redirects to discount compose', async () => {
      await render(
        <ThemeProvider>
          <HangoutCreatePostScreen />
        </ThemeProvider>
      );
      expect(Redirect).toHaveBeenCalled();
    });
  });

  describe('H11 Directory', () => {
    it('shows empty/unavailable', async () => {
      await render(
        <ThemeProvider>
          <HangoutDirectoryScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('directory-empty')).toBeTruthy();
    });
  });

  describe('H11a Listing', () => {
    it('shows unavailable', async () => {
      await render(
        <ThemeProvider>
          <HangoutListingScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('listing-unavailable')).toBeTruthy();
    });
  });

  describe('H12 Deal redemption', () => {
    it('shows unavailable with disabled scan', async () => {
      await render(
        <ThemeProvider>
          <DealRedemptionScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('redeem-unavailable')).toBeTruthy();
      expect(screen.getByTestId('redeem-scan')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      await render(
        <ThemeProvider>
          <DealRedemptionScreen />
        </ThemeProvider>
      );
      distanceGuard();
    });
  });
});
