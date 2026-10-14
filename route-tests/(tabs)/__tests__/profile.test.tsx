/**
 * SETTINGS SCREEN TESTS
 *
 * Tests Settings screen with disabled/enabled rows, sign out, and icebreakers count.
 *
 * RNTL v14: All operations async, use imported screen.
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react-native';
import SettingsScreen from '../../../app/(tabs)/profile';
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
    icebreakers: {
      getMyAnswers: jest.fn(() =>
        Promise.resolve({
          data: {
            answers: [
              { questionId: 'q1' },
              { questionId: 'q2' },
              { questionId: 'q3' },
              { questionId: 'q4' },
              { questionId: 'q5' },
              { questionId: 'q6' },
            ],
          },
        })
      ),
    },
  },
}));

// Hello Admin entry (VERTICAL-BUILD-10): drawn only when the server says this account holds a section.
jest.mock('../../../src/api/admin', () => ({ getAdminMe: jest.fn() }));
// Row values (blocked count, notifications summary, strikes) come from the account client, not the mocked api object.
jest.mock('../../../src/api/account', () => ({
  ...jest.requireActual('../../../src/api/account'),
  getBlocks: jest.fn(() => Promise.resolve({ data: { blocks: [] } })),
  getMyStrikes: jest.fn(() => Promise.resolve({ data: { active: 0 } })),
  getNotificationPreferences: jest.fn(() => Promise.resolve({ error: { message: 'offline' } })),
}));
import { getAdminMe } from '../../../src/api/admin';
const mockGetAdminMe = getAdminMe as jest.Mock;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminMe.mockResolvedValue({ data: { permissions: [], sections: [], isSuperAdmin: false, twoFactorEnabled: false, twoFactorEnforced: false } });
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

  it.each([
    ['settings-edit-profile', '/profile/edit'],
    ['settings-strikes', '/profile/strikes'],
    ['settings-notifications', '/profile/notifications'],
    ['settings-host-mode', '/profile/host-mode'],
    ['settings-romance', '/profile/romance'],
    ['settings-add-role', '/profile/add-role'],
    ['settings-blocked', '/profile/blocked'],
    ['settings-terms', '/profile/legal?slug=terms'],
    ['settings-privacy', '/profile/legal?slug=privacy'],
    ['settings-drawing-rules', '/profile/legal?slug=drawing_rules'],
    ['settings-contact', '/profile/contact'],
    ['settings-delete-account', '/profile/delete-account'],
  ])('%s row is live and opens %s', async (testID, path) => {
    await render(<SettingsScreen />);
    await fireEvent.press(await screen.findByTestId(testID));
    expect(mockPush).toHaveBeenCalledWith(path);
  });

  it.each([
    ['settings-safety', '/(encounter)/safety?from=settings'],
    ['settings-gender', '/(onboarding)/gender?edit=1'],
    ['settings-find-hello-hangout', '/(hangout)/directory'],
    ['settings-your-hello-hangout', '/(hangout)/dashboard'],
    ['settings-groups', '/(organization)'],
    ['settings-ambassador', '/(ambassador)'],
    ['settings-creator', '/(influencer)'],
  ])('%s row opens %s', async (testID, path) => {
    await render(<SettingsScreen />);
    await fireEvent.press(await screen.findByTestId(testID));
    expect(mockPush).toHaveBeenCalledWith(path);
  });

  it('shows the blocked count read from the account client', async () => {
    const account = jest.requireMock('../../../src/api/account');
    account.getBlocks.mockResolvedValueOnce({ data: { blocks: [{ id: 'b1' }, { id: 'b2' }] } });
    await render(<SettingsScreen />);
    await waitFor(() => expect(within(screen.getByTestId('settings-blocked')).getByText('2')).toBeTruthy());
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

  it('every settings row is enabled (none is a disabled placeholder any more)', async () => {
    await render(<SettingsScreen />);
    const ids = ['notifications', 'host-mode', 'blocked', 'terms', 'privacy', 'drawing-rules', 'delete-account', 'contact', 'strikes'];
    ids.forEach((id) => {
      const state = screen.getByTestId(`settings-${id}`).props.accessibilityState;
      expect(state?.disabled).toBeFalsy();
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

  it('has no Hello Admin row for an ordinary account, and a failed check draws none either', async () => {
    await render(<SettingsScreen />);
    await screen.findByText('Alex Chen');
    expect(screen.queryByTestId('settings-hello-admin')).not.toBeOnTheScreen();
    mockGetAdminMe.mockRejectedValueOnce(new Error('offline'));
    await render(<SettingsScreen />);
    await screen.findAllByText('Alex Chen');
    expect(screen.queryByTestId('settings-hello-admin')).not.toBeOnTheScreen();
  });

  it('draws the Hello Admin row when the server says this account holds a section, and it opens Hello Admin', async () => {
    mockGetAdminMe.mockResolvedValue({ data: { permissions: ['audit.view'], sections: ['audit'], isSuperAdmin: false, twoFactorEnabled: false, twoFactorEnforced: false } });
    await render(<SettingsScreen />);
    const row = await screen.findByTestId('settings-hello-admin');
    await fireEvent.press(row);
    expect(mockPush).toHaveBeenCalledWith('/(admin)');
  });

  it('never shows distance (§8.12)', async () => {
    const { container } = await render(<SettingsScreen />);

    const text = JSON.stringify(container);
    expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
    expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
  });
});
