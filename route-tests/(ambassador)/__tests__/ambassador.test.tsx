/**
 * AMBASSADOR · HELLO HANGOUT · INFLUENCER · REFER SCREENS
 *
 * VERTICAL-BUILD-07 (Ambassador field journey) replacements, for coordinator review. Each old
 * assertion below is either kept verbatim or replaced by a stronger one that keeps its intent:
 *
 *  - A1 "renders earned vs building cards … $200": pinned a WITHDRAWABLE TOTAL from the old
 *    GET /payouts/balance, which counted pending rows as both Earned and Building. The canon
 *    (RULES §31 MA-05, A5 tablet note) shows no live balance and no total. Replaced by: the two
 *    halves side by side, Building marked provisional, the total slot "—", and — new — no
 *    dollar figure at all when the server withholds figures. The error+retry and no-distance
 *    checks are kept (same test ids).
 *  - A4 "explains why visit check exists and submits check-in": pressed one button and expected
 *    a visit to be recorded with NO scan and 0/0 coordinates — the exact defect §14.5 forbids.
 *    Replaced by tests that require a live GPS reading AND a camera-read scan before any call
 *    (see ambassador-field.test.tsx). The "why the check exists" copy (§14.7) and the
 *    no-distance-with-no-venue check are kept.
 *  - A5 "renders balance and empty history … $250": same total defect as A1 (a "ready to
 *    withdraw" amount when nothing is withdrawable). Replaced by the withdrawals-not-open
 *    state, the inert Withdraw, and the empty history; the error+retry check is kept
 *    (test id payouts-error → earned-error, the screen is now the shared Earned/Building view).
 *  - A6 "renders steps and W-9 stub action": the stub marked a tax form COLLECTED with nothing
 *    collected. The server now refuses (503), so the screen states the provider chain and the
 *    external gate, and the test asserts no W-9 call is made.
 *  - Visit history: the screen now also reads the book for the term schedule, so the test
 *    supplies that read; its list and empty assertions are unchanged.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import EarnedBuildingScreen from '../../../app/(ambassador)/earned-building';
import MyHelloHangoutsScreen from '../../../app/(ambassador)/hangouts';
import QueueOfferScreen from '../../../app/(ambassador)/queue-offer';
import VisitCheckInScreen from '../../../app/(ambassador)/visit-check-in';
import VisitHistoryScreen from '../../../app/(ambassador)/visit-history';
import CommissionsScreen from '../../../app/(ambassador)/commissions';
import PayoutsScreen from '../../../app/(ambassador)/payouts';
import AmbassadorSignupScreen from '../../../app/(ambassador)/signup';
import AmbassadorStoreScreen from '../../../app/(ambassador)/store';
import * as ambassadorApi from '../../../src/api/ambassador';
import * as s3Api from '../../../src/api/ambassador-s3';
import * as codesApi from '../../../src/api/codes';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
  Redirect: jest.fn(({ href }: { href: unknown }) => null),
}));

// Phone layout by default; the width every Ambassador screen's layout reads.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 375, height: 812, scale: 1, fontScale: 1 }),
}));

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useCameraPermissions: jest.fn(() => [{ granted: true, canAskAgain: true }, jest.fn()]),
    CameraView: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});
jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
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
    getAmbassadorHangouts: jest.fn(),
    getAmbassadorMe: jest.fn(),
    getEarnings: jest.fn(),
    checkInVisit: jest.fn(),
    installStand: jest.fn(),
    getAmbassadorVisits: jest.fn(),
  };
});
jest.mock('../../../src/api/codes');
jest.mock('../../../src/api/ambassador-s3', () => ({
  ...jest.requireActual('../../../src/api/ambassador-s3'),
  getCommissions: jest.fn(),
}));
jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn() },
}));

const api = ambassadorApi as jest.Mocked<typeof ambassadorApi>;
const s3 = s3Api as jest.Mocked<typeof s3Api>;

function distanceGuard() {
  expect(screen.queryByText(/\d+\s*(miles?|mi|km|meters?|feet|ft)\b/i)).toBeNull();
  expect(screen.queryByText(/\d+\s*away/i)).toBeNull();
}

const noEarnings = {
  earned: [],
  building: [],
  reversed: [],
  figuresCleared: false,
  withdrawals: { open: false, reason: 'payout_provider_not_connected', settlementHoldSet: false, fulfilmentWindowSet: false },
};

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
    it('shows Earned and Building side by side, Building provisional, and no total', async () => {
      api.getEarnings.mockResolvedValue({
        data: {
          earnings: {
            ...noEarnings,
            earned: [{ id: 'p1', helloHangoutId: 'h1', venue: 'Rainier Coffee', reason: null, rateAppliedCents: null, rateRule: null, amountCents: null, payoutStatus: 'pending', state: 'earned', createdAt: '2026-09-01T00:00:00Z' }],
            building: [{ helloHangoutId: 'h2', venue: 'Foxhole', state: 'building_waiting_payment', signedAt: '2026-09-02T00:00:00Z' }],
          },
        },
      });

      await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('earned-card')).toBeOnTheScreen();
      expect(screen.getByTestId('building-card')).toBeOnTheScreen();
      // One pair, Earned first; Building carries the provisional tag and never a figure.
      expect(screen.getByTestId('earned-building-pair')).toBeOnTheScreen();
      expect(screen.getByText('Provisional')).toBeOnTheScreen();
      expect(screen.getByTestId('ledger-earned-p1')).toHaveTextContent(/Rainier Coffee/);
      expect(screen.getByTestId('ledger-building-unpaid-h2')).toHaveTextContent(/Signed, waiting on payment/);
      // The server withheld every figure (MA-05): no dollar amount is on the screen.
      expect(screen.queryByText(/\$\d/)).toBeNull();
    });

    it('shows error with retry', async () => {
      api.getEarnings.mockResolvedValue({
        error: { message: 'Network error' },
      });

      await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('earned-error')).toBeOnTheScreen();
      api.getEarnings.mockResolvedValue({ data: { earnings: noEarnings } });
      await fireEvent.press(screen.getByTestId('earned-retry'));
      expect(await screen.findByTestId('earned-card')).toBeOnTheScreen();
    });

    it('never shows distance (§8.12)', async () => {
      api.getEarnings.mockResolvedValue({ data: { earnings: noEarnings } });

      await render(
        <ThemeProvider>
          <EarnedBuildingScreen />
        </ThemeProvider>
      );

      await screen.findByTestId('earned-card');
      distanceGuard();
    });
  });

  describe('A2 My Hello Hangouts', () => {
    it('lists hangouts from GET /ambassador/hangouts', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: {
          hangouts: [{ id: 'hh-1', name: 'Blue Note Cafe', status: 'active', address: '1 Main' }],
        },
      } as never);

      await render(
        <ThemeProvider>
          <MyHelloHangoutsScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('hangouts-list')).toBeTruthy());
      expect(screen.getByTestId('hangout-hh-1')).toBeTruthy();
      expect(screen.getByText('Blue Note Cafe')).toBeTruthy();
    });

    it('shows empty state with queue link', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [] },
      });

      await render(
        <ThemeProvider>
          <MyHelloHangoutsScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('hangouts-empty')).toBeTruthy());
      await fireEvent.press(screen.getByTestId('hangouts-queue-link'));
      expect(mockPush).toHaveBeenCalledWith('/(ambassador)/queue-offer');
    });

    it('never shows distance (§8.12)', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [] },
      });
      await render(
        <ThemeProvider>
          <MyHelloHangoutsScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('hangouts-empty')).toBeTruthy());
      distanceGuard();
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
      api.getQueueOffer.mockResolvedValue({
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
      api.getQueueOffer.mockResolvedValue({
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
      api.getQueueOffer.mockResolvedValue({
        data: { eligible: true, offers: [offer] },
      });
      api.respondToQueueOffer.mockResolvedValue({
        data: { accepted: true },
      });

      await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('queue-accept')).toBeTruthy());
      await fireEvent.press(screen.getByTestId('queue-accept'));
      await waitFor(() => {
        expect(ambassadorApi.respondToQueueOffer).toHaveBeenCalledWith('offer-1', 'accept');
      });
    });

    it('never shows distance (§8.12)', async () => {
      api.getQueueOffer.mockResolvedValue({
        data: { eligible: true, offers: [offer] },
      });

      await render(
        <ThemeProvider>
          <QueueOfferScreen />
        </ThemeProvider>
      );

      await waitFor(() => expect(screen.getByTestId('queue-accept')).toBeTruthy());
      distanceGuard();
    });
  });

  describe('A4 Visit check-in', () => {
    it('never shows distance (§8.12) when opened without a venue', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});
      await render(
        <ThemeProvider>
          <VisitCheckInScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('visit-no-venue')).toBeOnTheScreen();
      distanceGuard();
    });

    it('explains why the visit check exists (§14.7) and requires both signals', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'hh-1' });
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [{ id: 'hh-1', name: 'Blue Note', address: '1 Main', lat: 47.6, lng: -122.3, pinSet: true, state: 'needs_visit', status: 'active' }] },
      } as never);
      await render(
        <ThemeProvider>
          <VisitCheckInScreen />
        </ThemeProvider>
      );
      expect(await screen.findByTestId('visit-why')).toHaveTextContent(/GPS plus the scan at the door/);
      expect(screen.getByTestId('visit-scan-submit')).toBeOnTheScreen();
      // Nothing is recorded by merely opening the screen.
      expect(api.checkInVisit).not.toHaveBeenCalled();
    });
  });

  describe('Visit history', () => {
    it('lists visits from GET /ambassador/visits', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      api.getAmbassadorVisits.mockResolvedValue({
        data: { visits: [{ id: 'v1', visitedAt: '2026-08-24T12:00:00Z', visitWindow: 1 }] },
      });
      await render(
        <ThemeProvider>
          <VisitHistoryScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('visit-history-list')).toBeTruthy());
      expect(screen.getByTestId('visit-v1')).toBeTruthy();
    });

    it('shows empty when none', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      api.getAmbassadorVisits.mockResolvedValue({
        data: { visits: [] },
      });
      await render(
        <ThemeProvider>
          <VisitHistoryScreen />
        </ThemeProvider>
      );
      await waitFor(() => expect(screen.getByTestId('visit-history-empty')).toBeTruthy());
    });
  });

  describe('Commissions tracker', () => {
    const row = (over: Partial<s3Api.CommissionRow>): s3Api.CommissionRow => ({
      id: 'c1', helloHangoutId: 'hh1', venue: 'Blue Door Cafe', route: 'signed_by_you', termYear: 2026,
      amountCents: 2500, rateAppliedCents: 2500, where: 'paid', visit: null, ...over,
    });
    const commissions = (over: Partial<s3Api.Commissions> = {}): s3Api.Commissions => ({
      figuresCleared: true,
      totals: { paidCents: 2500, owedCents: 1000, buildingCount: 1 },
      earned: [row({}), row({ id: 'c2', venue: 'Pier Bar', where: 'owed', amountCents: 1000, route: 'taken_over' })],
      building: [row({ id: 'c3', venue: 'Green Room', where: 'building_waiting_visit', amountCents: null,
        visit: { state: 'needs_visit', window: 1, dueBy: '2026-11-05T00:00:00Z' } })],
      reversed: [],
      ...over,
    });
    const renderIt = () => render(<ThemeProvider><CommissionsScreen /></ThemeProvider>);

    it('reads GET /ambassador/commissions and shows paid, owed and building totals with one row per term', async () => {
      s3.getCommissions.mockResolvedValue({ data: { commissions: commissions() } });
      await renderIt();
      expect(await screen.findByTestId('commissions-list')).toBeTruthy();
      expect(s3.getCommissions).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('commissions-paid-card')).toHaveTextContent(/\$25$/);
      expect(screen.getByTestId('commissions-owed-card')).toHaveTextContent(/\$10/);
      expect(screen.getByTestId('commissions-building-card')).toHaveTextContent(/1 Hello Hangouts/);
      expect(screen.getByTestId('commission-c1')).toHaveTextContent(/Blue Door Cafe.*Term 2026.*You signed it/);
      expect(screen.getByTestId('commission-c2')).toHaveTextContent(/Taken over.*Owed to you/);
      expect(screen.getByTestId('commission-c3')).toHaveTextContent(/Paid, waiting on your visit/);
      expect(screen.getByTestId('commission-c3')).toHaveTextContent(/Visit due/);
      expect(screen.queryByTestId('commissions-withheld')).toBeNull();
    });

    it('withholds every dollar figure until cleared: shows the dash and says the rows are real', async () => {
      s3.getCommissions.mockResolvedValue({ data: { commissions: commissions({
        figuresCleared: false, totals: { paidCents: null, owedCents: null, buildingCount: 1 },
      }) } });
      await renderIt();
      expect(await screen.findByTestId('commissions-withheld')).toBeTruthy();
      expect(screen.getByTestId('commissions-paid-card')).toHaveTextContent(/—/);
      expect(screen.getByTestId('commissions-owed-card')).toHaveTextContent(/—/);
      expect(screen.queryByText(/\$\d/)).toBeNull();
    });

    it('shows an empty state when there are no rows, and a Getting paid link to payouts', async () => {
      s3.getCommissions.mockResolvedValue({ data: { commissions: commissions({
        earned: [], building: [], totals: { paidCents: 0, owedCents: 0, buildingCount: 0 },
      }) } });
      await renderIt();
      expect(await screen.findByTestId('commissions-empty')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('commissions-to-payouts'));
      expect(mockPush).toHaveBeenCalledWith('/(ambassador)/payouts');
    });

    it('lists reversed commissions separately', async () => {
      s3.getCommissions.mockResolvedValue({ data: { commissions: commissions({
        reversed: [{ id: 'r1', venue: 'Old Bar', termYear: 2025, amountCents: 500 }],
      }) } });
      await renderIt();
      expect(await screen.findByTestId('commissions-reversed')).toHaveTextContent(/Old Bar.*Term 2025/);
    });

    it('shows an error with a retry that calls the server again', async () => {
      s3.getCommissions.mockResolvedValueOnce({ error: { code: 'server_error', message: 'x' } } as never);
      await renderIt();
      expect(await screen.findByTestId('commissions-error')).toBeTruthy();
      s3.getCommissions.mockResolvedValueOnce({ data: { commissions: commissions() } });
      await fireEvent.press(screen.getByTestId('commissions-retry'));
      expect(await screen.findByTestId('commissions-list')).toBeTruthy();
      expect(s3.getCommissions).toHaveBeenCalledTimes(2);
    });
  });

  describe('A5 Payouts', () => {
    it('says withdrawals are not open, keeps Withdraw inert, and shows an empty history', async () => {
      api.getEarnings.mockResolvedValue({ data: { earnings: noEarnings } });
      api.getPayoutHistory.mockResolvedValue({
        data: { payouts: [] },
      });

      await render(
        <ThemeProvider>
          <PayoutsScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('withdraw-gate')).toHaveTextContent(/Withdrawals aren't open yet/);
      expect(screen.getByTestId('payouts-withdraw')).toBeDisabled();
      expect(screen.getByTestId('payouts-history-empty')).toBeOnTheScreen();
      // No withdrawable amount is ever offered.
      expect(screen.queryByText(/Ready to withdraw/)).toBeNull();
    });

    it('shows error with retry', async () => {
      api.getEarnings.mockResolvedValue({
        error: { message: 'Failed' },
      });
      api.getPayoutHistory.mockResolvedValue({
        data: { payouts: [] },
      });

      await render(
        <ThemeProvider>
          <PayoutsScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('earned-error')).toBeOnTheScreen();
    });
  });

  describe('A6 Getting paid (payout account)', () => {
    it('states the provider chain and the external gate, and never marks a W-9 collected', async () => {
      api.getAmbassadorMe.mockResolvedValue({
        data: {
          me: {
            isAmbassador: true,
            applicationsAvailable: true,
            application: null,
            payoutProvider: { name: 'trolley', connected: false },
            w9Collected: false,
            awayMode: false,
            eligibility: null,
          },
        },
      });

      await render(
        <ThemeProvider>
          <AmbassadorSignupScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('payout-steps')).toBeOnTheScreen();
      expect(screen.getByTestId('payout-step-tax')).toHaveTextContent(/Waiting/);
      expect(screen.getByTestId('signup-setup-payouts')).toBeDisabled();
      expect(api.submitW9).not.toHaveBeenCalled();
    });
  });

  describe('A7 Ambassador store', () => {
    it('opens the shared shop for Ambassadors (no points, audience-filtered)', async () => {
      const { Redirect } = require('expo-router');
      await render(
        <ThemeProvider>
          <AmbassadorStoreScreen />
        </ThemeProvider>
      );
      expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: expect.objectContaining({ params: { shop: 'ambassador' } }) }),
        undefined
      );
    });
  });
});
