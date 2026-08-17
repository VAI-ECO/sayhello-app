/**
 * INFLUENCER SCREENS
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../src/api/codes', () => ({
  checkCodeAvailability: jest.fn(),
  setInfluencerCode: jest.fn(),
  getMyCodes: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

import { checkCodeAvailability, setInfluencerCode } from '../../../src/api/codes';
import InfluencerEarningsScreen from '../earnings';
import PickCodeScreen from '../pick-code';
import CodeTakenScreen from '../code-taken';

function distanceGuard(container: unknown) {
  const text = JSON.stringify(container);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
  expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
}

describe('Influencer Screens', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockBack = jest.fn();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  describe('Two streams earnings', () => {
    it('shows unavailable earnings dashboard', async () => {
      await render(
        <ThemeProvider>
          <InfluencerEarningsScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('influencer-earnings-unavailable')).toBeTruthy();
      expect(screen.getByTestId('influencer-paid-card')).toBeTruthy();
      expect(screen.getByTestId('influencer-building-card')).toBeTruthy();
    });

    it('never shows distance (§8.12)', async () => {
      const { container } = await render(
        <ThemeProvider>
          <InfluencerEarningsScreen />
        </ThemeProvider>
      );
      distanceGuard(container);
    });
  });

  describe('Pick a code', () => {
    it('checks availability and shows available state', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });

      await render(
        <ThemeProvider>
          <PickCodeScreen />
        </ThemeProvider>
      );

      fireEvent.changeText(screen.getByTestId('code-input'), 'MYCODE');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('MYCODE');
      });
      fireEvent.press(screen.getByTestId('code-check'));

      await waitFor(() => {
        expect(checkCodeAvailability).toHaveBeenCalledWith('MYCODE');
      });
      expect(await screen.findByTestId('code-available')).toBeTruthy();
    });

    it('navigates to taken screen when unavailable', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: false, reason: 'taken_influencer' },
      });

      await render(
        <ThemeProvider>
          <PickCodeScreen />
        </ThemeProvider>
      );

      fireEvent.changeText(screen.getByTestId('code-input'), 'TAKEN');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('TAKEN');
      });
      fireEvent.press(screen.getByTestId('code-check'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/(influencer)/code-taken',
          params: { code: 'TAKEN' },
        });
      });
    });

    it('takes code when available', async () => {
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });
      (setInfluencerCode as jest.Mock).mockResolvedValue({
        data: { code: 'MYCODE' },
      });

      await render(
        <ThemeProvider>
          <PickCodeScreen />
        </ThemeProvider>
      );

      fireEvent.changeText(screen.getByTestId('code-input'), 'MYCODE');
      await waitFor(() => {
        expect(screen.getByTestId('code-input').props.value).toBe('MYCODE');
      });
      fireEvent.press(screen.getByTestId('code-check'));
      await screen.findByTestId('code-available');
      fireEvent.press(screen.getByTestId('code-take'));

      await waitFor(() => {
        expect(setInfluencerCode).toHaveBeenCalledWith('MYCODE');
      });
    });
  });

  describe('Code already taken', () => {
    it('shows taken code and try another', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ code: 'TAKEN' });
      (checkCodeAvailability as jest.Mock).mockResolvedValue({
        data: { available: true },
      });

      await render(
        <ThemeProvider>
          <CodeTakenScreen />
        </ThemeProvider>
      );

      expect(await screen.findByTestId('code-taken-display')).toHaveTextContent('TAKEN');
      fireEvent.changeText(screen.getByTestId('code-taken-input'), 'FREE');
      await waitFor(() => {
        expect(screen.getByTestId('code-taken-input').props.value).toBe('FREE');
      });
      fireEvent.press(screen.getByTestId('code-try-another'));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(influencer)/pick-code');
      });
    });
  });
});
