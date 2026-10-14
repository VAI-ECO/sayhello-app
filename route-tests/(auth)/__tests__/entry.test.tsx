import { render, screen, fireEvent } from '@testing-library/react-native';
import AuthScreen from '../../../app/(auth)/index';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('../../../src/api/client', () => ({ api: { init: jest.fn(), hasSession: jest.fn(), user: { getProfile: jest.fn() } } }));

beforeEach(() => { jest.clearAllMocks(); (api.init as jest.Mock).mockResolvedValue(undefined); });

it('sends a signed-out user to phone entry without fetching a profile', async () => {
  (api.hasSession as jest.Mock).mockReturnValue(false);
  await render(<ThemeProvider><AuthScreen /></ThemeProvider>);
  expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in-phone');
  expect(api.user.getProfile).not.toHaveBeenCalled();
});

it('restores a server-validated saved session', async () => {
  (api.hasSession as jest.Mock).mockReturnValue(true);
  (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u1' } });
  await render(<ThemeProvider><AuthScreen /></ThemeProvider>);
  expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
});

it('does not treat a network failure as logout and can retry', async () => {
  (api.hasSession as jest.Mock).mockReturnValue(true);
  (api.user.getProfile as jest.Mock).mockResolvedValueOnce({ error: { message: 'Offline' } }).mockResolvedValueOnce({ data: { id: 'u1' } });
  await render(<ThemeProvider><AuthScreen /></ThemeProvider>);
  expect(screen.getByText('Offline')).toBeOnTheScreen();
  expect(mockReplace).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
});

it('returns an expired session to sign-in', async () => {
  (api.hasSession as jest.Mock).mockReturnValue(true);
  (api.user.getProfile as jest.Mock).mockResolvedValue({ error: { status: 401 } });
  await render(<ThemeProvider><AuthScreen /></ThemeProvider>);
  expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in-phone');
});
