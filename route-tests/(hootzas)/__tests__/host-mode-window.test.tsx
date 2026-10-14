/**
 * HOST MODE WINDOW TESTS
 * Tests attendee Host Mode screen with server state integration
 */

import React from 'react';
import { AppState } from 'react-native';
import { render, screen, fireEvent, act, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { ThemeProvider } from '../../../src/theme';
import { getHootza, saveHostModeParticipation } from '../../../src/api/hootzas';
import HostModeWindowScreen from '../../../app/(hootzas)/[id]/host-mode-window';

jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), useRouter: jest.fn() }));
jest.mock('expo-router/react-navigation', () => ({ useIsFocused: jest.fn() }));
jest.mock('../../../src/api/hootzas', () => ({
  ...jest.requireActual('../../../src/api/hootzas'),
  getHootza: jest.fn(),
  saveHostModeParticipation: jest.fn(),
}));

const back = jest.fn();
const getHootzaMock = getHootza as jest.Mock;
const saveMock = saveHostModeParticipation as jest.Mock;
const originalAppState = AppState.currentState;

function hootzaBase() {
  return {
    id: 'hz-1',
    title: 'Trivia Night',
    status: 'live' as const,
    hostUserId: 'u-host',
    venueType: 'public_place' as const,
    startTime: '2026-09-24T20:00:00Z',
    scheduledEndTime: '2026-09-24T23:00:00Z',
    actualEndTime: null,
    description: null,
    locationName: 'The Bar',
    locationLat: null,
    locationLng: null,
    coverChargeAmount: null,
    coverChargeDescription: null,
    cancellationReason: null,
    cancelledAt: null,
    checkInQrCode: null,
    createdAt: '2026-09-24T10:00:00Z',
    host: { id: 'u-host', fullName: 'Ray' },
    hostMode: {
      id: 'hm-1',
      hootzaId: 'hz-1',
      intervalMinutes: 30,
      windowLengthMinutes: 10,
      lastWindowOpenedAt: null,
      isActive: true,
      developerOverrideEnabled: false,
    },
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-24T21:00:00Z'));
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  (useRouter as jest.Mock).mockReturnValue({ back, push: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1' });
  (useIsFocused as jest.Mock).mockReturnValue(true);
  saveMock.mockResolvedValue({ data: { checkin: { id: 'ci-1' } } });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  AppState.currentState = originalAppState;
  jest.restoreAllMocks();
});

describe('initial loading and errors', () => {
  it('shows loading spinner initially', async () => {
    getHootzaMock.mockImplementation(() => new Promise(() => {}));
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-loading')).toBeOnTheScreen();
  });

  it('shows error state when fetch rejects', async () => {
    getHootzaMock.mockRejectedValue(new Error('Network timeout'));
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
    expect(screen.getByText('Network timeout')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-retry')).toBeOnTheScreen();
  });

  it('shows error state when fetch returns error object', async () => {
    getHootzaMock.mockResolvedValue({ error: { message: 'Not found' } });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
    expect(screen.getByText('Not found')).toBeOnTheScreen();
  });

  it('retries fetch on error', async () => {
    getHootzaMock.mockResolvedValueOnce({ error: { message: 'Network error' } });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await fireEvent.press(screen.getByTestId('host-mode-retry'));
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
  });

  it('shows error when ID is missing', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: undefined });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
  });

  it('shows error when ID is empty string', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '' });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
  });

  it('shows error when ID is whitespace only', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '   ' });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
  });

  it('shows error when ID is array', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: ['hz-1', 'hz-2'] });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-error')).toBeOnTheScreen();
  });

  it('shows unavailable when hootza exists but myHostMode is missing', async () => {
    getHootzaMock.mockResolvedValue({ data: { hootza: hootzaBase() } });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-unavailable')).toBeOnTheScreen();
    expect(screen.getByText('Host Mode unavailable')).toBeOnTheScreen();
  });
});

