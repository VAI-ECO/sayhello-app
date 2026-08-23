/**
 * AMBASSADOR · HELLO HANGOUT · INFLUENCER · REFER SCREENS
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import EarnedBuildingScreen from '../earned-building';
import MyHelloHangoutsScreen from '../hangouts';
import QueueOfferScreen from '../queue-offer';
import VisitCheckInScreen from '../visit-check-in';
import VisitHistoryScreen from '../visit-history';
import CommissionsScreen from '../commissions';
import PayoutsScreen from '../payouts';
import AmbassadorSignupScreen from '../signup';
import AmbassadorStoreScreen from '../store';
import * as ambassadorApi from '../../../src/api/ambassador';
import * as codesApi from '../../../src/api/codes';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Redirect: jest.fn(({ href }: { href: unknown }) => null),
}));

jest.mock('../../../src/api/ambassador', () => {
  const actual = jest.requireActual('../../../src/api/ambassador');
  return {
    ...actual,
    getQueueOffer: jest.fn(),
    respondToQueueOffer: jest.fn(),
    setAwayMode: jest.fn(),
    getPayoutBalance: jest.fn(),
    getPayoutHistory: jest.fn(),
    requestPayout: jest.fn(),
    submitW9: jest.fn(),
  };
});
jest.mock('../../../src/api/codes');
jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn() },
}));

function distanceGuard(container: unknown) {
  const text = JSON.stringify(container);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
}

describe('Ambassador Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  describe('A1 Earned and Building', () => {
    it('renders earned vs building cards', async () => {
      (ambassadorApi.getPayoutBalance as jest.Mock).mockResolvedValue({
        data: {
          earned: 20000,
          building: 8000,
          paidOut: 0,
          available: 20000,
          minimumWithdrawal: 20000,
        },
      });

      await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('earned-card')).toBeTruthy();
      });
      expect(screen.getByTestId('building-card')).toBeTruthy();
      expect(screen.getByTestId('earned-card')).toHaveTextContent(/\$200/);
    });

    it('shows error with retry', async () => {
      (ambassadorApi.getPayoutBalance as jest.Mock).mockResolvedValue({
        error: { message: 'Network error' },
      });

      await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('earned-error')).toBeTruthy();
      });
    });

    it('never shows distance (§8.12)', async () => {
      (ambassadorApi.getPayoutBalance as jest.Mock).mockResolvedValue({
        data: {
          earned: 0,
          building: 0,
          paidOut: 0,
          available: 0,
          minimumWithdrawal: 20000,
        },
      });

      const { container } = await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('earned-card')).toBeTruthy());
      distanceGuard(container);
    });
  });

  describe('A2 My Hello Hangouts', () => {
    it('shows unavailable state', async () => {
      await render(
        <ThemeProvider>
          <MyHelloHangoutsScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('hangouts-unavailable')).toBeTruthy();
      fireEvent.press(screen.getByTestId('hangouts-queue-link'));
      expect(mockPush).toHaveBeenCalledWith('/(ambassador)/queue-offer');
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <MyHelloHangoutsScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });

  describe('A3 Queue offer', () => {
    const offer = {
      id: 'offer-1',
      hangoutId: 'h-1',
      status: 'pending',
      offeredAt: '2026-08-17T12:00:00.000Z',
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      hangouts: { id: 'h-1', businessName: 'Blue Note Cafe' },
    };

    it('shows first offer only', async () => {
      (ambassadorApi.getQueueOffer as jest.Mock).mockResolvedValue({
        data: { eligible: true, offers: [offer, { ...offer, id: 'offer-2' }] },
      });

      await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('queue-business-name')).toHaveTextContent('BLUE NOTE CAFE');
      });
      expect(screen.getByTestId('queue-accept')).toBeTruthy();
    });

    it('shows empty state', async () => {
      (ambassadorApi.getQueueOffer as jest.Mock).mockResolvedValue({
        data: { eligible: true, offers: [] },
      });

      await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('queue-empty')).toBeTruthy();
      });
    });

    it('accepts offer', async () => {
      (ambassadorApi.getQueueOffer as jest.Mock).mockResolvedValue({
        data: { eligible: true, offers: [offer] },
      });
      (ambassadorApi.respondToQueueOffer as jest.Mock).mockResolvedValue({
        data: { accepted: true },
      });

      await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('queue-accept')).toBeTruthy());
      fireEvent.press(screen.getByTestId('queue-accept'));
      await waitFor(() => {
        expect(ambassadorApi.respondToQueueOffer).toHaveBeenCalledWith('offer-1', 'accept');
      });
    });

    it('never shows distance (§8.12)', async () => {
      (ambassadorApi.getQueueOffer as jest.Mock).mockResolvedValue({
        data: { eligible: true, offers: [offer] },
      });

      const { container } = await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('queue-accept')).toBeTruthy());
      distanceGuard(container);
    });
  });

  describe('A4 Visit check-in', () => {
    it('explains why visit check exists and disables scan', async () => {
      await render(
        <ThemeProvider>
          <VisitCheckInScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('visit-checkin-unavailable')).toBeTruthy();
      expect(screen.getByTestId('visit-scan-disabled')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <VisitCheckInScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });

  describe('Visit history', () => {
    it('shows unavailable', async () => {
      await render(
        <ThemeProvider>
          <VisitHistoryScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('visit-history-empty')).toBeTruthy();
    });
  });

  describe('Commissions tracker', () => {
    it('shows unavailable', async () => {
      await render(
        <ThemeProvider>
          <CommissionsScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('commissions-unavailable')).toBeTruthy();
    });
  });

  describe('A5 Payouts', () => {
    it('renders balance and empty history', async () => {
      (ambassadorApi.getPayoutBalance as jest.Mock).mockResolvedValue({
        data: {
          earned: 25000,
          building: 0,
          paidOut: 0,
          available: 25000,
          minimumWithdrawal: 20000,
        },
      });
      (ambassadorApi.getPayoutHistory as jest.Mock).mockResolvedValue({
        data: { payouts: [] },
      });

      await render(
        <ThemeProvider>
          <PayoutsScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('payouts-available')).toHaveTextContent('$250');
      });
      expect(screen.getByTestId('payouts-history-empty')).toBeTruthy();
    });

    it('shows error with retry', async () => {
      (ambassadorApi.getPayoutBalance as jest.Mock).mockResolvedValue({
        error: { message: 'Failed' },
      });
      (ambassadorApi.getPayoutHistory as jest.Mock).mockResolvedValue({
        data: { payouts: [] },
      });

      await render(
        <ThemeProvider>
          <PayoutsScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('payouts-error')).toBeTruthy();
      });
    });
  });

  describe('A6 Ambassador signup', () => {
    it('renders steps and W-9 stub action', async () => {
      (ambassadorApi.submitW9 as jest.Mock).mockResolvedValue({
        data: { w9Collected: true, collectedAt: '2026-08-17', message: 'ok' },
      });

      await render(
        <ThemeProvider>
          <AmbassadorSignupScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('signup-w9-stub')).toBeTruthy();
      fireEvent.press(screen.getByTestId('signup-w9-stub'));
      await waitFor(() => {
        expect(ambassadorApi.submitW9).toHaveBeenCalled();
      });
    });
  });

  describe('A7 Ambassador store', () => {
    it('shows unavailable', async () => {
      await render(
        <ThemeProvider>
          <AmbassadorStoreScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('store-unavailable')).toBeTruthy();
    });
  });
});
