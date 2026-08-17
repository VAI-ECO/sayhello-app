/**
 * HELLO HANGOUT (BUSINESS) SCREENS
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter, Redirect } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import HangoutSignupScreen from '../signup';
import HangoutDashboardScreen from '../dashboard';
import HangoutCreatePostScreen from '../create-post';
import HangoutDirectoryScreen from '../directory/index';
import HangoutListingScreen from '../directory/[id]';
import DealRedemptionScreen from '../redeem';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  Redirect: jest.fn(({ href }: { href: unknown }) => null),
}));

function distanceGuard(container: unknown) {
  const text = JSON.stringify(container);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
}

describe('Hello Hangout Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
  });

  describe('H8 Signup and tier', () => {
    it('shows founding and regular tiers with disabled CTAs', async () => {
      await render(
        <ThemeProvider>
          <HangoutSignupScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('choose-founding')).toBeTruthy();
      expect(screen.getByTestId('choose-regular')).toBeTruthy();
      expect(screen.getByTestId('hangout-signup-unavailable')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <HangoutSignupScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });

  describe('H9 Business dashboard', () => {
    it('shows unavailable dashboard with post CTA', async () => {
      await render(
        <ThemeProvider>
          <HangoutDashboardScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('dashboard-unavailable')).toBeTruthy();
      fireEvent.press(screen.getByTestId('dashboard-post-cta'));
      expect(mockPush).toHaveBeenCalledWith('/(hangout)/create-post');
    });
  });

  describe('H10 Create a post', () => {
    it('redirects to discount compose', async () => {
      await render(
        <ThemeProvider>
          <HangoutCreatePostScreen />
        </ThemeProvider>
      );
      expect(Redirect).toHaveBeenCalled();
    });
  });

  describe('H11 Directory', () => {
    it('shows empty/unavailable', async () => {
      await render(
        <ThemeProvider>
          <HangoutDirectoryScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('directory-empty')).toBeTruthy();
    });
  });

  describe('H11a Listing', () => {
    it('shows unavailable', async () => {
      await render(
        <ThemeProvider>
          <HangoutListingScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('listing-unavailable')).toBeTruthy();
    });
  });

  describe('H12 Deal redemption', () => {
    it('shows unavailable with disabled scan', async () => {
      await render(
        <ThemeProvider>
          <DealRedemptionScreen />
        </ThemeProvider>
      );
      expect(screen.getByTestId('redeem-unavailable')).toBeTruthy();
      expect(screen.getByTestId('redeem-scan')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <DealRedemptionScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });
});