describe('state rendering', () => {
  it('renders not-checked-in state', async () => {
    getHootzaMock.mockResolvedValue({
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-not-checked-in')).toBeOnTheScreen();
    expect(screen.getByText('Not checked in')).toBeOnTheScreen();
  });

  it('renders ended state', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'ended',
            available: false,
            accepted: false,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-ended')).toBeOnTheScreen();
    expect(screen.getByText('Host Mode ended')).toBeOnTheScreen();
  });

  it('renders unavailable state', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'unavailable',
            available: false,
            accepted: false,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-unavailable-state')).toBeOnTheScreen();
    expect(screen.getByText('Host Mode unavailable')).toBeOnTheScreen();
  });

  it('renders off state with turn on button and retry when has error', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-off')).toBeOnTheScreen();
    expect(screen.getByText("You're not open")).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-toggle-on')).toBeOnTheScreen();
  });

  it('renders waiting state with turn off button', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
    expect(screen.getByText('Waiting for next window')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-toggle-off')).toBeOnTheScreen();
  });

  it('renders open state with timer and progress', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:10:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-open')).toBeOnTheScreen();
    expect(screen.getByText("You're open")).toBeOnTheScreen();
    expect(screen.getByText('10 min left')).toBeOnTheScreen();
    expect(screen.getByTestId("host-mode-progress")).toBeOnTheScreen();
  });
});

describe('timer and progress', () => {
  it('updates timer every second', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:10:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByText('10 min left')).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(screen.getByText('5 min left')).toBeOnTheScreen();
  });

  it('triggers refresh when timer expires and shows expired spinner first time', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:02:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(getHootzaMock).toHaveBeenCalledTimes(1);

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:02:01Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000 + 1000);
    });

    expect(getHootzaMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
  });

  it('does not restart countdown when repeated expired-open response received', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:01:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Advance past expiry - triggers single automatic refresh
    await act(async () => {
      jest.advanceTimersByTime(61 * 1000);
    });

    // Expiry triggers refresh; after refresh completes, must show actionable state
    // Requirement: single automatic refresh per expired close identity, settled state must be actionable (not transient spinner)
    expect(getHootzaMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeOnTheScreen();

    // Verify no additional automatic refresh attempts (same expired window identity)
    const callCountBefore = getHootzaMock.mock.calls.length;
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(getHootzaMock).toHaveBeenCalledTimes(callCountBefore); // No new calls
  });

  it('fails closed when windowClosesAt is invalid date string', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: 'invalid-date',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-timer-invalid')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeOnTheScreen();
  });

  it('fails closed when windowLengthMinutes is invalid', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          hostMode: {
            ...hootzaBase().hostMode,
            windowLengthMinutes: -5,
          },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:10:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-config-invalid')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeOnTheScreen();
  });
});

