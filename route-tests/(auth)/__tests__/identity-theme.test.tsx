import { Text } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../../../app/(auth)/index';
import SignInPhoneScreen from '../../../app/(auth)/sign-in-phone';
import SignInCodeScreen from '../../../app/(auth)/sign-in-code';
import { api } from '../../../src/api/client';
import { Colors, PickableColors, ThemeProvider, useTheme } from '../../../src/theme';
import { identityColorFromProfile } from '../../../src/theme/profile-color';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useLocalSearchParams: () => ({ phone: '+15551234567' }),
}));
jest.mock('../../../src/api/client', () => ({ api: {
  init: jest.fn(), hasSession: jest.fn(),
  user: { getProfile: jest.fn() }, auth: { verifyOTP: jest.fn() },
} }));

// SN-13: the entry screen holds the splash ~600ms past SPLASH_SEQUENCE_MS before it navigates; keep the wait minimal.
jest.mock('../../../src/components/consumer/SplashSequence', () => ({ SplashSequence: () => null, SPLASH_SEQUENCE_MS: 0 }));

function Appearance() {
  const { identityColor, contrast } = useTheme();
  return <Text>{`Identity ${identityColor}; background ${contrast.background}`}</Text>;
}

beforeEach(() => {
  jest.clearAllMocks();
  (api.init as jest.Mock).mockResolvedValue(undefined);
  (api.hasSession as jest.Mock).mockReturnValue(true);
});

it.each(PickableColors)('restores saved %s and its theme on startup', async (color) => {
  (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'returning', identityColor: color } });
  await render(<ThemeProvider><AuthScreen /><Appearance /></ThemeProvider>);
  expect(screen.getByText(`Identity ${color}; background ${color}`)).toBeOnTheScreen();
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), { timeout: 2000 });
});

it.each([null, {}, { identityColor: Colors.Fern }, { identityColor: 123 }, { identityColor: 'invalid' }])(
  'does not adopt a missing, semantic or invalid identity color: %j', (profile) => {
    expect(identityColorFromProfile(profile)).toBe(Colors.Purple);
  }
);

it('clears the prior account color when phone sign-in opens', async () => {
  await render(<ThemeProvider initialColor={Colors.Orange}><SignInPhoneScreen /><Appearance /></ThemeProvider>);
  expect(screen.getByText(`Identity ${Colors.Purple}; background ${Colors.Purple}`)).toBeOnTheScreen();
});

it('restores color after OTP before navigating into the app', async () => {
  (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 'session' } });
  (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'returning', identityColor: Colors.Emerald } });
  await render(<ThemeProvider><SignInCodeScreen /><Appearance /></ThemeProvider>);
  await fireEvent.changeText(screen.getByLabelText('Verification code'), '123456');
  await fireEvent.press(screen.getByText('Verify'));
  expect(api.user.getProfile).toHaveBeenCalledTimes(1);
  expect(screen.getByText(`Identity ${Colors.Emerald}; background ${Colors.Emerald}`)).toBeOnTheScreen();
  expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
});

it('uses the saved-session retry path if profile retrieval fails after OTP', async () => {
  (api.auth.verifyOTP as jest.Mock).mockResolvedValue({ data: { token: 'session' } });
  (api.user.getProfile as jest.Mock).mockResolvedValue({ error: { message: 'Offline' } });
  await render(<ThemeProvider><SignInCodeScreen /></ThemeProvider>);
  await fireEvent.changeText(screen.getByLabelText('Verification code'), '123456');
  await fireEvent.press(screen.getByText('Verify'));
  expect(mockReplace).toHaveBeenCalledWith('/(auth)');
  expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
});
