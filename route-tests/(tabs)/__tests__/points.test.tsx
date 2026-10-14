/**
 * POINTS TAB — WIRE against GET /points/balance and /points/ledger
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import PointsScreen from '../../../app/(tabs)/points';
import { ThemeProvider } from '../../../src/theme';
import { getPointsBalance, getPointsLedger } from '../../../src/api/points';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

jest.mock('../../../src/api/points', () => ({
  getPointsBalance: jest.fn(),
  getPointsLedger: jest.fn(),
}));

// NudgeCapNotice (mounted by the tab) reads the cap from the Hellos client on focus.
jest.mock('../../../src/api/hellos', () => ({ getNudgeCap: jest.fn(() => Promise.resolve({ data: { atCap: false } })) }));

describe('Points tab', () => {
  it('renders camelCase ledger amounts from the actual client', async () => {
    (getPointsBalance as jest.Mock).mockResolvedValue({ data: { balance: 50 } });
    (getPointsLedger as jest.Mock).mockResolvedValue({ data: { entries: [{ id: 'e1', entryType: 'accepted', pointsAmount: 25 }] } });
    await render(<ThemeProvider><PointsScreen /></ThemeProvider>);
    expect(screen.getByText('+25')).toBeOnTheScreen();
    expect(screen.getByText('accepted')).toBeOnTheScreen();
  });

  it('never fabricates a balance when the server is unavailable', async () => {
    (getPointsBalance as jest.Mock).mockResolvedValue({ error: { message: 'Offline' } });
    (getPointsLedger as jest.Mock).mockResolvedValue({ error: { message: 'Offline' } });
    await render(<ThemeProvider><PointsScreen /></ThemeProvider>);
    expect(screen.getByText('Unavailable')).toBeOnTheScreen();
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.getByText('Offline')).toBeOnTheScreen();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows balance as drawing entries and never displays below 1', async () => {
    (getPointsBalance as jest.Mock).mockResolvedValue({
      data: { balance: 0, drawingEntries: 0 },
    });
    (getPointsLedger as jest.Mock).mockResolvedValue({ data: { entries: [] } });

    render(
      <ThemeProvider>
        <PointsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('points-balance')).toBeOnTheScreen();
    });
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByTestId('points-ledger-empty')).toBeOnTheScreen();
  });

  it('lists ledger entries', async () => {
    (getPointsBalance as jest.Mock).mockResolvedValue({
      data: { balance: 50, drawingEntries: 50 },
    });
    (getPointsLedger as jest.Mock).mockResolvedValue({
      data: {
        entries: [{ id: 'e1', description: 'Accepted a hello', points_amount: 25 }],
      },
    });

    render(
      <ThemeProvider>
        <PointsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ledger-e1')).toBeOnTheScreen();
    });
    expect(screen.getByText('Accepted a hello')).toBeOnTheScreen();
    expect(screen.getByText('+25')).toBeOnTheScreen();
    expect(screen.getByText('50')).toBeOnTheScreen();
  });
});
