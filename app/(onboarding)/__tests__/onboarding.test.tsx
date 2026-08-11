/**
 * ⚠️ KNOWN FAILURE — 4 of 5 tests fail. DO NOT DELETE OR SKIP THIS FILE.
 *
 * Cause: React 19 + jest-expo 57 + @react-native/jest-preset do not wire up
 * IS_REACT_ACT_ENVIRONMENT. React discards async state updates, so screens
 * render nothing and queries find no elements.
 *
 * Errors: "The current testing environment is not configured to support
 * act(...)" and "You seem to have overlapping act() calls".
 *
 * Ruled out: AsyncStorage mock, SafeAreaView mock, API mock, ThemeProvider
 * wrapping, await placement on render/query, mockStorage leaking between
 * tests, setting the flag in jest.setup.js and in this file, and setting
 * testEnvironment explicitly. The setup file IS loaded and the flag IS set —
 * React does not read it.
 *
 * The Under 18 LOGIC is fully covered and passing in
 * src/__tests__/under18-gate.test.ts. What is untested here is rendering.
 *
 * Revisit when jest-expo supports React 19 act(). Ruled 2026-08-11.
 */

/**
 * ONBOARDING TESTS
 *
 * Tests for onboarding screen order and Under 18 hard stop
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

      const screen = await render(
        <ThemeProvider>
          <NameScreen />
        </ThemeProvider>
      );

      // Fill in name
      const nameInput = await screen.findByPlaceholderText('Your name');
      fireEvent.changeText(nameInput, 'Test User');

      // Fill in valid birthday (age 25)
      const today = new Date();
      const year = today.getFullYear() - 25;

      const monthInput = await screen.findByPlaceholderText('MM');
      const dayInput = await screen.findByPlaceholderText('DD');
      const yearInput = await screen.findByPlaceholderText('YYYY');

      fireEvent.changeText(monthInput, '01');
      fireEvent.changeText(dayInput, '01');
      fireEvent.changeText(yearInput, year.toString());

      // Press continue
      const continueButton = await screen.findByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(onboarding)/color');
      });
    });
  });

  describe('Under 18 Hard Stop', () => {
    it('routes to under-18 screen when birthday is under 18', async () => {
      const mockUpdateProfile = require('../../../src/api/client').api.user.updateProfile;
      mockUpdateProfile.mockResolvedValue({ data: {}, error: null });

      const screen = await render(
        <ThemeProvider>
          <NameScreen />
        </ThemeProvider>
      );

      // Fill in name
      const nameInput = await screen.findByPlaceholderText('Your name');
      fireEvent.changeText(nameInput, 'Test User');

      // Fill in under-18 birthday (age 16)
      const today = new Date();
      const year = today.getFullYear() - 16;

      const monthInput = await screen.findByPlaceholderText('MM');
      const dayInput = await screen.findByPlaceholderText('DD');
      const yearInput = await screen.findByPlaceholderText('YYYY');

      fireEvent.changeText(monthInput, '01');
      fireEvent.changeText(dayInput, '01');
      fireEvent.changeText(yearInput, year.toString());

      // Press continue
      const continueButton = await screen.findByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(onboarding)/under-18');
      });
    });

    it('does not allow continuing from Under 18 screen', async () => {
      const screen = await render(
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
      const screen = await render(
        <ThemeProvider>
          <Under18Screen />
        </ThemeProvider>
      );

      const goBackButton = await screen.findByText('Go back');
      fireEvent.press(goBackButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('displays Under 18 hard stop copy', async () => {
      const screen = await render(
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
  });
});