describe('save and toggle', () => {
  it('turns on from off state', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:01Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));
    expect(saveMock).toHaveBeenCalledWith('hz-1', true);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
  });

  it('turns off from open state and immediately clears open window', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:10:00Z',
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-open')).toBeOnTheScreen();

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'off',
            available: true,
            accepted: false,
            serverTime: '2026-09-24T21:00:01Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await fireEvent.press(screen.getByTestId('host-mode-toggle-off'));
    expect(saveMock).toHaveBeenCalledWith('hz-1', false);
    // Should immediately show off, never retain open after successful opt-out
    expect(screen.getByTestId('host-mode-off')).toBeOnTheScreen();
  });

  it('shows POST success then GET failure: retains known accepted state as waiting', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // POST succeeds (user now accepted=true), but GET fails
    saveMock.mockResolvedValue({ data: { checkin: { id: 'ci-1' } } });
    getHootzaMock.mockRejectedValue(new Error('Refresh network error'));

    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));

    // Should show WAITING state (saved acceptance) with refresh error and retry button
    // Requirement: successful POST must retain saved acceptance even when GET fails
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-toggle-off')).toBeOnTheScreen(); // Shows Off button since accepted=true
    expect(screen.getByText('Could not refresh. Please try again.')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeOnTheScreen();
  });

  it('shows POST success then GET failure: retains known accepted OFF state', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // POST succeeds (user now accepted=false), but GET fails
    saveMock.mockResolvedValue({ data: { checkin: { id: 'ci-1' } } });
    getHootzaMock.mockRejectedValue(new Error('Refresh failed'));

    await fireEvent.press(screen.getByTestId('host-mode-toggle-off'));

    // Should show OFF state (saved non-acceptance) with refresh error and retry button
    // Requirement: successful POST must retain saved acceptance even when GET fails
    expect(screen.getByTestId('host-mode-off')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-toggle-on')).toBeOnTheScreen(); // Shows On button since accepted=false
    expect(screen.getByText('Could not refresh. Please try again.')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeOnTheScreen();
  });

  it('shows error when save rejects and preserves previous state', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    saveMock.mockRejectedValue(new Error('Network error'));

    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));
    expect(screen.getByText('Could not save your choice. Please try again.')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-off')).toBeOnTheScreen();
  });

  it('shows error when save returns error object', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    saveMock.mockResolvedValue({ error: { message: 'Invalid request' } });

    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));
    expect(screen.getByText('Could not save your choice. Please try again.')).toBeOnTheScreen();
  });

  it('disables button during save', async () => {
    const user = userEvent.setup();
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Use deferred promise to test disabled state during pending POST
    let resolveSave: (value: any) => void;
    const savePending = new Promise(resolve => { resolveSave = resolve; });
    saveMock.mockReturnValue(savePending);

    // Launch press - userEvent simulates native press events
    await user.press(screen.getByTestId('host-mode-toggle-on'));

    // Button should be disabled during pending save
    expect(screen.getByTestId('host-mode-toggle-on')).toBeDisabled();

    // Resolve and complete
    await act(async () => {
      resolveSave!({ data: { checkin: { id: 'ci-1' } } });
    });
  });

  it('prevents same-tick double invocation', async () => {
    const user = userEvent.setup();
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    let resolveFirst: () => void;
    const firstSave = new Promise<void>(resolve => { resolveFirst = resolve; });
    saveMock.mockReturnValueOnce(firstSave.then(() => ({ data: { checkin: { id: 'ci-1' } } })));

    // First press - returns while network remains pending
    await user.press(screen.getByTestId('host-mode-toggle-on'));

    // Second press while first is pending - should be blocked
    await user.press(screen.getByTestId('host-mode-toggle-on'));

    // Resolve first save
    await act(async () => {
      resolveFirst!();
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('clears error after successful save', async () => {
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
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // First save fails
    saveMock.mockResolvedValueOnce({ error: { message: 'Failed' } });
    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));
    expect(screen.getByText('Could not save your choice. Please try again.')).toBeOnTheScreen();

    // Second save succeeds
    saveMock.mockResolvedValue({ data: { checkin: { id: 'ci-1' } } });
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:01Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await fireEvent.press(screen.getByTestId('host-mode-toggle-on'));
    expect(screen.queryByText('Could not save your choice. Please try again.')).not.toBeOnTheScreen();
  });

  it('turns off from waiting state', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'off',
            available: true,
            accepted: false,
            serverTime: '2026-09-24T21:00:01Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await fireEvent.press(screen.getByTestId('host-mode-toggle-off'));
    expect(saveMock).toHaveBeenCalledWith('hz-1', false);
    expect(screen.getByTestId('host-mode-off')).toBeOnTheScreen();
  });
});

describe('scheduled end handling', () => {
  it('displays correct message when scheduledEndTime is null', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          scheduledEndTime: null,
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();
    // Should show "It's over when it's over" for no scheduled end
    expect(screen.getByText(/It's over when it's over/i)).toBeOnTheScreen();
  });
});

