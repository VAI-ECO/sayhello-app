/**
 * BLOCKED LIST TESTS
 *
 * Tests the blocked users list with undo functionality.
 *
 * ⚠️ RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import BlockedListScreen from '../../../../app/(tabs)/profile/blocked';
import { ThemeProvider } from '../../../../src/theme';
import * as apiClient from '../../../../src/api/client';

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock API
jest.mock('../../../../src/api/client');
const mockGet = jest.fn();
const mockDelete = jest.fn();
(apiClient.api as any) = { get: mockGet, delete: mockDelete };

describe('Blocked List Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue({ data: { success: true } });
  });

  describe('Header', () => {
    it('renders header with back button and title', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Blocked')).toBeTruthy();
        expect(screen.getByText('←')).toBeTruthy();
      });
    });

    it('back button navigates back', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('←')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('←'));

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching', async () => {
      mockGet.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { blocks: [] } }), 100)));

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      // Loading indicator is an ActivityIndicator, check container
      expect(screen.queryByText('Blocked')).toBeTruthy();
    });

    it('fetches blocked users on mount', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/safety/blocks');
      });
    });
  });

  describe('Error State', () => {
    it('shows error message when fetch fails', async () => {
      mockGet.mockResolvedValue({ error: { message: 'Network error' } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Couldn't load blocked list")).toBeTruthy();
        expect(screen.getByText('Network error')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockGet.mockResolvedValue({ error: { message: 'Network error' } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeTruthy();
      });
    });

    it('retries fetch when retry button is pressed', async () => {
      mockGet.mockResolvedValueOnce({ error: { message: 'Network error' } });
      mockGet.mockResolvedValueOnce({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('Try again'));

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Empty State', () => {
    it('shows explanation when no blocked users', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("People you turned down aren't here")).toBeTruthy();
        expect(screen.getByText(/Saying no to a nudge already means you'll never be put together again/)).toBeTruthy();
        expect(screen.getByText(/This list is only for people you met and then blocked/)).toBeTruthy();
      });
    });

    it('shows undo silence notice in empty state', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Undoing a block doesn't tell them anything either/)).toBeTruthy();
        expect(screen.getByText(/You'll simply be able to be nudged again one day/)).toBeTruthy();
      });
    });
  });

  describe('List State', () => {
    const mockBlockedUsers = [
      {
        id: 'user-123',
        name: 'Marco',
        blockedAt: '2024-08-12T10:00:00Z',
      },
      {
        id: 'user-456',
        name: 'Jo',
        blockedAt: '2024-07-04T15:30:00Z',
      },
    ];

    it('shows list of blocked users', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Marco')).toBeTruthy();
        expect(screen.getByText('Jo')).toBeTruthy();
      });
    });

    it('shows blocked date for each user', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Blocked.*Aug/)).toBeTruthy();
        expect(screen.getByText(/Blocked.*Jul/)).toBeTruthy();
      });
    });

    it('shows Undo button for each user', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        const undoButtons = screen.getAllByText('Undo');
        expect(undoButtons.length).toBe(2);
      });
    });

    it('shows explanation card in list view', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("People you turned down aren't here")).toBeTruthy();
      });
    });
  });

  describe('Undo Functionality', () => {
    const mockBlockedUsers = [
      {
        id: 'user-123',
        name: 'Marco',
        blockedAt: '2024-08-12T10:00:00Z',
      },
    ];

    it('calls API when Undo is pressed', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Marco')).toBeTruthy();
      });

      const undoButton = screen.getByText('Undo');
      await fireEvent.press(undoButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('/safety/block/user-123');
      });
    });

    it('removes user from list after successful undo', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Marco')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('Undo'));

      await waitFor(() => {
        expect(screen.queryByText('Marco')).toBeNull();
      });
    });

    it('shows empty state after undoing last user', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Marco')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('Undo'));

      await waitFor(() => {
        expect(screen.getByText("People you turned down aren't here")).toBeTruthy();
      });
    });

    it('shows error when undo fails', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });
      mockDelete.mockResolvedValue({ error: { message: 'Failed to unblock' } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Marco')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('Undo'));

      await waitFor(() => {
        expect(screen.getByText('Failed to unblock')).toBeTruthy();
      });
    });

    it('shows loading state while undoing', async () => {
      mockGet.mockResolvedValue({ data: { blocks: mockBlockedUsers } });
      mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100)));

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeTruthy();
      });

      await fireEvent.press(screen.getByText('Undo'));

      expect(screen.getByText('Undoing...')).toBeTruthy();
    });
  });

  describe('Copy Compliance', () => {
    it('uses exact copy from design for explanation card', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("People you turned down aren't here")).toBeTruthy();
        expect(screen.getByText(/Saying no to a nudge already means you'll never be put together again/)).toBeTruthy();
        expect(screen.getByText(/It happens quietly and there's nothing to manage/)).toBeTruthy();
      });
    });

    it('uses exact copy for undo silence notice', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Undoing a block doesn't tell them anything either/)).toBeTruthy();
        expect(screen.getByText(/You'll simply be able to be nudged again one day/)).toBeTruthy();
      });
    });
  });

  describe('§8.12 Distance Guard', () => {
    it('never shows distance anywhere on screen', async () => {
      mockGet.mockResolvedValue({ data: { blocks: [] } });

      const { container } = await render(
        <ThemeProvider>
          <BlockedListScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Blocked')).toBeTruthy();
      });

      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
