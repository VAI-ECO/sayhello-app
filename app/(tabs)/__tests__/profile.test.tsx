/**
 * SETTINGS SCREEN TESTS
 *
 * Tests Settings screen with disabled/enabled rows, sign out, and icebreakers count.
 *
 * RNTL v14: All operations async, use imported screen.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../profile';
import * as mockIcebreakersData from '../../../src/data/mockIcebreakersData';
import { api } from '../../../src/api/client';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock ThemeProvider to return a consistent identity color
jest.mock('../../../src/theme', () => ({
  ...jest.requireActual('../../../src/theme'),
  useTheme: () => ({
    identityColor: '#8E24AA', // Purple
    contrast: {
      background: '#F7F6F4',
      foreground: '#1F1E1C',
    },
    setIdentityColor: jest.fn(),
  }),
}));

// Mock API client
jest.mock('../../../src/api/client', () => ({
  api: {
    auth: {
      signOut: jest.fn(() => Promise.resolve()),
    },
    user: {
      getProfile: jest.fn(() =>
        Promise.resolve({
          data: {
            id: 'test-user',
            displayName: 'Alex Chen',
            phoneNumber: '+1 (555) 123-4567',
            dateOfBirth: '1990-01-01',
            drawingNumber: 'AB-123456',
          },
        })
      ),
    },
  },
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock icebreakers data with 6 answers
    jest.spyOn(mockIcebreakersData, 'getMockIcebreakerAnswers').mockReturnValue([
      { node_id: 'q1', text: 'Answer 1', updated_at: '2024-01-01T00:00:00Z' },
      { node_id: 'q2', text: 'Answer 2', updated_at: '2024-01-01T00:00:00Z' },
      { node_id: 'q3', text: 'Answer 3', updated_at: '2024-01-01T00:00:00Z' },
      { node_id: 'q4', text: 'Answer 4', updated_at: '2024-01-01T00:00:00Z' },
      { node_id: 'q5', text: 'Answer 5', updated_at: '2024-01-01T00:00:00Z' },
      { node_id: 'q6', text: 'Answer 6', updated_at: '2024-01-01T00:00:00Z' },
    ]);
  });

  it('renders header with user name', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Alex Chen')).toBeTruthy();
  });

  it('renders header with phone number and color name', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('+1 (555) 123-4567 · Purple')).toBeTruthy();
  });

  it('renders all section headers', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('The app')).toBeTruthy();
    expect(screen.getByText('What you share')).toBeTruthy();
    expect(screen.getByText('People')).toBeTruthy();
    expect(screen.getByText('The small print')).toBeTruthy();
  });

  it('renders Icebreakers count from real state', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('6 answered')).toBeTruthy();
  });

  it('Icebreakers row navigates to /profile/icebreakers', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-icebreakers');
    await fireEvent.press(row);
    expect(mockPush).toHaveBeenCalledWith('/profile/icebreakers');
  });

  it('disabled notifications row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-notifications');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled host mode row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-host-mode');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled blocked row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-blocked');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled terms row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-terms');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled privacy row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-privacy');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled drawing rules row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-drawing-rules');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disabled delete account row does not navigate', async () => {
    await render(<SettingsScreen />);
    const row = screen.getByTestId('settings-delete-account');
    await fireEvent.press(row);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('sign out calls api.auth.signOut()', async () => {
    await render(<SettingsScreen />);
    const signOutButton = screen.getByTestId('settings-sign-out');
    await fireEvent.press(signOutButton);
    expect(api.auth.signOut).toHaveBeenCalled();
  });

  it('sign out navigates to sign-in screen', async () => {
    await render(<SettingsScreen />);
    const signOutButton = screen.getByTestId('settings-sign-out');
    await fireEvent.press(signOutButton);

    // Wait for async signOut and navigation to complete
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in-phone');
    });
  });

  it('disabled rows have accessibilityState disabled', async () => {
    await render(<SettingsScreen />);

    const disabledRows = [
      screen.getByTestId('settings-notifications'),
      screen.getByTestId('settings-host-mode'),
      screen.getByTestId('settings-blocked'),
      screen.getByTestId('settings-terms'),
      screen.getByTestId('settings-privacy'),
      screen.getByTestId('settings-drawing-rules'),
      screen.getByTestId('settings-delete-account'),
    ];

    disabledRows.forEach(row => {
      expect(row.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('enabled rows have accessibilityState not disabled', async () => {
    await render(<SettingsScreen />);

    const enabledRows = [
      screen.getByTestId('settings-icebreakers'),
      screen.getByTestId('settings-sign-out'),
    ];

    enabledRows.forEach(row => {
      expect(row.props.accessibilityState.disabled).toBe(false);
    });
  });

  it('all rows have accessibilityRole button', async () => {
    await render(<SettingsScreen />);

    const allRows = [
      screen.getByTestId('settings-notifications'),
      screen.getByTestId('settings-host-mode'),
      screen.getByTestId('settings-icebreakers'),
      screen.getByTestId('settings-blocked'),
      screen.getByTestId('settings-terms'),
      screen.getByTestId('settings-privacy'),
      screen.getByTestId('settings-drawing-rules'),
      screen.getByTestId('settings-sign-out'),
      screen.getByTestId('settings-delete-account'),
    ];

    allRows.forEach(row => {
      expect(row.props.accessibilityRole).toBe('button');
    });
  });

  it('never shows distance (§8.12)', async () => {
    const { container } = await render(<SettingsScreen />);

    const text = JSON.stringify(container);
    expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
    expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
  });
});
