/**
 * ONBOARDING TESTS
 *
 * Tests for onboarding screen order and Under 18 hard stop
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import NameScreen from '../../../app/(onboarding)/name';
import PhotoScreen from '../../../app/(onboarding)/photo';
import ColorScreen from '../../../app/(onboarding)/color';
import Under18Screen from '../../../app/(onboarding)/under-18';
import { ThemeProvider } from '../../../src/theme';

// A real 1×1 PNG, as the picker returns it with { base64: true }.
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aI9sAAAAASUVORK5CYII=';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{
      uri: 'file:///test-photo.png',
      mimeType: 'image/png',
      base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aI9sAAAAASUVORK5CYII=',
    }],
  }),
}));

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
    // name.tsx reads GET /public/config (minimumAge) through the account client.
    get: jest.fn(() => Promise.resolve({ data: { minimumAge: 18 } })),
    user: {
      updateProfile: jest.fn(),
      uploadProfilePhoto: jest.fn(),
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
    it('routes from name to photo (before color)', async () => {
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
        expect(mockPush).toHaveBeenCalledWith('/(onboarding)/photo');
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        displayName: 'Test User',
        dateOfBirth: `${year}-01-01`,
      });
    });

    it('routes from skipped photo to color', async () => {
      await render(<ThemeProvider><PhotoScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByText('Skip for now'));
      expect(mockPush).toHaveBeenCalledWith('/(onboarding)/color');
    });

    // VERTICAL-BUILD-02, authorized replacement of the former
    // `updateProfile({ photoUri })` assertion: PATCH /users/me silently strips
    // photoUri, so that call "succeeded" while storing nothing. The contract
    // is now the real bytes to POST /users/me/photo, and no URI call at all.
    it('uploads the picked photo bytes, never a device URI, then routes to color', async () => {
      const { updateProfile, uploadProfilePhoto } = require('../../../src/api/client').api.user;
      uploadProfilePhoto.mockResolvedValue({ data: { profilePhotoUrl: 'https://storage.example/signed' } });
      await render(<ThemeProvider><PhotoScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByText('Choose from library'));
      await fireEvent.press(await screen.findByText('Continue'));

      expect(uploadProfilePhoto).toHaveBeenCalledTimes(1);
      const [bytes, contentType] = uploadProfilePhoto.mock.calls[0];
      expect(contentType).toBe('image/png');
      expect(Buffer.from(bytes)).toEqual(Buffer.from(PNG_BASE64, 'base64'));
      expect(updateProfile).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/(onboarding)/color');
    });

    it('stays on photo with a visible error when the upload fails, and retries the same bytes', async () => {
      const { uploadProfilePhoto } = require('../../../src/api/client').api.user;
      uploadProfilePhoto
        .mockResolvedValueOnce({ error: { message: 'Could not store your photo. Please try again.' } })
        .mockResolvedValueOnce({ data: { profilePhotoUrl: 'https://storage.example/signed' } });
      await render(<ThemeProvider><PhotoScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByText('Choose from library'));
      await fireEvent.press(await screen.findByText('Continue'));

      expect(screen.getByText('Could not store your photo. Please try again.')).toBeOnTheScreen();
      expect(screen.getByText('Skip for now')).toBeOnTheScreen();
      expect(mockPush).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByText('Continue'));
      expect(uploadProfilePhoto).toHaveBeenCalledTimes(2);
      expect(Buffer.from(uploadProfilePhoto.mock.calls[1][0])).toEqual(Buffer.from(PNG_BASE64, 'base64'));
      expect(mockPush).toHaveBeenCalledWith('/(onboarding)/color');
    });

    it('sends the typed birthday for the server age check and shows the hard stop when the server refuses it', async () => {
      const { updateProfile } = require('../../../src/api/client').api.user;
      updateProfile.mockResolvedValue({ error: { code: 'age_requirement_not_met', message: 'You must meet the minimum age to use Say Hello.' } });
      await render(<ThemeProvider><NameScreen /></ThemeProvider>);
      const year = new Date().getFullYear() - 19;
      await fireEvent.changeText(await screen.findByPlaceholderText('Your name'), 'Test User');
      await fireEvent.changeText(screen.getByPlaceholderText('MM'), '03');
      await fireEvent.changeText(screen.getByPlaceholderText('DD'), '04');
      await fireEvent.changeText(screen.getByPlaceholderText('YYYY'), String(year));
      await fireEvent.press(screen.getByText('Continue'));

      expect(updateProfile).toHaveBeenCalledWith({ displayName: 'Test User', dateOfBirth: `${year}-03-04` });
      expect(mockPush).toHaveBeenCalledWith('/(onboarding)/under-18');
      expect(mockPush).not.toHaveBeenCalledWith('/(onboarding)/photo');
    });

    it('reads "Have another go." after a refused birthday and keeps the correction open (NEW-ONB-06)', async () => {
      const { updateProfile } = require('../../../src/api/client').api.user;
      updateProfile.mockResolvedValue({ error: { code: 'age_requirement_not_met', message: 'x' } });
      await render(<ThemeProvider><NameScreen /></ThemeProvider>);
      const year = new Date().getFullYear() - 19;
      await fireEvent.changeText(await screen.findByPlaceholderText('Your name'), 'Test User');
      await fireEvent.changeText(screen.getByPlaceholderText('MM'), '03');
      await fireEvent.changeText(screen.getByPlaceholderText('DD'), '04');
      await fireEvent.changeText(screen.getByPlaceholderText('YYYY'), String(year));
      await fireEvent.press(screen.getByText('Continue'));
      expect(await screen.findByText('Have another go.')).toBeTruthy();
      expect(screen.getByText('That looks right')).toBeTruthy();
    });

    it('refuses a date that does not exist without calling the server', async () => {
      const { updateProfile } = require('../../../src/api/client').api.user;
      await render(<ThemeProvider><NameScreen /></ThemeProvider>);
      await fireEvent.changeText(await screen.findByPlaceholderText('Your name'), 'Test User');
      await fireEvent.changeText(screen.getByPlaceholderText('MM'), '02');
      await fireEvent.changeText(screen.getByPlaceholderText('DD'), '31');
      await fireEvent.changeText(screen.getByPlaceholderText('YYYY'), '1990');
      await fireEvent.press(screen.getByText('Continue'));

      expect(screen.getByText('Enter a real date')).toBeOnTheScreen();
      expect(updateProfile).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('routes from confirmed color to gender and pronouns after saving', async () => {
      const updateProfile = require('../../../src/api/client').api.user.updateProfile;
      updateProfile.mockResolvedValue({ data: {}, error: null });
      await render(<ThemeProvider><ColorScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByText('Continue'));
      expect(mockPush).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByText('Continue'));
      expect(updateProfile).toHaveBeenCalledWith({ identityColor: '#8E24AA' });
      expect(mockPush).toHaveBeenCalledWith('/(onboarding)/gender');
    });

    it('keeps color open and shows the error when saving fails', async () => {
      const updateProfile = require('../../../src/api/client').api.user.updateProfile;
      updateProfile.mockResolvedValue({ error: { message: 'Unable to save color' } });
      await render(<ThemeProvider><ColorScreen /></ThemeProvider>);
      await fireEvent.press(screen.getByText('Continue'));
      await fireEvent.press(screen.getByText('Continue'));
      expect(screen.getByText('Unable to save color')).toBeTruthy();
      expect(mockPush).not.toHaveBeenCalled();
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
