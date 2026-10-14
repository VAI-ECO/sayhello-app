/**
 * ONBOARDING TESTS
 *
 * Tests for onboarding screen order and Under 18 hard stop
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import NameScreen from '../name';
import Under18Screen from '../under-18';
import { ThemeProvider } from '../../../src/theme';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock API client
jest.mock('../../../src/api/client', () => ({
  api: {
    user: {
      updateProfile: jest.fn(),
    },
  },
}));

// Mock AsyncStorage
const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) || null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
  },
}));

describe('Onboarding Flow', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;

  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  describe('Screen Order', () => {
    it('routes from name to color (before photo)', async () => {
      const mockUpdateProfile = require('../../../src/api/client').api.user.updateProfile;
      mockUpdateProfile.mockResolvedValue({ data: {}, error: null });

      await render(
        <ThemeProvider>
          <NameScreen />
        </ThemeProvider>
      );

      // Fill in name
      const nameInput = await screen.findByPlaceholderText('Your name');
      await fireEvent.changeText(nameInput, 'Test User');

      // Fill in valid birthday (age 25)
      const today = new Date();
      const year = today.getFullYear() - 25;

      const monthInput = await screen.findByPlaceholderText('MM');
      const dayInput = await screen.findByPlaceholderText('DD');
      const yearInput = await screen.findByPlaceholderText('YYYY');

      await fireEvent.changeText(monthInput, '01');
      await fireEvent.changeText(dayInput, '01');
      await fireEvent.changeText(yearInput, year.toString());

      // Press continue
      const continueButton = await screen.findByText('Continue');
      await fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(onboarding)/color');
      });
    });
  });

  describe('Under 18 Hard Stop', () => {
    it('routes to under-18 screen when birthday is under 18', async () => {
      const mockUpdateProfile = require('../../../src/api/client').api.user.updateProfile;
      mockUpdateProfile.mockResolvedValue({ data: {}, error: null });

      await render(
        <ThemeProvider>
          <NameScreen />
        </ThemeProvider>
      );

      // Fill in name
      const nameInput = await screen.findByPlaceholderText('Your name');
      await fireEvent.changeText(nameInput, 'Test User');

      // Fill in under-18 birthday (age 16)
      const today = new Date();
      const year = today.getFullYear() - 16;

      const monthInput = await screen.findByPlaceholderText('MM');
      const dayInput = await screen.findByPlaceholderText('DD');
      const yearInput = await screen.findByPlaceholderText('YYYY');

      await fireEvent.changeText(monthInput, '01');
      await fireEvent.changeText(dayInput, '01');
      await fireEvent.changeText(yearInput, year.toString());

      // Press continue
      const continueButton = await screen.findByText('Continue');
      await fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(onboarding)/under-18');
      });
    });

    it('does not allow continuing from Under 18 screen', async () => {
      await render(
        <ThemeProvider>
          <Under18Screen />
        </ThemeProvider>
      );

      // Wait for component to finish loading (useEffect with AsyncStorage)
      await waitFor(() => {
        expect(screen.queryByText('Come back and see us.')).toBeTruthy();
      });

      // Verify no Continue button exists
      const buttons = screen.queryByText('Continue');
      expect(buttons).toBeNull();

      // Only "Go back" button should exist (first attempt)
      const goBackButton = await screen.findByText('Go back');
      expect(goBackButton).toBeTruthy();
    });

    it('allows going back from Under 18 screen', async () => {
      await render(
        <ThemeProvider>
          <Under18Screen />
        </ThemeProvider>
      );

      const goBackButton = await screen.findByText('Go back');
      await fireEvent.press(goBackButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('displays Under 18 hard stop copy', async () => {
      await render(
        <ThemeProvider>
          <Under18Screen />
        </ThemeProvider>
      );

      // Verify title (wait for async load)
      expect(await screen.findByText('Come back and see us.')).toBeTruthy();

      // Verify body paragraphs
      expect(screen.getByText(/Say Hello is built for people 18 and up/)).toBeTruthy();
      expect(screen.getByText(/If you got the date wrong/)).toBeTruthy();

      // Verify actions
      expect(screen.getByText('Go back')).toBeTruthy();
      expect(screen.getByText('Close the app')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <Under18Screen />
        </ThemeProvider>
      );

      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
