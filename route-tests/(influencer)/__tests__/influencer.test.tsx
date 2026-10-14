/**
 * INFLUENCER (CREATOR) SCREENS — access, Two streams, Earned and Building, Pick a code, taken,
 * My Links, Ambassadors, Toolkit, Account.
 *
 * VERTICAL-BUILD-07 replacements, for coordinator review:
 *  - "loads earned and building from GET /influencer/earnings … $40 / $20 / influencer-paid-card":
 *    pinned the old contract — summed `earned`/`building` TOTALS (pending rows counted in BOTH),
 *    dollar figures shown as if cleared, and a made-up default flat rate of 2000. Canon: no total,
 *    Building never as certain as Earned, every earnings figure an MA-05 slot (ROLE-4 §6, RULES
 *    §31.2). Replaced by side-by-side Earned/Building tiles, per-venue rows by stream, "—" for a
 *    withheld figure and an amount only when the server sends one.
 *  - "never shows distance (§8.12)": kept, on the new contract.
 *  - Pick a code (3 tests) and Code already taken (1 test): flows and assertions kept as they were
 *    (same test ids, same calls, same navigation); the interactions are now awaited (RNTL v14).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

let mockWindowWidth = 375;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWindowWidth, height: 900, scale: 1, fontScale: 1 }),
}));

jest.mock('../../../src/api/codes', () => ({
  checkCodeAvailability: jest.fn(),
  setInfluencerCode: jest.fn(),
  getMyCodes: jest.fn(),
}));

jest.mock('../../../src/api/influencer', () => ({
  getInfluencerMe: jest.fn(),
  applyAsInfluencer: jest.fn(),
  getInfluencerEarnings: jest.fn(),
  getChannelAmbassadors: jest.fn(),
  getInfluencerLinks: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

import { checkCodeAvailability, setInfluencerCode } from '../../../src/api/codes';
import * as influencerApi from '../../../src/api/influencer';
import { setPendingCode } from '../../../src/state/pending-code';
import CreatorHomeScreen from '../../../app/influencer/index';
import InfluencerEarningsScreen from '../../../app/influencer/earnings';
import PickCodeScreen from '../../../app/influencer/pick-code';
import CodeTakenScreen from '../../../app/influencer/code-taken';
import MyLinksScreen from '../../../app/influencer/my-links';
import ChannelAmbassadorsScreen from '../../../app/influencer/ambassadors';
import InfluencerToolkitScreen from '../../../app/influencer/toolkit';
import InfluencerAccountScreen from '../../../app/influencer/account';

const api = influencerApi as jest.Mocked<typeof influencerApi>;

function distanceGuard() {
  expect(screen.queryByText(/\d+\s*(miles?|mi|km|meters?|feet|ft)\b/i)).toBeNull();
  expect(screen.queryByText(/\d+\s*away/i)).toBeNull();
}

const me = (over: Record<string, unknown> = {}) => ({
  isInfluencer: false,
  applicationsAvailable: true,
  application: null,
  canPickCode: false,
  code: null,
  ...over,
});

const earnings = (over: Record<string, unknown> = {}) => ({
  earned: [],
  building: [],
  reversed: [],
  figuresCleared: false,
  flatRateCents: null,
  payout: { provider: 'trolley', connected: false },
  ...over,
});

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Influencer Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    setPendingCode(null);
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    api.getInfluencerMe.mockResolvedValue({ data: { me: me({ isInfluencer: true, canPickCode: true, code: { code: 'NiaB', locked: false, attributions: 0 } }) } });
  });

  describe('Access (a record, not a role value)', () => {
    it('shows the application to someone without a code and sends it trimmed', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me() } });
      api.applyAsInfluencer.mockResolvedValue({ data: { application: { id: 'a', status: 'submitted', createdAt: 'x' } } });
      await wrap(<CreatorHomeScreen />);
      expect(await screen.findByTestId('creator-application')).toBeOnTheScreen();
      expect(screen.getByText('No follower minimum. We do read these.')).toBeOnTheScreen();
      await fireEvent.changeText(screen.getByTestId('creator-apply-fullName'), ' Cam Lee ');
      await fireEvent.changeText(screen.getByTestId('creator-apply-channel'), '@camlee');
      await fireEvent.changeText(screen.getByTestId('creator-apply-phone'), '206 555 0110');
      api.getInfluencerMe.mockResolvedValue({ data: { me: me({ application: { id: 'a', status: 'submitted', createdAt: 'x' } }) } });
      await fireEvent.press(screen.getByTestId('creator-apply-submit'));
      expect(api.applyAsInfluencer).toHaveBeenCalledWith({ fullName: 'Cam Lee', channel: '@camlee', phone: '206 555 0110' });
      expect(await screen.findByTestId('creator-application-open')).toBeOnTheScreen();
    });

    it('refuses an incomplete application without a call', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me() } });
      await wrap(<CreatorHomeScreen />);
      await screen.findByTestId('creator-application');
      await fireEvent.press(screen.getByTestId('creator-apply-submit'));
      expect(await screen.findByTestId('creator-apply-message')).toHaveTextContent('Fill in every field.');
      expect(api.applyAsInfluencer).not.toHaveBeenCalled();
    });

    it('says applications are not open on the server, and has an error state with retry', async () => {
      api.getInfluencerMe.mockResolvedValueOnce({ error: { message: 'down' } });
      await wrap(<CreatorHomeScreen />);
      expect(await screen.findByTestId('creator-error')).toBeOnTheScreen();
      api.getInfluencerMe.mockResolvedValue({ data: { me: me({ applicationsAvailable: false }) } });
      await fireEvent.press(screen.getByTestId('creator-retry'));
      expect(await screen.findByTestId('creator-application-unavailable')).toBeOnTheScreen();
    });

    it('an approved applicant is sent to pick their own code', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me({ canPickCode: true, application: { id: 'a', status: 'approved', createdAt: 'x' } }) } });
      await wrap(<CreatorHomeScreen />);
      await fireEvent.press(await screen.findByTestId('creator-pick-code'));
      expect(mockPush).toHaveBeenCalledWith('/influencer/pick-code');
    });
  });

  describe('Two streams (SN-01)', () => {
    it('describes both streams with no figure before clearance, and shows Earned and Building together', async () => {
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings() } } as never);
      await wrap(<CreatorHomeScreen />);
      expect(await screen.findByTestId('creator-overview')).toBeOnTheScreen();
      expect(screen.getByTestId('creator-stream-a')).toHaveTextContent(/Businesses on your code/);
      expect(screen.getByTestId('creator-stream-b')).toHaveTextContent(/Ambassadors who came through your channel/);
      expect(screen.getByTestId('creator-before-clearance')).toHaveTextContent(/You earn on every Hello Hangout that renews\./);
      // No figure and no example: nothing on the screen is a dollar amount.
      expect(screen.queryByText(/\$\d/)).toBeNull();
      expect(screen.getByTestId('earned-building-pair')).toBeOnTheScreen();
      expect(screen.getByTestId('building-card')).toHaveTextContent(/Provisional/);
    });

    it('shows the flat annual rate — as dollars — only once the server clears it', async () => {
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings({ figuresCleared: true, flatRateCents: 2000 }) } } as never);
      await wrap(<CreatorHomeScreen />);
      expect(await screen.findByTestId('creator-stream-a')).toHaveTextContent(/\$20 a year, for life/);
      expect(screen.queryByTestId('creator-before-clearance')).not.toBeOnTheScreen();
      // The headline says "never a percentage"; no percentage FIGURE appears anywhere (§2.12).
      expect(screen.queryByText(/\d\s*%/)).toBeNull();
      expect(screen.getByText('Flat dollars, never a percentage')).toBeOnTheScreen();
    });

    it('lays out the delivered rail at desktop width with every entry built', async () => {
      mockWindowWidth = 1440;
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings() } } as never);
      await wrap(<CreatorHomeScreen />);
      expect(await screen.findByTestId('influencer-rail')).toBeOnTheScreen();
      for (const key of ['overview', 'links', 'ambassadors', 'earnings', 'toolkit', 'account']) {
        expect(screen.getByTestId(`influencer-rail-${key}`)).toBeOnTheScreen();
      }
      expect(screen.getByTestId('influencer-rail-overview')).toBeSelected();
      await fireEvent.press(screen.getByTestId('influencer-rail-links'));
      expect(mockPush).toHaveBeenCalledWith('/influencer/my-links');
    });
  });

  describe('Influencer earnings (SN-04)', () => {
    const row = (over: Record<string, unknown>) => ({ id: 'e1', helloHangoutId: 'h1', venue: 'Rainier Coffee', stream: 'direct', state: 'earned', amountCents: null, createdAt: 'x', ...over });

    it('separates earned, building and reversed by stream, with no total and no figure while withheld', async () => {
      api.getInfluencerEarnings.mockResolvedValue({
        data: {
          earnings: earnings({
            earned: [row({}), row({ id: 'e2', venue: 'Stone Gardens', stream: 'via_ambassador' })],
            building: [{ helloHangoutId: 'h3', venue: 'Wall of Sound', stream: 'direct', state: 'building_waiting_payment', signedAt: 'x' }],
            reversed: [row({ id: 'r1', venue: 'The Sunlight', state: 'reversed' })],
          }),
        },
      } as never);
      await wrap(<InfluencerEarningsScreen />);
      expect(await screen.findByTestId('creator-ledger-earned-e1')).toHaveTextContent(/Rainier Coffee.*Direct on your code · Paid/);
      expect(screen.getByTestId('creator-ledger-earned-e2')).toHaveTextContent(/Came through your channel/);
      expect(screen.getByTestId('creator-ledger-building-unpaid-h3')).toHaveTextContent(/Signed, waiting on payment/);
      expect(screen.getByTestId('creator-ledger-reversed-r1')).toHaveTextContent(/Reversed/);
      expect(screen.getByTestId('earned-card')).toBeOnTheScreen();
      expect(screen.getByTestId('building-card')).toBeOnTheScreen();
      expect(screen.queryByText(/\$\d/)).toBeNull();
      expect(screen.getByTestId('creator-payout-note')).toHaveTextContent(/not connected/);
    });

    it('shows a row amount only when the server sent one', async () => {
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings({ figuresCleared: true, earned: [row({ amountCents: 2000 })] }) } } as never);
      await wrap(<InfluencerEarningsScreen />);
      expect(await screen.findByTestId('creator-ledger-earned-e1')).toHaveTextContent(/\$20/);
    });

    it('has an honest empty state, and an error state with retry', async () => {
      api.getInfluencerEarnings.mockResolvedValueOnce({ error: { message: 'down' } } as never);
      await wrap(<InfluencerEarningsScreen />);
      expect(await screen.findByTestId('creator-earnings-error')).toBeOnTheScreen();
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings() } } as never);
      await fireEvent.press(screen.getByTestId('creator-earnings-retry'));
      expect(await screen.findByTestId('creator-earnings-empty')).toBeOnTheScreen();
    });

    it('never shows distance (§8.12)', async () => {
      api.getInfluencerEarnings.mockResolvedValue({ data: { earnings: earnings() } } as never);
      await wrap(<InfluencerEarningsScreen />);
      await screen.findByTestId('creator-earnings-empty');
      distanceGuard();
    });
  });

  describe('Pick a code', () => {
    it('checks availability and shows available state', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });

      await wrap(<PickCodeScreen />);

      await fireEvent.changeText(screen.getByTestId('code-input'), 'MYCODE');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('MYCODE');
      });
      await fireEvent.press(screen.getByTestId('code-check'));

      await waitFor(() => {
        expect(checkCodeAvailability).toHaveBeenCalledWith('MYCODE');
      });
      expect(await screen.findByTestId('code-available')).toBeTruthy();
    });

    it('navigates to taken screen when unavailable', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: false, reason: 'taken_influencer' },
      });

      await wrap(<PickCodeScreen />);

      await fireEvent.changeText(screen.getByTestId('code-input'), 'TAKEN');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('TAKEN');
      });
      await fireEvent.press(screen.getByTestId('code-check'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/influencer/code-taken',
          params: { code: 'TAKEN' },
        });
      });
    });

    it('takes code when available', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });
      (setInfluencerCode as jest.Mock).mockResolvedValue({
        data: { code: 'MYCODE' },
      });

      await wrap(<PickCodeScreen />);

      await fireEvent.changeText(screen.getByTestId('code-input'), 'MYCODE');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('MYCODE');
      });
      await fireEvent.press(screen.getByTestId('code-check'));
      await screen.findByTestId('code-available');
      await fireEvent.press(screen.getByTestId('code-take'));

      await waitFor(() => {
        expect(setInfluencerCode).toHaveBeenCalledWith('MYCODE');
      });
    });

    it('checks as they type, shows Taken inline and does NOT navigate away while typing', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me({ canPickCode: true, application: { id: 'a', status: 'approved', createdAt: 'x' } }) } });
      (checkCodeAvailability as jest.Mock).mockResolvedValue({ data: { available: false, reason: 'taken_influencer' } });
      await wrap(<PickCodeScreen />);
      await fireEvent.changeText(screen.getByTestId('code-input'), 'nia');
      expect(await screen.findByText('Taken')).toBeOnTheScreen();
      expect(checkCodeAvailability).toHaveBeenCalledWith('nia');
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId('code-take')).toBeDisabled();
    });

    it('will not take a code that is not available, and reports a reserved word as such', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({ data: { available: false, reason: 'reserved_system' } });
      await wrap(<PickCodeScreen />);
      await fireEvent.changeText(screen.getByTestId('code-input'), 'sayhello');
      expect(await screen.findByText('Reserved')).toBeOnTheScreen();
      expect(screen.getByTestId('code-take')).toBeDisabled();
      expect(setInfluencerCode).not.toHaveBeenCalled();
    });

    it('shows the server\'s answer when a code does not fit (the length is the server\'s, not the app\'s)', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({ error: { message: 'x', code: 'validation_error', status: 400 } });
      await wrap(<PickCodeScreen />);
      await fireEvent.changeText(screen.getByTestId('code-input'), 'a');
      expect(await screen.findByTestId('code-invalid')).toHaveTextContent(/Letters and numbers only/);
      expect(screen.getByTestId('code-take')).toBeDisabled();
    });

    it('shows the server\'s refusal when taking fails (someone got there first)', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({ data: { available: true } });
      (setInfluencerCode as jest.Mock).mockResolvedValue({ error: { message: 'x', code: 'code_taken' } });
      await wrap(<PickCodeScreen />);
      await fireEvent.changeText(screen.getByTestId('code-input'), 'racey');
      await screen.findByTestId('code-available');
      await fireEvent.press(screen.getByTestId('code-take'));
      expect(await screen.findByTestId('code-message')).toHaveTextContent('Somebody got there first.');
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('offers no editing once the code is locked by its first attribution (§25.5)', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me({ isInfluencer: true, canPickCode: true, code: { code: 'NiaB', locked: true, attributions: 3 } }) } });
      await wrap(<PickCodeScreen />);
      expect(await screen.findByTestId('pick-code-locked')).toBeOnTheScreen();
      expect(screen.getByTestId('pick-code-locked-code')).toHaveTextContent('NiaB');
      expect(screen.queryByTestId('code-input')).not.toBeOnTheScreen();
    });

    it('says a code can be chosen once approved, and does not let an unapproved person take one', async () => {
      api.getInfluencerMe.mockResolvedValue({ data: { me: me() } });
      await wrap(<PickCodeScreen />);
      expect(await screen.findByTestId('pick-code-not-approved')).toBeOnTheScreen();
      expect(screen.getByTestId('code-take')).toBeDisabled();
    });

    it('carries the "codes carry credit, never price" line and never a percentage', async () => {
      await wrap(<PickCodeScreen />);
      expect(screen.getByTestId('pick-code-credit')).toHaveTextContent(/never price/);
      expect(screen.queryByText(/\d\s*%/)).toBeNull();
    });
  });

  describe('Code already taken', () => {
    it('shows taken code and try another', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ code: 'TAKEN' });
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });

      await wrap(<CodeTakenScreen />);

      expect(await screen.findByTestId('code-taken-display')).toHaveTextContent('TAKEN');
      await fireEvent.changeText(screen.getByTestId('code-taken-input'), 'FREE');
      await waitFor(() => {
        expect(screen.getByTestId('code-taken-input').props.value).toBe('FREE');
      });
      await fireEvent.press(screen.getByTestId('code-try-another'));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/influencer/pick-code');
      });
    });

    it('hands the free code to the picker so it is not retyped, and says when another one is taken too', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ code: 'nia' });
      (checkCodeAvailability as jest.Mock).mockResolvedValueOnce({ data: { available: false, reason: 'taken_influencer' } });
      await wrap(<CodeTakenScreen />);
      await fireEvent.changeText(await screen.findByTestId('code-taken-input'), 'nia2');
      await fireEvent.press(screen.getByTestId('code-try-another'));
      expect(await screen.findByTestId('code-taken-message')).toHaveTextContent('Somebody got there first.');
      expect(mockReplace).not.toHaveBeenCalled();

      (checkCodeAvailability as jest.Mock).mockResolvedValueOnce({ data: { available: true } });
      await fireEvent.press(screen.getByTestId('code-try-another'));
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/influencer/pick-code'));
      // The picker opens with it filled in.
      (checkCodeAvailability as jest.Mock).mockResolvedValue({ data: { available: true } });
      await wrap(<PickCodeScreen />);
      expect(screen.getAllByTestId('code-input').some((input) => input.props.value === 'nia2')).toBe(true);
    });

    it('tells them an admin can release a squatted code — but not just because somebody wants it', async () => {
      await wrap(<CodeTakenScreen />);
      expect(await screen.findByText(/not just because somebody wants it/)).toBeOnTheScreen();
      expect(screen.getByText(/Reserved words are never available/)).toBeOnTheScreen();
    });
  });

  describe('My Links (SN-08)', () => {
    it('shows the one code as a link, the signups on it, and says taps are not counted', async () => {
      api.getInfluencerLinks.mockResolvedValue({ data: { links: { code: 'NiaB', locked: false, attributions: 9, tapsTracked: false } } });
      await wrap(<MyLinksScreen />);
      expect(await screen.findByTestId('creator-link')).toHaveTextContent('sayhello.world/NiaB');
      expect(screen.getByTestId('creator-link-signups')).toHaveTextContent('9 signups');
      expect(screen.getByText(/Taps are not counted yet/)).toBeOnTheScreen();
      expect(screen.getByText(/The code is what counts/)).toBeOnTheScreen();
      expect(screen.getByText(/Say the code, never the money/)).toBeOnTheScreen();
      expect(screen.queryByText(/\d+ taps/)).toBeNull();
    });

    it('has an error state with retry', async () => {
      api.getInfluencerLinks.mockResolvedValueOnce({ error: { message: 'down' } } as never);
      await wrap(<MyLinksScreen />);
      expect(await screen.findByTestId('creator-links-error')).toBeOnTheScreen();
      api.getInfluencerLinks.mockResolvedValue({ data: { links: { code: 'NiaB', locked: false, attributions: 1, tapsTracked: false } } });
      await fireEvent.press(screen.getByTestId('creator-links-retry'));
      expect(await screen.findByTestId('creator-link-signups')).toHaveTextContent('1 signup');
    });
  });

  describe('Ambassadors (SN-07)', () => {
    it('is calmly empty: nothing is late and nothing to chase', async () => {
      api.getChannelAmbassadors.mockResolvedValue({ data: { ambassadors: [], available: true } });
      await wrap(<ChannelAmbassadorsScreen />);
      expect(await screen.findByTestId('creator-ambassadors-empty')).toHaveTextContent(/No Ambassadors on your channel yet/);
      expect(screen.getByText(/Nothing is late and there is nothing to chase/)).toBeOnTheScreen();
    });

    it('lists Ambassadors who "came through your channel" — never "your Ambassadors" or a hierarchy word', async () => {
      api.getChannelAmbassadors.mockResolvedValue({ data: { ambassadors: [{ id: 'a1', name: 'Ray O.', helloHangouts: 2 }, { id: 'a2', name: 'Ana M.', helloHangouts: 1 }] } });
      await wrap(<ChannelAmbassadorsScreen />);
      expect(await screen.findByTestId('creator-ambassador-a1')).toHaveTextContent('Ray O. came through your channelHello Hangouts originated'.replace('Hello Hangouts originated', '2 Hello Hangouts originated'));
      expect(screen.getByTestId('creator-ambassador-a2')).toHaveTextContent(/1 Hello Hangout originated/);
      expect(screen.queryByText(/your Ambassadors|recruit|your team|downline/i)).toBeNull();
      // Never adjacent to a payment figure.
      expect(screen.queryByText(/\$\d/)).toBeNull();
    });

    it('says when the channel list is not set up yet, and has an error state with retry', async () => {
      api.getChannelAmbassadors.mockResolvedValueOnce({ error: { message: 'down' } } as never);
      await wrap(<ChannelAmbassadorsScreen />);
      expect(await screen.findByTestId('creator-ambassadors-error')).toBeOnTheScreen();
      api.getChannelAmbassadors.mockResolvedValue({ data: { ambassadors: [], available: false } });
      await fireEvent.press(screen.getByTestId('creator-ambassadors-retry'));
      expect(await screen.findByTestId('creator-ambassadors-unavailable')).toBeOnTheScreen();
    });
  });

  describe('Toolkit (SN-05) and Account (SN-06)', () => {
    it('shows the link as a QR and says plainly that the do-not-say list is not written', async () => {
      api.getInfluencerLinks.mockResolvedValue({ data: { links: { code: 'NiaB', locked: false, attributions: 0, tapsTracked: false } } });
      await wrap(<InfluencerToolkitScreen />);
      expect(await screen.findByTestId('creator-toolkit-link')).toHaveTextContent(/sayhello\.world\/NiaB/);
      expect(screen.getByLabelText('Your link as a QR code')).toBeOnTheScreen();
      expect(screen.getByTestId('creator-do-not-say')).toHaveTextContent(/not written yet/);
    });

    it('shows the code, "Influencers do not leave" and that payouts are not open', async () => {
      await wrap(<InfluencerAccountScreen />);
      expect(await screen.findByTestId('creator-account-code')).toHaveTextContent('NiaB');
      expect(screen.getByTestId('creator-account-leave')).toHaveTextContent(/Influencers do not leave/);
      expect(screen.getByTestId('creator-account-payout')).toHaveTextContent(/not connected/);
    });
  });
});
