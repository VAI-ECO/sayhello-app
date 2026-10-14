/**
 * Notification primer: when the person denies, ONE dismissible banner links to settings; nothing is blocked.
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import NotificationsScreen from '../../../app/(onboarding)/notifications';
import { resetNotificationsDeniedBanner } from '../../../src/components/consumer/NotificationsDeniedBanner';
import { ThemeProvider } from '../../../src/theme';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
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
jest.mock('../../../src/lib/push-registration', () => ({ registerPushToken: jest.fn() }));

const renderScreen = async () => render(<ThemeProvider><NotificationsScreen /></ThemeProvider>);

describe('Notifications denied banner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetNotificationsDeniedBanner();
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
  });

  it('shows no banner while the choice is undecided', async () => {
    await renderScreen();
    await waitFor(() => expect(Notifications.getPermissionsAsync).toHaveBeenCalled());
    expect(screen.queryByTestId('notifications-denied-banner')).toBeNull();
  });

  it('shows one banner after a denial, does not block, and links to settings', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    await renderScreen();
    await fireEvent.press(screen.getByText('Allow Notifications'));
    await waitFor(() => expect(screen.getAllByTestId('notifications-denied-banner')).toHaveLength(1));
    expect(mockPush).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('notifications-denied-settings'));
    expect(open).toHaveBeenCalled();

    // Not blocked: asking again continues onboarding.
    await fireEvent.press(screen.getByText('Allow Notifications'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(onboarding)/icebreakers'));
  });

  it('dismisses and stays dismissed', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    await renderScreen();
    await fireEvent.press(screen.getByText('Allow Notifications'));
    await waitFor(() => screen.getByTestId('notifications-denied-banner'));
    await fireEvent.press(screen.getByTestId('notifications-denied-dismiss'));
    expect(screen.queryByTestId('notifications-denied-banner')).toBeNull();
  });

  it('shows the banner on arrival when the OS already says denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    await renderScreen();
    await waitFor(() => expect(screen.getAllByTestId('notifications-denied-banner')).toHaveLength(1));
  });
});
