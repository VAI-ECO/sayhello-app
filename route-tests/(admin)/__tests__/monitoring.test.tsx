/**
 * HELLO ADMIN › MONITORING (RULES §16.25-16.31, lane 04) — the roster and the triage matrix against a mocked API.
 * Proves what the screen asks for and shows: it displays the server's flags and the day counts the server used, and
 * computes none of them. The cutoffs being settings is proved in the API's admin-monitoring-cutoffs test.
 *
 * RNTL v14: render / fireEvent / userEvent are async and awaited.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
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

jest.mock('../../../src/api/admin', () => ({ getAdminMe: jest.fn() }));
jest.mock('../../../src/api/admin-w2', () => ({ getMonitoringRoster: jest.fn(), getMonitoringTriage: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { init: jest.fn(), get: jest.fn(), post: jest.fn() } }));

import * as adminApi from '../../../src/api/admin';
import * as w2 from '../../../src/api/admin-w2';
import AdminHomeScreen from '../../../app/admin/index';
import AdminMonitoringScreen from '../../../app/admin/monitoring';

const api = adminApi as jest.Mocked<typeof adminApi>;
const m = w2 as jest.Mocked<typeof w2>;

const me = (permissions: string[]) => ({
  data: { permissions, sections: ['audit'], isSuperAdmin: false, twoFactorEnabled: true, twoFactorEnforced: true, twoFactorVerified: true },
}) as never;

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Hello Admin monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn() });
    api.getAdminMe.mockResolvedValue(me(['audit.view']));
    m.getMonitoringRoster.mockResolvedValue({
      data: {
        flagDays: { slipping: 60, atRisk: 90, abandoned: 180 },
        roster: [
          { id: 'a1', fullName: 'Ava', originatedCount: 3, servicingCount: 2, daysSinceLastVisit: 70, flag: 'slipping' },
          { id: 'a2', fullName: 'Ben', originatedCount: null, servicingCount: null, daysSinceLastVisit: null, flag: 'abandoned' },
        ],
      },
    } as never);
    m.getMonitoringTriage.mockResolvedValue({
      data: {
        flagDays: { slipping: 60, atRisk: 90, abandoned: 180 }, hiddenQrDays: 30,
        triage: [{ id: 'h1', source: 'hello_hangout', businessName: 'Corner Cafe', servicingAmbassador: { id: 'a1', fullName: 'Ava' }, category: 'qr_hidden', daysSinceVisit: 12, hasRecentScans: false }],
      },
    } as never);
  });

  it('opens from Home with audit.view', async () => {
    await wrap(<AdminHomeScreen />);
    expect(await screen.findByTestId('admin-open-monitoring')).toBeOnTheScreen();
  });

  it('shows each Ambassador with the server\'s flag and days since the last visit, and the cutoffs the server used', async () => {
    await wrap(<AdminMonitoringScreen />);
    expect(await screen.findByTestId('admin-roster-a1')).toBeOnTheScreen();
    expect(screen.getByText('Slipping')).toBeOnTheScreen();
    expect(screen.getByText('70 days since the last visit')).toBeOnTheScreen();
    expect(screen.getByText('Abandoned')).toBeOnTheScreen();
    expect(screen.getByText('No visit on record.')).toBeOnTheScreen();
    expect(screen.getByTestId('admin-roster-days')).toHaveTextContent('Slipping after 60 days, at risk after 90, abandoned after 180 (set in Settings).');
  });

  it('shows the triage matrix with the hidden-QR window the server used', async () => {
    await wrap(<AdminMonitoringScreen />);
    expect(await screen.findByTestId('admin-triage-h1')).toBeOnTheScreen();
    expect(screen.getByText('QR hidden')).toBeOnTheScreen();
    expect(screen.getByText('Corner Cafe')).toBeOnTheScreen();
    expect(screen.getByText(/no customer scan in 30 days/)).toBeOnTheScreen();
  });

  it('says so when there is nothing to show, never an empty void', async () => {
    m.getMonitoringRoster.mockResolvedValue({ data: { roster: [], flagDays: { slipping: 60, atRisk: 90, abandoned: 180 } } } as never);
    m.getMonitoringTriage.mockResolvedValue({ data: { triage: [], flagDays: { slipping: 60, atRisk: 90, abandoned: 180 }, hiddenQrDays: 30 } } as never);
    await wrap(<AdminMonitoringScreen />);
    expect(await screen.findByTestId('admin-roster-empty')).toBeOnTheScreen();
    expect(await screen.findByTestId('admin-triage-empty')).toBeOnTheScreen();
  });

  it('a failed load is a retryable error, not a blank screen', async () => {
    m.getMonitoringRoster.mockResolvedValue({ error: { code: 'server_error' } } as never);
    await wrap(<AdminMonitoringScreen />);
    expect(await screen.findByTestId('admin-roster-error')).toBeOnTheScreen();
    expect(await screen.findByTestId('admin-triage-h1')).toBeOnTheScreen();
  });
});
