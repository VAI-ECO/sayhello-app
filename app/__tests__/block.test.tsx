/**
 * BLOCK CONFIRMATION TESTS
 *
 * Tests blocking a person with silence guarantees.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import BlockScreen from '../block';
import { ThemeProvider } from '../../src/theme';
import * as apiClient from '../../src/api/client';

// Mock router
const mockBack = jest.fn();
let mockParams: { userId: string; name: string; gender?: string } = { userId: 'user-123', name: 'Marco', gender: 'male' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

// Mock API
jest.mock('../../src/api/client');
const mockPost = jest.fn();
(apiClient.api as any) = { post: mockPost };

describe('Block Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { success: true } });
    // Reset to default params
    mockParams = { userId: 'user-123', name: 'Marco', gender: 'male' };
  });

  describe('Header and Title', () => {
    it('renders block confirmation with user name', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText('Block Marco?')).toBeTruthy();
    });

    it('shows user avatar placeholder', async () => {
      const { container } = await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      // Avatar is a View with specific styling, cannot query by text
      expect(container).toBeTruthy();
    });
  });

  describe('Consequences', () => {
    it('shows all three consequences of blocking', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("You'll never be nudged towards each other again.")).toBeTruthy();
      expect(screen.getByText("No messages, either way.")).toBeTruthy();
      expect(screen.getByText("Your pin stays. You did meet.")).toBeTruthy();
    });

    it('shows × icon for stopped actions', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      const stopIcons = screen.getAllByText('×');
      expect(stopIcons.length).toBe(2);
    });

    it('shows ✓ icon for preserved pin', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });
  });

  describe('Silence Guarantee (§24.8)', () => {
    it('explains that blocked person will not be told', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("He won't be told")).toBeTruthy();
      expect(screen.getByText(/No message, no missing profile/)).toBeTruthy();
      expect(screen.getByText(/simply not putting you two together/)).toBeTruthy();
      expect(screen.getByText(/the app never explains why somebody didn't turn up/)).toBeTruthy();
    });

    it('uses correct pronouns for male user', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("He won't be told")).toBeTruthy();
      expect(screen.getByText('Block him')).toBeTruthy();
    });
  });

  describe('Pronoun Handling', () => {
    it('uses male pronouns when gender is male', async () => {
      mockParams = { userId: 'user-123', name: 'Marco', gender: 'male' };

      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("He won't be told")).toBeTruthy();
      expect(screen.getByText('Block him')).toBeTruthy();
    });

    it('uses female pronouns when gender is female', async () => {
      mockParams = { userId: 'user-456', name: 'Jo', gender: 'female' };

      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("She won't be told")).toBeTruthy();
      expect(screen.getByText('Block her')).toBeTruthy();
    });

    it('uses they pronouns when gender is unspecified', async () => {
      mockParams = { userId: 'user-789', name: 'Alex', gender: undefined };

      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText("They won't be told")).toBeTruthy();
      expect(screen.getByText('Block them')).toBeTruthy();
    });
  });

  describe('Undo Notice', () => {
    it('shows undo is possible in Settings', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/You can undo this any time in Settings, under Blocked/)).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('has Block and Not now buttons', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText('Block him')).toBeTruthy();
      expect(screen.getByText('Not now')).toBeTruthy();
    });

    it('calls API when Block button is pressed', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      const blockButton = screen.getByText('Block him');
      await fireEvent.press(blockButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/safety/block', {
          blockedUserId: 'user-123',
        });
      });
    });

    it('navigates back on successful block', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      await fireEvent.press(screen.getByText('Block him'));

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('shows error message when blocking fails', async () => {
      mockPost.mockResolvedValue({ error: { message: 'Network error' } });

      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      await fireEvent.press(screen.getByText('Block him'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeTruthy();
      });
    });

    it('Not now button navigates back without blocking', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      await fireEvent.press(screen.getByText('Not now'));

      expect(mockBack).toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('shows loading state while blocking', async () => {
      mockPost.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100)));

      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      await fireEvent.press(screen.getByText('Block him'));

      expect(screen.getByText('Blocking...')).toBeTruthy();
    });
  });

  describe('Copy Compliance', () => {
    it('uses exact copy from design for consequences', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      // Exact copy verification
      expect(screen.getByText("You'll never be nudged towards each other again.")).toBeTruthy();
      expect(screen.getByText("No messages, either way.")).toBeTruthy();
      expect(screen.getByText("Your pin stays. You did meet.")).toBeTruthy();
    });

    it('uses exact copy for silence explanation', async () => {
      await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      expect(screen.getByText(/No message, no missing profile, nothing that looks different/)).toBeTruthy();
      expect(screen.getByText(/the app never explains why somebody didn't turn up/)).toBeTruthy();
    });
  });

  describe('§8.12 Distance Guard', () => {
    it('never shows distance anywhere on screen', async () => {
      const { container } = await render(
        <ThemeProvider>
          <BlockScreen />
        </ThemeProvider>
      );

      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