describe('focus and foreground refresh', () => {
  it('refreshes on focus with rerender', async () => {
    const focused = jest.fn().mockReturnValue(true);
    (useIsFocused as jest.Mock).mockImplementation(focused);

    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    const { rerender } = await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(getHootzaMock).toHaveBeenCalledTimes(1);

    // Blur
    focused.mockReturnValue(false);
    await rerender(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Refocus - should trigger refresh
    focused.mockReturnValue(true);
    await rerender(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    expect(getHootzaMock).toHaveBeenCalledTimes(2);
  });

  it('refreshes on foreground callback', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });
    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(getHootzaMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('host-mode-waiting')).toBeOnTheScreen();

    // Capture the AppState listener - get the most recent call since effect may have re-run
    const appStateListenerCalls = jest.mocked(AppState.addEventListener).mock.calls;
    const appStateCallback = appStateListenerCalls[appStateListenerCalls.length - 1][1];

    // Background
    await act(async () => {
      appStateCallback('background' as any);
    });

    // Return to foreground - should trigger refresh since loading=false, hootza exists, focused=true
    await act(async () => {
      appStateCallback('active' as any);
    });

    // Wait for refresh to complete
    await screen.findByTestId('host-mode-waiting');

    expect(getHootzaMock).toHaveBeenCalledTimes(2);
  });

  it('does not start GET during pending POST', async () => {
    const user = userEvent.setup();
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
    const { rerender } = await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(getHootzaMock).toHaveBeenCalledTimes(1);

    let resolveSave: () => void;
    const savePending = new Promise<void>(resolve => { resolveSave = resolve; });
    saveMock.mockReturnValue(savePending.then(() => ({ data: { checkin: { id: 'ci-1' } } })));

    // Press button - returns while network remains pending
    await user.press(screen.getByTestId('host-mode-toggle-on'));

    // Try to trigger focus refresh during pending save
    const focused = jest.fn().mockReturnValue(true);
    (useIsFocused as jest.Mock).mockImplementation(focused);
    focused.mockReturnValue(false);
    await rerender(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    focused.mockReturnValue(true);
    await rerender(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Should not start new GET during POST
    expect(getHootzaMock).toHaveBeenCalledTimes(1);

    // Resolve save and complete
    await act(async () => {
      resolveSave!();
    });

    // After POST completes, a refresh GET is expected
    expect(getHootzaMock).toHaveBeenCalledTimes(2);
  });
});

describe('stale response handling', () => {
  it('discards stale GET response after route ID changes', async () => {
    const params = { id: 'hz-1' };
    (useLocalSearchParams as jest.Mock).mockReturnValue(params);

    let resolveFirst: (value: any) => void;
    const firstFetch = new Promise(resolve => { resolveFirst = resolve; });
    getHootzaMock.mockReturnValueOnce(firstFetch);

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Change route ID - triggers new load() for hz-2
    params.id = 'hz-2';
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-2' });

    // Mock second fetch for hz-2 (returns loading state)
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          id: 'hz-2',
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

    // Resolve old request for hz-1 (should be discarded)
    await act(async () => {
      resolveFirst({
        data: {
          hootza: {
            ...hootzaBase(),
            id: 'hz-1',
            myHostMode: {
              state: 'open',
              available: true,
              accepted: true,
              serverTime: '2026-09-24T21:00:00Z',
              windowClosesAt: '2026-09-24T21:10:00Z',
            },
          },
        },
      });
    });

    // Should not display stale hz-1 open data
    expect(screen.queryByTestId('host-mode-open')).not.toBeOnTheScreen();
  });

  it('discards stale GET response after unmount', async () => {
    let resolveFirst: (value: any) => void;
    const firstFetch = new Promise(resolve => { resolveFirst = resolve; });
    getHootzaMock.mockReturnValueOnce(firstFetch);

    const { unmount } = await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // unmount() is async in v14
    await unmount();

    // Resolve after unmount
    await act(async () => {
      resolveFirst({
        data: {
          hootza: {
            ...hootzaBase(),
            myHostMode: {
              state: 'open',
              available: true,
              accepted: true,
              serverTime: '2026-09-24T21:00:00Z',
              windowClosesAt: '2026-09-24T21:10:00Z',
            },
          },
        },
      });
    });

    // Should not crash or update state
  });

  it('cleans up timers on unmount', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:10:00Z',
          },
        },
      },
    });
    const { unmount } = await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);
    expect(screen.getByTestId('host-mode-open')).toBeOnTheScreen();

    // unmount() is async in v14
    await unmount();

    // Verify timers cleaned up - should not throw
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  });
});

