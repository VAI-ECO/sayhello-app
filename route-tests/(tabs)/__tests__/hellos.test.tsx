/**
 * CONNECTIONS TAB — WIRE list against GET /hellos
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HellosScreen from '../../../app/(tabs)/hellos';
import { ThemeProvider } from '../../../src/theme';
import { getHellos } from '../../../src/api/hellos';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
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
});
