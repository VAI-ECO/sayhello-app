/**
 * AMBASSADOR FIELD JOURNEY (VERTICAL-BUILD-07) — access, portfolio, at-the-door signup,
 * GPS + live-camera visit, term schedule, Earned and Building.
 *
 * The visit tests pin the canon (§14.5): NO call is made unless a live GPS reading AND a
 * camera-read scan both exist; a typed/absent code or a missing reading records nothing; a
 * repeated camera event sends once; the coordinates sent are the device's, never 0/0.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { takeStorefrontShot } from '../../../src/lib/storefront-shot';
import * as Location from 'expo-location';
import { ThemeProvider } from '../../../src/theme';
import AmbassadorHomeScreen from '../../../app/(ambassador)/index';
import MyHelloHangoutsScreen from '../../../app/(ambassador)/hangouts';
import QueueOfferScreen from '../../../app/(ambassador)/queue-offer';
import VisitCheckInScreen from '../../../app/(ambassador)/visit-check-in';
import VisitHistoryScreen from '../../../app/(ambassador)/visit-history';
import EarnedBuildingScreen from '../../../app/(ambassador)/earned-building';
import FindBusinessScreen from '../../../app/(ambassador)/find-business';
import ConfirmDetailsScreen from '../../../app/(ambassador)/confirm-details';
import PhotoPlaceScreen from '../../../app/(ambassador)/photo';
import CounterScreen from '../../../app/(ambassador)/counter';
import * as ambassadorApi from '../../../src/api/ambassador';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
  Redirect: jest.fn(() => null),
}));

let mockWindowWidth = 375;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWindowWidth, height: 900, scale: 1, fontScale: 1 }),
}));

let mockCameraProps: Record<string, any> | null = null;
let mockCameraPermission: { granted: boolean; canAskAgain: boolean } = { granted: true, canAskAgain: true };
const mockRequestCameraPermission = jest.fn();
const mockTakePicture = jest.fn();
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useCameraPermissions: () => [mockCameraPermission, mockRequestCameraPermission],
    CameraView: React.forwardRef((props: Record<string, any>, ref: unknown) => {
      mockCameraProps = props;
      React.useImperativeHandle(ref, () => ({ takePictureAsync: mockTakePicture }));
      return React.createElement(View, { testID: props.testID });
    }),
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
    getAmbassadorMe: jest.fn(),
    applyAsAmbassador: jest.fn(),
    getAmbassadorHangouts: jest.fn(),
    getAmbassadorVisits: jest.fn(),
    getEarnings: jest.fn(),
    getPayoutHistory: jest.fn(),
    getQueueOffer: jest.fn(),
    respondToQueueOffer: jest.fn(),
    setAwayMode: jest.fn(),
    checkInVisit: jest.fn(),
    installStand: jest.fn(),
    deferCoupon: jest.fn(),
    lookupBusinesses: jest.fn(),
    getSignupPricing: jest.fn(),
    signBusiness: jest.fn(),
  };
});
jest.mock('../../../src/api/client', () => ({ api: { init: jest.fn() } }));

const api = ambassadorApi as jest.Mocked<typeof ambassadorApi>;
const loc = Location as jest.Mocked<typeof Location>;

const VENUE = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

const me = (over: Record<string, unknown> = {}) => ({
  isAmbassador: false,
  applicationsAvailable: true,
  application: null,
  payoutProvider: { name: 'trolley', connected: false },
  w9Collected: false,
  awayMode: false,
  eligibility: null,
  ...over,
});

const hangout = (over: Record<string, unknown> = {}) => ({
  id: VENUE,
  name: 'Rainier Coffee',
  address: '88 Pine St',
  lat: 47.6001,
  lng: -122.3001,
  pinSet: true,
  status: 'active',
  founding: false,
  tier: 'regular',
  youService: true,
  youOriginated: true,
  originatedAt: '2026-01-05T00:00:00Z',
  paidAt: '2026-02-01T00:00:00Z',
  renewsAt: '2027-02-01T00:00:00Z',
  state: 'needs_visit',
  window: 1,
  dueBy: '2026-12-01',
  term: null,
  lastVisitAt: null,
  verifiedVisits: 0,
  ...over,
});

const earnings = (over: Record<string, unknown> = {}) => ({
  earned: [],
  building: [],
  reversed: [],
  figuresCleared: false,
  withdrawals: { open: false, reason: 'payout_provider_not_connected', settlementHoldSet: false, fulfilmentWindowSet: false },
  ...over,
});

const checkInResult = (over: Record<string, unknown> = {}) => ({
  visit: { id: 'v1', visitedAt: '2026-09-29T10:00:00Z', visitWindow: 1, qrScanVerified: true },
  kind: 'service',
  venue: { id: VENUE, name: 'Rainier Coffee' },
  proof: 'printed_code',
  gps: { distanceM: 14, accuracyM: 12, pinSet: true, mocked: false },
  windowCounted: 1,
  becameServicer: false,
  ...over,
});

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

async function emitScan(data: string, type = 'qr') {
  await act(async () => {
    mockCameraProps!.onBarcodeScanned({ type, data });
  });
}

describe('Ambassador field journey', () => {
  let push: jest.Mock;
  let replace: jest.Mock;
  let back: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    mockCameraProps = null;
    mockCameraPermission = { granted: true, canAskAgain: true };
    push = jest.fn();
    replace = jest.fn();
    back = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push, replace, back });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    loc.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true, status: 'granted', expires: 'never' } as never);
    loc.hasServicesEnabledAsync.mockResolvedValue(true);
    loc.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 47.6, longitude: -122.3, accuracy: 12 }, mocked: false } as never);
  });

  // ── Access and onboarding ───────────────────────────────────────────────────
  describe('access (the role is added by review, ROLE-3 §2)', () => {
    it('shows the application to someone who is not an Ambassador and sends it trimmed', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me() } });
      api.applyAsAmbassador.mockResolvedValue({ data: { application: { id: 'a1', status: 'submitted', createdAt: '2026-09-29' } } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-application')).toBeOnTheScreen();
      expect(screen.getByText('Applications are reviewed. Territories are limited.')).toBeOnTheScreen();

      await fireEvent.changeText(screen.getByTestId('ambassador-apply-fullName'), '  Ray Ortiz ');
      await fireEvent.changeText(screen.getByTestId('ambassador-apply-workArea'), 'Capitol Hill');
      await fireEvent.changeText(screen.getByTestId('ambassador-apply-phone'), '206 555 0148');
      await fireEvent.changeText(screen.getByTestId('ambassador-apply-startingPlaces'), 'Rainier Coffee, Foxhole, Wall of Sound');
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ application: { id: 'a1', status: 'submitted', createdAt: '2026-09-29' } }) } });
      await fireEvent.press(screen.getByTestId('ambassador-apply-submit'));

      expect(api.applyAsAmbassador).toHaveBeenCalledWith({
        fullName: 'Ray Ortiz',
        workArea: 'Capitol Hill',
        phone: '206 555 0148',
        startingPlaces: 'Rainier Coffee, Foxhole, Wall of Sound',
      });
      // After the send the page reloads from the server and shows "with the reviewers".
      expect(await screen.findByTestId('ambassador-application-open')).toBeOnTheScreen();
      expect(screen.queryByTestId('ambassador-apply-submit')).not.toBeOnTheScreen();
    });

    it('carries the Creator code from the sign-up link (?ref) on the application — attribution only', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ ref: 'NiaB' });
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me() } });
      api.applyAsAmbassador.mockResolvedValue({ data: { application: { id: 'a1', status: 'submitted', createdAt: 'x' } } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-application-channel')).toHaveTextContent('You came through a Creator link.');
      for (const [key, value] of [['fullName', 'Ray'], ['workArea', 'CH'], ['phone', '1'], ['startingPlaces', 'a']]) {
        await fireEvent.changeText(screen.getByTestId(`ambassador-apply-${key}`), value);
      }
      await fireEvent.press(screen.getByTestId('ambassador-apply-submit'));
      expect(api.applyAsAmbassador).toHaveBeenCalledWith({ fullName: 'Ray', workArea: 'CH', phone: '1', startingPlaces: 'a', referredByCode: 'NiaB' });
    });

    it('ignores a malformed ?ref rather than sending it', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ ref: 'no spaces!' });
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me() } });
      await wrap(<AmbassadorHomeScreen />);
      await screen.findByTestId('ambassador-application');
      expect(screen.queryByTestId('ambassador-application-channel')).not.toBeOnTheScreen();
    });

    it('refuses an incomplete application without calling the server', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me() } });
      await wrap(<AmbassadorHomeScreen />);
      await screen.findByTestId('ambassador-application');
      await fireEvent.changeText(screen.getByTestId('ambassador-apply-fullName'), 'Ray');
      await fireEvent.press(screen.getByTestId('ambassador-apply-submit'));
      expect(await screen.findByTestId('ambassador-apply-message')).toHaveTextContent('Fill in every field.');
      expect(api.applyAsAmbassador).not.toHaveBeenCalled();
    });

    it('does not show the form while an application is open', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ application: { id: 'a1', status: 'submitted', createdAt: '2026-09-29' } }) } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-application-open')).toBeOnTheScreen();
      expect(screen.queryByTestId('ambassador-apply-submit')).not.toBeOnTheScreen();
    });

    it('says so plainly when applications are not set up on the server', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ applicationsAvailable: false }) } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-application-unavailable')).toHaveTextContent(/not open on this server yet/);
    });

    it('has an error state with retry', async () => {
      api.getAmbassadorMe.mockResolvedValueOnce({ error: { message: 'down' } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-error')).toBeOnTheScreen();
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me() } });
      await fireEvent.press(screen.getByTestId('ambassador-retry'));
      expect(await screen.findByTestId('ambassador-application')).toBeOnTheScreen();
    });
  });

  // ── Overview ────────────────────────────────────────────────────────────────
  describe('Overview (SN-10)', () => {
    beforeEach(() => {
      api.getEarnings.mockResolvedValue({ data: { earnings: earnings() } });
    });

    it('shows the book, Earned and Building side by side, and what needs a visit', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ isAmbassador: true, eligibility: { eligible: true, reason: null, gateMonths: 6, behind: [] } }) } });
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [hangout(), hangout({ id: OTHER, name: 'Foxhole', state: 'complete' }), hangout({ id: 'c', name: 'Wall of Sound', state: 'overdue', dueBy: '2026-06-01' })] },
      } as never);
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-overview')).toBeOnTheScreen();
      expect(screen.getByTestId('ambassador-stats')).toHaveTextContent(/3/);
      expect(screen.getByTestId(`ambassador-owed-${VENUE}`)).toHaveTextContent(/Rainier Coffee · visit owed/);
      expect(screen.getByTestId('ambassador-owed-c')).toHaveTextContent(/Wall of Sound · visit overdue/);
      // Both halves, together, in one row; Building is the provisional one.
      expect(screen.getByTestId('earned-building-pair')).toBeOnTheScreen();
      expect(screen.getByTestId('earned-card')).toBeOnTheScreen();
      expect(screen.getByTestId('building-card')).toHaveTextContent(/Provisional/);
    });

    it('tells an Ambassador who is behind which venue, plainly (§16.20)', async () => {
      api.getAmbassadorMe.mockResolvedValue({
        data: { me: me({ isAmbassador: true, eligibility: { eligible: false, reason: 'visit_overdue', gateMonths: 6, behind: [{ id: OTHER, name: 'Foxhole' }] } }) },
      });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [hangout()] } } as never);
      await wrap(<AmbassadorHomeScreen />);
      const card = await screen.findByTestId('ambassador-behind');
      expect(card).toHaveTextContent(/behind on a visit/);
      expect(card).toHaveTextContent(/Foxhole/);
    });

    it('explains the empty book: a new Ambassador has no radius (§16.15)', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ isAmbassador: true, eligibility: { eligible: false, reason: 'no_signed_hangouts', gateMonths: 6, behind: [] } }) } });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-book-empty')).toHaveTextContent(/has no radius/);
      await fireEvent.press(screen.getByTestId('ambassador-sign'));
      expect(push).toHaveBeenCalledWith('/(ambassador)/find-business');
    });

    it('toggles Away mode on the server and reflects the answer', async () => {
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ isAmbassador: true }) } });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      api.setAwayMode.mockResolvedValue({ data: { awayMode: true, message: '' } });
      await wrap(<AmbassadorHomeScreen />);
      const toggle = await screen.findByTestId('ambassador-away');
      await fireEvent(toggle, 'valueChange', true);
      expect(api.setAwayMode).toHaveBeenCalledWith(true);
    });

    it('lays out the rail at desktop width and lists only built destinations', async () => {
      mockWindowWidth = 1440;
      api.getAmbassadorMe.mockResolvedValue({ data: { me: me({ isAmbassador: true }) } });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      await wrap(<AmbassadorHomeScreen />);
      expect(await screen.findByTestId('ambassador-rail')).toBeOnTheScreen();
      expect(screen.getByTestId('ambassador-rail-overview')).toBeSelected();
      await fireEvent.press(screen.getByTestId('ambassador-rail-hangouts'));
      expect(push).toHaveBeenCalledWith('/(ambassador)/hangouts');
      // Unbuilt destinations are absent rather than dead links.
      expect(screen.queryByText('Toolkit')).not.toBeOnTheScreen();
      expect(screen.queryByText('Codes and stands')).not.toBeOnTheScreen();
    });
  });

  // ── Portfolio ───────────────────────────────────────────────────────────────
  describe('My Hello Hangouts (SN-11 / SN-12)', () => {
    it('shows state, visits, renewal and origination, and opens a visit for THAT venue', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [hangout({ term: { starts: '2026-02-01', ends: '2027-01-31', window1: { starts: '2026-02-01', ends: '2026-07-31', visited: true }, window2: { starts: '2026-08-01', ends: '2027-01-31', visited: false } } })] },
      } as never);
      await wrap(<MyHelloHangoutsScreen />);
      expect(await screen.findByTestId(`hangout-${VENUE}`)).toBeOnTheScreen();
      expect(screen.getByTestId(`hangout-state-${VENUE}`)).toHaveTextContent('Visit owed');
      expect(screen.getByText(/1 of 2/)).toBeOnTheScreen();
      expect(screen.getByText(/Signed /)).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId(`hangout-checkin-${VENUE}`));
      expect(push).toHaveBeenCalledWith({ pathname: '/(ambassador)/visit-check-in', params: { helloHangoutId: VENUE } });
    });

    it('says an unpaid Hello Hangout has nothing to claim yet', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [hangout({ status: 'pending_payment', state: 'awaiting_payment', paidAt: null, renewsAt: null })] } } as never);
      await wrap(<MyHelloHangoutsScreen />);
      expect(await screen.findByText('Nothing to claim until they pay.')).toBeOnTheScreen();
      expect(screen.getByTestId(`hangout-state-${VENUE}`)).toHaveTextContent('Awaiting payment');
    });

    it('offers the deferred coupon only on a Founding signup this Ambassador originated, and shows the server\'s reason', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: { hangouts: [hangout({ status: 'pending_payment', state: 'awaiting_payment', tier: 'founding', founding: true }), hangout({ id: OTHER, name: 'Foxhole', status: 'pending_payment', state: 'awaiting_payment', tier: 'regular' })] },
      } as never);
      api.deferCoupon.mockResolvedValue({ error: { code: 'second_visit_required', message: 'x', status: 409 } });
      await wrap(<MyHelloHangoutsScreen />);
      await screen.findByTestId(`hangout-${VENUE}`);
      expect(screen.queryByTestId(`hangout-defer-${OTHER}`)).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId(`hangout-defer-${VENUE}`));
      expect(api.deferCoupon).toHaveBeenCalledWith(VENUE);
      expect(await screen.findByTestId(`hangout-notice-${VENUE}`)).toHaveTextContent(/two verified visits/);
    });

    it('lays out the delivered table at tablet width', async () => {
      mockWindowWidth = 834;
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [hangout()] } } as never);
      await wrap(<MyHelloHangoutsScreen />);
      expect(await screen.findByTestId('hangouts-table-head')).toHaveTextContent(/Hello HangoutVisitsRenewsState/);
    });

    it('has a real empty state (SN-12), an error state and retry', async () => {
      api.getAmbassadorHangouts.mockResolvedValueOnce({ error: { message: 'down' } });
      await wrap(<MyHelloHangoutsScreen />);
      expect(await screen.findByTestId('hangouts-error')).toBeOnTheScreen();
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      await fireEvent.press(screen.getByTestId('hangouts-retry'));
      expect(await screen.findByTestId('hangouts-empty')).toHaveTextContent(/Nothing in your book yet/);
      await fireEvent.press(screen.getByTestId('hangouts-sign'));
      expect(push).toHaveBeenCalledWith('/(ambassador)/find-business');
    });
  });

  // ── Visit check-in ──────────────────────────────────────────────────────────
  describe('Visit check-in — GPS + live-camera scan (§14.5)', () => {
    const openVisit = async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: VENUE });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [hangout(), hangout({ id: OTHER, name: 'Foxhole', address: '9 Cherry St' })] } } as never);
      await wrap(<VisitCheckInScreen />);
      await screen.findByTestId('visit-scan-submit');
    };

    it('records a visit only from a real reading plus a camera-read scan, sending the device coordinates', async () => {
      api.checkInVisit.mockResolvedValue({ data: checkInResult() } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      expect(await screen.findByTestId('visit-camera')).toBeOnTheScreen();
      expect(api.checkInVisit).not.toHaveBeenCalled();

      await emitScan('SAYHELLO-HH:11111111:sig');

      expect(api.checkInVisit).toHaveBeenCalledTimes(1);
      const sent = api.checkInVisit.mock.calls[0][0];
      expect(sent).toMatchObject({ helloHangoutId: VENUE, scan: 'SAYHELLO-HH:11111111:sig', lat: 47.6, lng: -122.3, accuracyM: 12, mocked: false });
      expect(sent.lat).not.toBe(0);
      const done = await screen.findByTestId('visit-done');
      expect(done).toHaveTextContent(/Rainier Coffee/);
      expect(screen.getByTestId('visit-done-gps')).toHaveTextContent('14 m from the pin, accurate to about 12 m.');
    });

    it('does not open the camera or send anything when location is off — and says why', async () => {
      loc.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      expect(await screen.findByTestId('visit-gps-problem')).toHaveTextContent(/A visit needs it/);
      expect(screen.queryByTestId('visit-camera')).not.toBeOnTheScreen();
      expect(mockRequestCameraPermission).not.toHaveBeenCalled();
      expect(api.checkInVisit).not.toHaveBeenCalled();
    });

    it('points to Settings when location is blocked for good', async () => {
      loc.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false, status: 'denied' } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      expect(await screen.findByTestId('visit-open-settings')).toBeOnTheScreen();
      expect(api.checkInVisit).not.toHaveBeenCalled();
    });

    it('says so when the camera is refused, and records nothing', async () => {
      mockCameraPermission = { granted: false, canAskAgain: true };
      mockRequestCameraPermission.mockResolvedValue({ granted: false, canAskAgain: true });
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      expect(await screen.findByTestId('visit-checkin-error')).toHaveTextContent(/proved with a live scan/);
      expect(screen.queryByTestId('visit-camera')).not.toBeOnTheScreen();
      expect(api.checkInVisit).not.toHaveBeenCalled();
    });

    it('sends a repeated camera event once', async () => {
      let release: (v: unknown) => void = () => undefined;
      api.checkInVisit.mockReturnValue(new Promise((r) => { release = r; }) as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('CODE');
      await emitScan('CODE');
      await emitScan('CODE');
      expect(api.checkInVisit).toHaveBeenCalledTimes(1);
      await act(async () => { release({ data: checkInResult() }); });
      expect(await screen.findByTestId('visit-done')).toBeOnTheScreen();
    });

    it('ignores anything that is not a QR code', async () => {
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('1234567890', 'ean13');
      expect(api.checkInVisit).not.toHaveBeenCalled();
    });

    it('shows the wrong-venue screen, records nothing, and switching resends the same scan for that venue', async () => {
      api.checkInVisit.mockResolvedValueOnce({ error: { code: 'wrong_venue', status: 409, message: 'x', body: { other: { id: OTHER, name: 'Foxhole' } } } });
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('STAND-OF-FOXHOLE');

      const wrong = await screen.findByTestId('visit-wrong-venue');
      expect(wrong).toHaveTextContent(/That stand belongs to Foxhole\./);
      expect(screen.getByText('Nothing was recorded. Nothing was lost.')).toBeOnTheScreen();
      expect(screen.queryByTestId('visit-done')).not.toBeOnTheScreen();

      api.checkInVisit.mockResolvedValueOnce({ data: checkInResult({ venue: { id: OTHER, name: 'Foxhole' } }) } as never);
      await fireEvent.press(screen.getByTestId('visit-switch'));
      expect(api.checkInVisit).toHaveBeenCalledTimes(2);
      expect(api.checkInVisit.mock.calls[1][0]).toMatchObject({ helloHangoutId: OTHER, scan: 'STAND-OF-FOXHOLE' });
      expect(await screen.findByTestId('visit-done')).toHaveTextContent(/Foxhole/);
    });

    it('does not name a venue that is not in the Ambassador\'s book, and "scan again" goes back to idle', async () => {
      api.checkInVisit.mockResolvedValueOnce({ error: { code: 'wrong_venue', status: 409, message: 'x', body: { other: null } } });
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('SOMEONE-ELSES');
      const wrong = await screen.findByTestId('visit-wrong-venue');
      expect(wrong).toHaveTextContent(/belongs to a different Hello Hangout/);
      expect(screen.queryByTestId('visit-switch')).not.toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('visit-scan-again'));
      expect(await screen.findByTestId('visit-scan-submit')).toBeOnTheScreen();
    });

    it('reports a code that is not a Say Hello venue code and records nothing', async () => {
      api.checkInVisit.mockResolvedValue({ error: { code: 'unknown_code', status: 400, message: 'x' } });
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('https://example.com');
      expect(await screen.findByTestId('visit-checkin-error')).toHaveTextContent(/isn't a Say Hello venue code/);
      expect(screen.queryByTestId('visit-done')).not.toBeOnTheScreen();
    });

    it('keeps the scan when the reading fails at the moment of sending, and resubmits it once GPS returns', async () => {
      api.checkInVisit.mockResolvedValue({ data: checkInResult() } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      loc.getCurrentPositionAsync.mockRejectedValueOnce(new Error('no fix'));
      await emitScan('HELD-PAYLOAD');
      expect(await screen.findByTestId('visit-gps-resubmit')).toBeOnTheScreen();
      expect(api.checkInVisit).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByTestId('visit-gps-resubmit'));
      expect(api.checkInVisit).toHaveBeenCalledTimes(1);
      expect(api.checkInVisit.mock.calls[0][0]).toMatchObject({ scan: 'HELD-PAYLOAD', lat: 47.6, lng: -122.3 });
      expect(await screen.findByTestId('visit-done')).toBeOnTheScreen();
    });

    it('passes on the OS mock-location flag when the device reports it', async () => {
      loc.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 47.6, longitude: -122.3, accuracy: 5 }, mocked: true } as never);
      api.checkInVisit.mockResolvedValue({ data: checkInResult({ gps: { distanceM: 14, accuracyM: 5, pinSet: true, mocked: true } }) } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('CODE');
      expect(api.checkInVisit.mock.calls[0][0]).toMatchObject({ mocked: true });
    });

    it('installing a stand is a visit: the stand path calls the install route, not check-in (§14.10)', async () => {
      api.installStand.mockResolvedValue({ data: checkInResult({ proof: 'stand' }) } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-install'));
      await screen.findByTestId('visit-camera');
      await emitScan('STAND-0001');
      expect(api.installStand).toHaveBeenCalledTimes(1);
      expect(api.installStand.mock.calls[0][0]).toMatchObject({ helloHangoutId: VENUE, scan: 'STAND-0001' });
      expect(api.checkInVisit).not.toHaveBeenCalled();
      expect(await screen.findByTestId('visit-done')).toHaveTextContent(/Rainier Coffee/);
    });

    it('says stands are not available yet when the server cannot bind them', async () => {
      api.installStand.mockResolvedValue({ error: { code: 'stands_unavailable', status: 503, message: 'x' } });
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-install'));
      await screen.findByTestId('visit-camera');
      await emitScan('STAND-0001');
      expect(await screen.findByTestId('visit-checkin-error')).toHaveTextContent(/can't be attached to Hello Hangouts on this server yet/);
    });

    it('marks an origination visit as before payment and a first visit as becoming theirs (§16.8)', async () => {
      api.checkInVisit.mockResolvedValue({ data: checkInResult({ kind: 'origination', windowCounted: null, becameServicer: true }) } as never);
      await openVisit();
      await fireEvent.press(screen.getByTestId('visit-scan-submit'));
      await screen.findByTestId('visit-camera');
      await emitScan('CODE');
      const done = await screen.findByTestId('visit-done');
      expect(done).toHaveTextContent(/has not paid yet/);
      expect(screen.getByTestId('visit-became-servicer')).toBeOnTheScreen();
    });

    it('will not check in to a venue that is not in the book', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ helloHangoutId: 'not-mine' });
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [hangout()] } } as never);
      await wrap(<VisitCheckInScreen />);
      expect(await screen.findByTestId('visit-no-venue')).toHaveTextContent(/isn't in your book/);
      expect(screen.queryByTestId('visit-scan-submit')).not.toBeOnTheScreen();
    });
  });

  // ── History and term schedule ───────────────────────────────────────────────
  describe('Visit history and term schedule', () => {
    it('shows each venue\'s two windows and the verified visits', async () => {
      api.getAmbassadorHangouts.mockResolvedValue({
        data: {
          hangouts: [
            hangout({ term: { starts: '2026-02-01', ends: '2027-01-31', window1: { starts: '2026-02-01', ends: '2026-07-31', visited: true }, window2: { starts: '2026-08-01', ends: '2027-01-31', visited: false } } }),
            hangout({ id: OTHER, name: 'Foxhole', status: 'pending_payment', state: 'awaiting_payment', term: null }),
          ],
        },
      } as never);
      api.getAmbassadorVisits.mockResolvedValue({
        data: { visits: [{ id: 'v1', helloHangoutId: VENUE, visitedAt: '2026-03-01T12:00:00Z', visitWindow: 1, venue: 'Rainier Coffee', address: '88 Pine St', qrStandSerial: null }] },
      } as never);
      await wrap(<VisitHistoryScreen />);
      expect(await screen.findByTestId(`term-${VENUE}-windowOne`)).toHaveTextContent('Visited');
      expect(screen.getByTestId(`term-${VENUE}`)).toBeOnTheScreen();
      expect(screen.getByTestId(`term-${OTHER}`)).toHaveTextContent(/term starts when they pay/);
      expect(screen.getByTestId('visit-v1')).toHaveTextContent(/Rainier Coffee/);
      expect(screen.getByTestId('visit-v1')).toHaveTextContent(/Window 1/);
    });

    it('has an error state with retry', async () => {
      api.getAmbassadorHangouts.mockResolvedValueOnce({ error: { message: 'down' } });
      api.getAmbassadorVisits.mockResolvedValue({ data: { visits: [] } });
      await wrap(<VisitHistoryScreen />);
      expect(await screen.findByTestId('visit-history-error')).toBeOnTheScreen();
      api.getAmbassadorHangouts.mockResolvedValue({ data: { hangouts: [] } });
      await fireEvent.press(screen.getByTestId('visit-history-retry'));
      expect(await screen.findByTestId('visit-history-empty')).toBeOnTheScreen();
    });
  });

  // ── Earned and Building ─────────────────────────────────────────────────────
  describe('Earned and Building (A5)', () => {
    const row = (over: Record<string, unknown>) => ({
      id: 'p1', helloHangoutId: VENUE, venue: 'Rainier Coffee', reason: null, rateAppliedCents: null, rateRule: null,
      amountCents: null, payoutStatus: 'pending', state: 'earned', createdAt: '2026-09-01T00:00:00Z', ...over,
    });

    it('separates earned, building (waiting on payment / on a visit) and reversed, with no total', async () => {
      api.getEarnings.mockResolvedValue({
        data: {
          earnings: earnings({
            earned: [row({ id: 'e1', venue: 'Stone Gardens' })],
            building: [
              { helloHangoutId: OTHER, venue: 'Foxhole', state: 'building_waiting_payment', signedAt: '2026-09-02T00:00:00Z' },
              row({ id: 'b1', venue: 'Wall of Sound', state: 'building_waiting_visit' }),
            ],
            reversed: [row({ id: 'r1', venue: 'The Sunlight', state: 'reversed' })],
          }),
        },
      });
      await wrap(<EarnedBuildingScreen />);
      expect(await screen.findByTestId('ledger-earned-e1')).toHaveTextContent(/Stone Gardens/);
      expect(screen.getByTestId(`ledger-building-unpaid-${OTHER}`)).toHaveTextContent(/Signed, waiting on payment/);
      expect(screen.getByTestId('ledger-building-b1')).toHaveTextContent(/Paid, waiting on a visit/);
      expect(screen.getByTestId('ledger-reversed-r1')).toHaveTextContent(/Reversed/);
      expect(screen.queryByText(/\$\d/)).not.toBeOnTheScreen();
      expect(screen.getByTestId('withdraw-gate')).toHaveTextContent(/payout account isn't connected/);
      expect(screen.getByTestId('payouts-withdraw')).toBeDisabled();
    });

    it('shows a row\'s amount only when the server sent one (MA-05 cleared)', async () => {
      api.getEarnings.mockResolvedValue({ data: { earnings: earnings({ figuresCleared: true, earned: [row({ id: 'e1', amountCents: 10000 })] }) } });
      await wrap(<EarnedBuildingScreen />);
      expect(await screen.findByTestId('ledger-earned-e1')).toHaveTextContent(/\$100/);
    });
  });

  // ── Queue ───────────────────────────────────────────────────────────────────
  describe('Queue offers', () => {
    it('shows a Hello Hangout offer with what the canon says the Ambassador is told (§16.10)', async () => {
      api.getQueueOffer.mockResolvedValue({
        data: {
          eligible: true,
          offers: [],
          helloOffers: [{
            id: 'o1', helloHangoutId: OTHER, status: 'pending', offeredAt: '2026-09-29T00:00:00Z', expiresAt: new Date(Date.now() + 600000).toISOString(),
            whyAvailable: 'The previous Ambassador left.', lastVisitAt: '2026-03-01T00:00:00Z', lastCustomerScanAt: null, renewalDate: '2027-02-01',
            helloHangout: { id: OTHER, name: 'Foxhole', address: '9 Cherry St', lat: 0, lng: 0 },
          }],
        },
      });
      api.respondToQueueOffer.mockResolvedValue({ data: { accepted: true } });
      await wrap(<QueueOfferScreen />);
      expect(await screen.findByTestId('queue-business-name')).toHaveTextContent('FOXHOLE');
      expect(screen.getByTestId('queue-why')).toHaveTextContent(/previous Ambassador left/);
      await fireEvent.press(screen.getByTestId('queue-accept'));
      expect(api.respondToQueueOffer).toHaveBeenCalledWith('o1', 'accept');
    });

    it('says a new Ambassador with no signed Hello Hangouts gets no offers, and points to signing one', async () => {
      api.getQueueOffer.mockResolvedValue({ data: { eligible: false, reason: 'no_signed_hangouts', offers: [] } });
      await wrap(<QueueOfferScreen />);
      expect(await screen.findByTestId('queue-ineligible')).toHaveTextContent(/no radius and receives no offers/);
    });

    it('names the venues an Ambassador is behind on', async () => {
      api.getQueueOffer.mockResolvedValue({ data: { eligible: false, reason: 'visit_overdue', behind: [{ id: OTHER, name: 'Foxhole' }], offers: [] } });
      await wrap(<QueueOfferScreen />);
      expect(await screen.findByTestId('queue-behind-list')).toHaveTextContent(/Foxhole/);
    });

    it('shows an accept failure inline instead of navigating away', async () => {
      api.getQueueOffer.mockResolvedValue({ data: { eligible: true, offers: [{ id: 'o', hangoutId: 'h', status: 'pending', offeredAt: 'x', expiresAt: new Date(Date.now() + 60000).toISOString(), hangouts: { id: 'h', businessName: 'Blue Note' } }] } });
      api.respondToQueueOffer.mockResolvedValue({ error: { message: 'That offer has expired.' } });
      await wrap(<QueueOfferScreen />);
      await fireEvent.press(await screen.findByTestId('queue-accept'));
      expect(await screen.findByTestId('queue-action-error')).toHaveTextContent('That offer has expired.');
      expect(replace).not.toHaveBeenCalled();
    });
  });

  // ── Sign a business: A8 → A9 → A10 → the counter ────────────────────────────
  describe('Sign a business at the door', () => {
    it('A8: searches what is already listed, states "Already signed", shows real distance, and adds an unlisted place', async () => {
      api.lookupBusinesses.mockResolvedValue({ data: { matches: [{ id: OTHER, name: 'Rainier Bar & Grill', address: '214 4th Ave', lat: 47.6005, lng: -122.3, pinSet: true, inBook: false }] } });
      await wrap(<FindBusinessScreen />);
      await fireEvent.changeText(screen.getByTestId('find-business-search'), 'rainier');
      const results = await screen.findByTestId('find-business-results');
      expect(api.lookupBusinesses).toHaveBeenCalledWith('rainier');
      expect(results).toHaveTextContent(/Rainier Bar & Grill/);
      expect(results).toHaveTextContent(/Already signed/);
      expect(results).toHaveTextContent(/\d+ m/);

      await fireEvent.press(screen.getByTestId('find-business-add'));
      await fireEvent.press(screen.getByTestId('find-business-next'));
      expect(await screen.findByText('Name and address are both needed.')).toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('find-business-address'), '88 Pine St, Seattle WA');
      await fireEvent.press(screen.getByTestId('find-business-next'));
      expect(push).toHaveBeenCalledWith({ pathname: '/(ambassador)/confirm-details', params: { name: 'rainier', address: '88 Pine St, Seattle WA' } });
    });

    it('A8: still searches and adds when location is unavailable (distances are the only loss)', async () => {
      loc.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' } as never);
      api.lookupBusinesses.mockResolvedValue({ data: { matches: [] } });
      await wrap(<FindBusinessScreen />);
      expect(await screen.findByTestId('find-business-no-location')).toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('find-business-search'), 'zzz');
      expect(await screen.findByTestId('find-business-no-matches')).toBeOnTheScreen();
    });

    it('A9: sets the pin from the device reading, refuses a duplicate address, and passes real coordinates on', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ name: 'Rainier Coffee', address: '88 Pine St' });
      api.lookupBusinesses.mockResolvedValueOnce({ data: { matches: [{ id: OTHER, name: 'Rainier Coffee', address: '88 Pine St.', lat: 1, lng: 1, pinSet: true, inBook: false }] } });
      await wrap(<ConfirmDetailsScreen />);
      expect(await screen.findByTestId('confirm-pin-ready')).toHaveTextContent(/Pin set at your location/);
      await fireEvent.press(screen.getByTestId('confirm-looks-right'));
      expect(await screen.findByTestId('confirm-message')).toHaveTextContent(/already listed at this address/);
      expect(push).not.toHaveBeenCalled();

      api.lookupBusinesses.mockResolvedValue({ data: { matches: [] } });
      await fireEvent.changeText(screen.getByTestId('confirm-contact-name'), 'Sam');
      await fireEvent.press(screen.getByTestId('confirm-looks-right'));
      expect(push).toHaveBeenCalledWith({
        pathname: '/(ambassador)/photo',
        params: { name: 'Rainier Coffee', address: '88 Pine St', lat: '47.6', lng: '-122.3', contactName: 'Sam', contactPhone: '' },
      });
    });

    it('A9: cannot continue without a real location — never a default pin', async () => {
      loc.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' } as never);
      (useLocalSearchParams as jest.Mock).mockReturnValue({ name: 'Rainier Coffee', address: '88 Pine St' });
      await wrap(<ConfirmDetailsScreen />);
      expect(await screen.findByTestId('confirm-pin-problem')).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId('confirm-looks-right'));
      expect(push).not.toHaveBeenCalled();
      expect(api.lookupBusinesses).not.toHaveBeenCalled();
    });

    it('A10: a live-camera storefront step with real Discard/Retake, holding the photo in memory until it is signed', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ name: 'Rainier Coffee', address: '88 Pine St', lat: '47.6', lng: '-122.3', contactName: '', contactPhone: '' });
      mockTakePicture.mockResolvedValue({ uri: 'file:///front.jpg', base64: '/9j/4AAAAAAAAAAAAAAAAAAAAAA=' });
      await wrap(<PhotoPlaceScreen />);
      expect(screen.getByTestId('photo-storage-note')).toHaveTextContent(/saved to the listing when you sign it/);
      await fireEvent.press(screen.getByTestId('photo-open-camera'));
      await fireEvent.press(await screen.findByTestId('photo-capture'));
      expect(await screen.findByTestId('photo-preview')).toBeOnTheScreen();
      expect(screen.getByTestId('photo-continue')).toHaveTextContent('Use this photo');

      // Discard really drops the photo: nothing is held and the step offers to skip.
      await fireEvent.press(screen.getByTestId('photo-discard'));
      expect(screen.queryByTestId('photo-preview')).not.toBeOnTheScreen();
      expect(takeStorefrontShot()).toBeNull();
      expect(screen.getByTestId('photo-continue')).toHaveTextContent('Continue without a photo');

      // Retake, keep: the bytes are held (JPEG recognised from its own leading bytes), then Continue goes to the price step.
      await fireEvent.press(screen.getByTestId('photo-open-camera'));
      await fireEvent.press(await screen.findByTestId('photo-capture'));
      await screen.findByTestId('photo-preview');
      await fireEvent.press(screen.getByTestId('photo-continue'));
      expect(push).toHaveBeenCalledWith({
        pathname: '/(ambassador)/counter',
        params: { name: 'Rainier Coffee', address: '88 Pine St', lat: '47.6', lng: '-122.3', contactName: '', contactPhone: '' },
      });
      const held = takeStorefrontShot();
      expect(held?.mime).toBe('image/jpeg');
      expect(held?.bytes.length).toBe(20);
    });

    it('A10: continues without a photo when the camera is refused', async () => {
      mockCameraPermission = { granted: false, canAskAgain: true };
      mockRequestCameraPermission.mockResolvedValue({ granted: false, canAskAgain: true });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ name: 'A', address: 'B', lat: '1', lng: '2' });
      await wrap(<PhotoPlaceScreen />);
      await fireEvent.press(screen.getByTestId('photo-open-camera'));
      expect(await screen.findByTestId('photo-message')).toHaveTextContent(/camera is off/);
      await fireEvent.press(screen.getByTestId('photo-continue'));
      expect(push).toHaveBeenCalled();
    });

    describe('the counter — one price and a coupon, all from the server', () => {
      const params = { name: 'Rainier Coffee', address: '88 Pine St', lat: '47.6', lng: '-122.3', contactName: 'Sam', contactPhone: '' };
      const pricing = (foundingOpen = true) => ({
        data: {
          pricing: {
            regular: { listPriceCents: 39900, couponOffCents: 0, priceCents: 39900 },
            founding: foundingOpen ? { listPriceCents: 39900, couponOffCents: 20000, priceCents: 19900 } : null,
            foundingWindowOpen: foundingOpen,
          },
        },
      });

      it('offers Regular and Founding with the server\'s figures and sends only the coupon choice', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(params);
        api.getSignupPricing.mockResolvedValue(pricing());
        api.signBusiness.mockResolvedValue({
          data: { helloHangout: { id: VENUE, name: 'Rainier Coffee', address: '88 Pine St', tier: 'founding', status: 'pending_payment', createdAt: 'x' }, pricing: { listPriceCents: 39900, couponOffCents: 20000, priceCents: 19900 }, contactSaved: true },
        });
        await wrap(<CounterScreen />);
        expect(await screen.findByTestId('counter-option-founding')).toHaveTextContent(/Due \$199/);
        expect(screen.getByTestId('counter-option-none')).toHaveTextContent(/Due \$399/);
        await fireEvent.press(screen.getByTestId('counter-sign'));

        expect(api.signBusiness).toHaveBeenCalledTimes(1);
        const body = api.signBusiness.mock.calls[0][0] as unknown as Record<string, unknown>;
        expect(body).toMatchObject({ name: 'Rainier Coffee', address: '88 Pine St', lat: 47.6, lng: -122.3, coupon: 'founding', contactName: 'Sam' });
        // Never a price, tier, owner, originator or role from the client.
        for (const key of ['price', 'priceCents', 'tier', 'ownerUserId', 'originatorId', 'role']) expect(body).not.toHaveProperty(key);
        expect(await screen.findByTestId('counter-done')).toBeOnTheScreen();
        expect(screen.getByTestId('counter-done-price')).toHaveTextContent(/\$199/);
        await fireEvent.press(screen.getByTestId('counter-visit-now'));
        expect(replace).toHaveBeenCalledWith({ pathname: '/(ambassador)/visit-check-in', params: { helloHangoutId: VENUE } });
      });

      it('offers only the regular price once the Founding window has closed, and never a deferred option', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(params);
        api.getSignupPricing.mockResolvedValue(pricing(false));
        await wrap(<CounterScreen />);
        expect(await screen.findByTestId('counter-option-none')).toBeOnTheScreen();
        expect(screen.queryByTestId('counter-option-founding')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('counter-option-deferred')).not.toBeOnTheScreen();
        expect(screen.getByTestId('counter-founding-closed')).toBeOnTheScreen();
      });

      it('handles the window closing mid-flow: shows the server\'s refusal and reloads what is on offer', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(params);
        api.getSignupPricing.mockResolvedValueOnce(pricing()).mockResolvedValue(pricing(false));
        api.signBusiness.mockResolvedValue({ error: { code: 'founding_window_closed', status: 400, message: 'x' } });
        await wrap(<CounterScreen />);
        await fireEvent.press(await screen.findByTestId('counter-sign'));
        expect(await screen.findByTestId('counter-message')).toHaveTextContent(/Founding window has closed/);
        expect(await screen.findByTestId('counter-founding-closed')).toBeOnTheScreen();
        expect(screen.queryByTestId('counter-done')).not.toBeOnTheScreen();
      });

      it('says nothing was created when signing fails, and offers a retry on the price load', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(params);
        api.getSignupPricing.mockResolvedValueOnce({ error: { message: 'down' } });
        await wrap(<CounterScreen />);
        expect(await screen.findByTestId('counter-error')).toHaveTextContent(/Nothing was created/);
        api.getSignupPricing.mockResolvedValue(pricing());
        await fireEvent.press(screen.getByTestId('counter-retry'));
        expect(await screen.findByTestId('counter-option-none')).toBeOnTheScreen();
      });

      it('signs only once however many times it is pressed', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(params);
        api.getSignupPricing.mockResolvedValue(pricing());
        let release: (v: unknown) => void = () => undefined;
        api.signBusiness.mockReturnValue(new Promise((r) => { release = r; }) as never);
        await wrap(<CounterScreen />);
        const button = await screen.findByTestId('counter-sign');
        await fireEvent.press(button);
        await fireEvent.press(button);
        expect(api.signBusiness).toHaveBeenCalledTimes(1);
        await act(async () => { release({ error: { code: 'x', message: 'x' } }); });
      });

      it('will not run without the earlier steps\' details', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
        await wrap(<CounterScreen />);
        expect(await screen.findByTestId('counter-needs-details')).toBeOnTheScreen();
        expect(api.getSignupPricing).not.toHaveBeenCalled();
      });
    });
  });
});