describe('stale rejected save handling', () => {
  it.each(['post', 'reconciliation'])('a rejected old %s cannot unlock the new event save', async (phase) => {
    const user = userEvent.setup();

    // Setup first event - waiting state
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });

    const { rerender } = await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Setup old save that will reject
    let rejectOld!: (error: Error) => void;
    const oldFailure = new Promise<never>((_resolve, reject) => { rejectOld = reject; });

    // Setup deferred promises for success paths
    let resolveFirst: (value: any) => void;
    const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
    let resolveSecond: (value: any) => void;
    const secondPromise = new Promise(resolve => { resolveSecond = resolve; });

    // Mock saves: first one depends on phase, second is always deferred
    saveMock
      .mockReturnValueOnce(phase === 'post' ? oldFailure : firstPromise)
      .mockReturnValueOnce(secondPromise);

    // If reconciliation phase, also mock the GET to fail
    if (phase === 'reconciliation') {
      getHootzaMock.mockReturnValueOnce(oldFailure);
    }

    // Press Off button for first event
    await user.press(screen.getByTestId('host-mode-toggle-off'));

    // For reconciliation, resolve POST and let reconciliation GET fail
    if (phase === 'reconciliation') {
      await act(async () => {
        resolveFirst!({ data: { checkin: {} } });
      });
    }

    // Switch to second event
    const params = { id: 'hz-2' };
    (useLocalSearchParams as jest.Mock).mockReturnValue(params);
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          id: 'hz-2',
          myHostMode: {
            state: 'waiting',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: null,
          },
        },
      },
    });

    await rerender(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Press Off button for second event
    await user.press(screen.getByTestId('host-mode-toggle-off'));

    // Now reject the old event save
    await act(async () => {
      rejectOld(new Error('Old event offline'));
    });

    // Track AppState listener
    let appListener: (state: string) => void = () => {};
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    if (addEventListenerSpy.mock.calls.length > 0) {
      const lastCall = addEventListenerSpy.mock.calls[addEventListenerSpy.mock.calls.length - 1];
      if (lastCall[1]) {
        appListener = lastCall[1] as any;
      }
    }

    // Foreground should NOT trigger GET during pending second save
    const beforeForeground = getHootzaMock.mock.calls.length;
    await act(async () => { appListener('background'); });
    await act(async () => { appListener('active'); });
    expect(getHootzaMock).toHaveBeenCalledTimes(beforeForeground);

    // Now resolve second save
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          id: 'hz-2',
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

    await act(async () => {
      resolveSecond!({ data: { checkin: { hostModeAccepted: false } } });
    });

    // Verify we're in off state with On button enabled
    expect(screen.getByTestId('host-mode-toggle-on')).toBeEnabled();
  });
});

describe('fail-closed display with manual opt-out', () => {
  it('allows accepted user to opt out when config duration is invalid', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          hostMode: { windowLengthMinutes: 0, isActive: true },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:05:00Z',
          },
        },
      },
    });

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Should not show open state
    expect(screen.queryByText("You're open")).toBeNull();
    expect(screen.getByTestId('host-mode-config-invalid')).toBeOnTheScreen();

    // Should show retry button
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeEnabled();

    // Should allow manual opt-out (RULES28.14)
    expect(screen.getByTestId('host-mode-toggle-off')).toBeEnabled();
  });

  it('allows accepted user to opt out when windowClosesAt is invalid', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          hostMode: { windowLengthMinutes: 5, isActive: true },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: 'invalid-timestamp',
          },
        },
      },
    });

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    // Should not show open state
    expect(screen.queryByText("You're open")).toBeNull();
    expect(screen.getByTestId('host-mode-timer-invalid')).toBeOnTheScreen();

    // Should show retry button
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeEnabled();

    // Should allow manual opt-out (RULES28.14)
    expect(screen.getByTestId('host-mode-toggle-off')).toBeEnabled();
  });

  it('does not show Off button for unaccepted user with invalid config', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          hostMode: { windowLengthMinutes: -1, isActive: true },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: false,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:05:00Z',
          },
        },
      },
    });

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    expect(screen.getByTestId('host-mode-config-invalid')).toBeOnTheScreen();
    expect(screen.getByTestId('host-mode-refresh-retry')).toBeEnabled();

    // Should NOT show Off button for unaccepted user
    expect(screen.queryByTestId('host-mode-toggle-off')).toBeNull();
  });

  it('uses exact "It\'s over when it\'s over." text in open state when no scheduled end', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          scheduledEndTime: null,
          hostMode: { windowLengthMinutes: 5, isActive: true },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:05:00Z',
          },
        },
      },
    });

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    expect(screen.getByTestId('host-mode-open')).toBeOnTheScreen();
    expect(screen.getByText(/It's over when it's over\./)).toBeOnTheScreen();
  });

  it('uses scheduled end text in open state when scheduled end exists', async () => {
    getHootzaMock.mockResolvedValue({
      data: {
        hootza: {
          ...hootzaBase(),
          scheduledEndTime: '2026-09-24T23:00:00Z',
          hostMode: { windowLengthMinutes: 5, isActive: true },
          myHostMode: {
            state: 'open',
            available: true,
            accepted: true,
            serverTime: '2026-09-24T21:00:00Z',
            windowClosesAt: '2026-09-24T21:05:00Z',
          },
        },
      },
    });

    await render(<ThemeProvider><HostModeWindowScreen /></ThemeProvider>);

    expect(screen.getByTestId('host-mode-open')).toBeOnTheScreen();
    expect(screen.getByText(/When the Hootza ends/)).toBeOnTheScreen();
    expect(screen.queryByText(/It's over when it's over\./)).toBeNull();
  });
});
