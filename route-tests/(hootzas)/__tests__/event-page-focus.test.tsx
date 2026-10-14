/**
 * EVENT PAGE FOCUS TESTS
 * Tests NavigationContext focus listener for myHostMode transitions
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { ThemeProvider } from '../../../src/theme';
import HootzaPageScreen from '../../../app/(hootzas)/[id]/index';
import * as hootzasApi from '../../../src/api/hootzas';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../src/api/hootzas');
jest.mock('../../../src/api/client', () => ({
  api: {
    user: {
      getProfile: jest.fn(),
    },
  },
}));

const getHootzaMock = hootzasApi.getHootza as jest.Mock;

// Access the mocked getProfile
import { api } from '../../../src/api/client';
const getProfileMock = api.user.getProfile as jest.Mock;

function hootzaBase() {
  return {
    id: 'hz-1',
    title: 'Test Event',
    status: 'live' as const,
    hostUserId: 'u-host',
    venueType: 'public_place' as const,
    startTime: '2026-09-24T20:00:00Z',
    scheduledEndTime: '2026-09-24T23:00:00Z',
    actualEndTime: null,
    description: null,
    locationName: 'Test Location',
    locationLat: null,
    locationLng: null,
    coverChargeAmount: null,
    coverChargeDescription: null,
    cancellationReason: null,
    cancelledAt: null,
    checkInQrCode: 'qr-code',
    createdAt: '2026-09-24T10:00:00Z',
    host: { id: 'u-host', fullName: 'Test Host' },
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1' });
  getProfileMock.mockResolvedValue({ data: { id: 'u-123' } });
});

describe('HootzaPageScreen focus listener', () => {
  it('refreshes on focus after myHostMode transitions from not-checked-in to checked-in', async () => {
    // Mock navigation context
    const focusListeners = new Set<() => void>();
    const mockNavigation = {
      addListener: jest.fn((event: string, callback: () => void) => {
        if (event === 'focus') {
          focusListeners.add(callback);
        }
        return () => focusListeners.delete(callback);
      }),
    };

    // Initial response: not checked in, no myHostMode
    getHootzaMock.mockResolvedValueOnce({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'not-checked-in',
            available: false,
            accepted: false,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await render(
      <NavigationContext.Provider value={mockNavigation as any}>
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      </NavigationContext.Provider>
    );

    // Wait for initial load to complete
    await screen.findByText('Test Event');

    expect(getHootzaMock).toHaveBeenCalledTimes(1);

    // User checks in via QR code, then returns to event page
    // Mock updated response: now checked in, has myHostMode available
    getHootzaMock.mockResolvedValueOnce({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'off',
            available: true,
            accepted: false,
            serverTime: '2026-09-24T21:00:30Z',
            windowClosesAt: null,
          },
          hostMode: {
            id: 'hm-1',
            hootzaId: 'hz-1',
            intervalMinutes: 30,
            windowLengthMinutes: 10,
            lastWindowOpenedAt: null,
            isActive: true,
            developerOverrideEnabled: false,
          },
        },
      },
    });

    // Trigger focus listener
    focusListeners.forEach(listener => listener());

    // Wait for refresh to complete
    await screen.findByText('Test Event');

    // Should have refreshed and now show Host Mode entry point
    expect(getHootzaMock).toHaveBeenCalledTimes(2);
    expect(getHootzaMock).toHaveBeenCalledWith('hz-1');
  });

  it('cleans up focus listener on unmount', async () => {
    const focusListeners = new Set<() => void>();
    const unsubscribeMock = jest.fn();
    const mockNavigation = {
      addListener: jest.fn((event: string, callback: () => void) => {
        if (event === 'focus') {
          focusListeners.add(callback);
        }
        return unsubscribeMock;
      }),
    };

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'off',
            available: true,
            accepted: false,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });

    const { unmount } = await render(
      <NavigationContext.Provider value={mockNavigation as any}>
        <ThemeProvider>
          <HootzaPageScreen />
        </ThemeProvider>
      </NavigationContext.Provider>
    );

    expect(mockNavigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function));

    await unmount();

    // Cleanup should have been called
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
