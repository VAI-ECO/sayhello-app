/**
 * Delete my account: the screen names the role(s) that hold the account open when the server says which
 * (migration 302), falls back to the plain refusal when it does not, and signs out only after a real deletion.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import DeleteAccountScreen from '../../../../app/(tabs)/profile/delete-account';
import { ThemeProvider } from '../../../../src/theme';
import { api } from '../../../../src/api/client';
import { deleteMyAccount } from '../../../../src/api/account';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: mockReplace, canGoBack: () => true }),
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
jest.mock('../../../../src/api/client', () => ({ api: { auth: { signOut: jest.fn(() => Promise.resolve({ serverRevoked: true })) } } }));
jest.mock('../../../../src/api/account', () => ({
  ...jest.requireActual('../../../../src/api/account'),
  deleteMyAccount: jest.fn(),
}));

const renderScreen = async () => render(<ThemeProvider><DeleteAccountScreen /></ThemeProvider>);
async function confirmAndDelete() {
  await fireEvent.press(screen.getByTestId('delete-confirm-check'));
  await fireEvent.press(screen.getByTestId('delete-confirm-button'));
}

describe('Delete my account', () => {
  beforeEach(() => jest.clearAllMocks());

  it('names the roles holding the account open and does not sign out', async () => {
    (deleteMyAccount as jest.Mock).mockResolvedValue({
      error: { code: 'account_role_active', message: 'x', body: { blockedBy: ['creator', 'organization_lead', 'nonsense'] } },
    });
    await renderScreen();
    await confirmAndDelete();
    const error = await screen.findByTestId('delete-error');
    expect(error.props.children).toContain('Creator, Organization lead');
    expect(error.props.children).not.toContain('nonsense');
    expect(api.auth.signOut).not.toHaveBeenCalled();
  });

  it('gives the plain refusal when the server names no role', async () => {
    (deleteMyAccount as jest.Mock).mockResolvedValue({ error: { code: 'account_role_active', message: 'x' } });
    await renderScreen();
    await confirmAndDelete();
    const error = await screen.findByTestId('delete-error');
    expect(error.props.children).toContain('Contact Say Hello to close it.');
    expect(error.props.children).not.toContain('Roles on this account');
  });

  it('signs out and returns to sign-in only after the server deleted the account', async () => {
    (deleteMyAccount as jest.Mock).mockResolvedValue({ data: { deleted: true } });
    await renderScreen();
    await confirmAndDelete();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in-phone'));
    expect(api.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
