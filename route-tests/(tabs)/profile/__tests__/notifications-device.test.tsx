/**
 * Settings → Notifications: the "On this phone" section reads the real OS permission, lets someone who has not
 * decided turn it on, and sends someone who refused to the phone's Settings. Denied is not blocked (RULES §26.5).
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import NotificationsScreen from '../../../../app/(tabs)/profile/notifications';
import { registerPushToken } from '../../../../src/lib/push-registration';
import { ThemeProvider } from '../../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
}));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
jest.mock('../../../../src/lib/push-registration', () => ({ registerPushToken: jest.fn() }));
jest.mock('../../../../src/api/account', () => ({
  ...jest.requireActual('../../../../src/api/account'),
  getNotificationPreferences: jest.fn(),
  saveNotificationPreferences: jest.fn(),
}));
import { getNotificationPreferences } from '../../../../src/api/account';

const renderScreen = async () => render(<ThemeProvider><NotificationsScreen /></ThemeProvider>);

describe('Settings → Notifications → On this phone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getNotificationPreferences as jest.Mock).mockResolvedValue({
      data: { preferences: { helloNudges: true, helloReveals: true, chatMessages: true, hootzaUpdates: true, placesActivity: true } },
    });
  });

  it('says notifications are allowed, with nothing to press', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
    await renderScreen();
    await waitFor(() => expect(screen.getByTestId('notif-device-state')).toBeTruthy());
    expect(screen.queryByTestId('notif-device-turn-on')).toBeNull();
    expect(screen.queryByTestId('notif-device-open-settings')).toBeNull();
  });

  it('lets someone who has not decided turn it on, then registers this phone', async () => {
    (Notifications.getPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ status: 'undetermined', canAskAgain: true })
      .mockResolvedValue({ status: 'granted', canAskAgain: true });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await renderScreen();
    await fireEvent.press(await screen.findByTestId('notif-device-turn-on'));
    await waitFor(() => expect(registerPushToken).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByTestId('notif-device-turn-on')).toBeNull());
  });

  it('after a refusal the phone will not ask again: offers Settings and nothing blocks', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: false });
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    await renderScreen();
    expect(await screen.findByTestId('notif-device-open-settings')).toBeTruthy();
    expect(screen.queryByTestId('notif-device-turn-on')).toBeNull();
    await fireEvent.press(screen.getByTestId('notif-device-open-settings'));
    expect(open).toHaveBeenCalled();
    // The in-app choices are still there and usable.
    expect(screen.getByTestId('notif-helloNudges')).toBeTruthy();
    expect(registerPushToken).not.toHaveBeenCalled();
  });

  it('leaves the section out when the phone permission cannot be read', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(new Error('unavailable'));
    await renderScreen();
    await waitFor(() => expect(screen.getByTestId('notif-helloNudges')).toBeTruthy());
    expect(screen.queryByTestId('notif-device')).toBeNull();
  });
});
