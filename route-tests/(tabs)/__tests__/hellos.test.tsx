/**
 * CONNECTIONS TAB — WIRE list against GET /hellos
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HellosScreen from '../../../app/(tabs)/hellos';
import { ThemeProvider } from '../../../src/theme';
import { getHellos } from '../../../src/api/hellos';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

jest.mock('../../../src/api/hellos', () => ({
  getHellos: jest.fn(),
}));

describe('Connections tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty invitation when there are no hellos', async () => {
    (getHellos as jest.Mock).mockResolvedValue({ data: { hellos: [] } });

    render(
      <ThemeProvider>
        <HellosScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('connections-empty')).toBeOnTheScreen();
    });
    expect(
      screen.getByText('Your connections show up here after you say hello.')
    ).toBeOnTheScreen();
  });

  it('lists hellos from GET /hellos', async () => {
    (getHellos as jest.Mock).mockResolvedValue({
      data: {
        hellos: [
          { id: 'h1', status: 'accepted', hello_code: 'AB3-FKL7' },
          { id: 'h2', status: 'pending', from: 'waverly' },
        ],
      },
    });

    render(
      <ThemeProvider>
        <HellosScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('connection-h1')).toBeOnTheScreen();
    });
    expect(screen.getByText('Hello AB3-FKL7')).toBeOnTheScreen();
    expect(screen.getByText('Hello pending')).toBeOnTheScreen();
  });

  it('links a revealed, accepted Hello to its pin on the map; no link for a pending or missed one', async () => {
    (getHellos as jest.Mock).mockResolvedValue({
      data: {
        hellos: [
          { id: 'h1', status: 'accepted', revealedAt: '2026-08-02T18:00:00Z', person: { userId: 'u2', displayName: 'Mara', identityColor: null, profilePhotoUrl: null } },
          { id: 'h2', status: 'pending' },
          { id: 'h3', status: 'missed', revealedAt: '2026-08-03T18:00:00Z', person: { userId: 'u3', displayName: 'Jo', identityColor: null, profilePhotoUrl: null } },
        ],
      },
    });
    render(<ThemeProvider><HellosScreen /></ThemeProvider>);
    await waitFor(() => expect(screen.getByTestId('connection-map-h1')).toBeOnTheScreen());
    expect(screen.queryByTestId('connection-map-h2')).toBeNull();
    expect(screen.queryByTestId('connection-map-h3')).toBeNull();
    await fireEvent.press(screen.getByTestId('connection-map-h1'));
    // `at` makes asking for the same pin again a new request while the map tab is still mounted.
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(tabs)/map', params: { pin: 'h1', at: expect.any(String) } });
  });
});
