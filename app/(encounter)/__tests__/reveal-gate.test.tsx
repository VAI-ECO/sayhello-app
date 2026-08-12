/**
 * REVEAL SCREEN — ICEBREAKER GATE TESTS
 *
 * Tests RULING 3: Gate on sharing (reveal), NOT on signup.
 * Users with < 3 answers see gate modal with option to answer or skip.
 *
 * RNTL v14: All operations async, use imported screen.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import RevealScreen from '../reveal';
import {
  resetMockIcebreakerAnswers,
  saveMockIcebreakerAnswer,
} from '../../../src/data/mockIcebreakersData';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useTheme
jest.mock('../../../src/theme', () => ({
  ...jest.requireActual('../../../src/theme'),
  useTheme: () => ({
    identityColor: '#E848D0',
  }),
}));

describe('RevealScreen — Icebreaker Gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockIcebreakerAnswers();
  });

  it('RULING 3: shows gate modal when user has < 3 answers', async () => {
    // User has 0 answers
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
      expect(
        screen.getByText(
          "Icebreakers show up after you've both said Hello. Answer three questions so they have something to see."
        )
      ).toBeTruthy();
    });
  });

  it('shows gate when user has 1 answer', async () => {
    saveMockIcebreakerAnswer('q1', 'My answer');

    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
    });
  });

  it('shows gate when user has 2 answers', async () => {
    saveMockIcebreakerAnswer('q1', 'Answer 1');
    saveMockIcebreakerAnswer('q2', 'Answer 2');

    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
    });
  });

  it('does NOT show gate when user has 3+ answers', async () => {
    saveMockIcebreakerAnswer('q1', 'Answer 1');
    saveMockIcebreakerAnswer('q2', 'Answer 2');
    saveMockIcebreakerAnswer('q3', 'Answer 3');

    await render(<RevealScreen />);

    await waitFor(() => {
      // Gate should not be visible
      expect(screen.queryByText('Three answers to share')).toBeNull();
      // Reveal content should be visible
      expect(screen.getByText('Mara')).toBeTruthy();
    });
  });

  it('navigates to Icebreakers when "Answer Icebreakers" is pressed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('reveal-gate-answer-button')).toBeTruthy();
    });

    const answerButton = screen.getByTestId('reveal-gate-answer-button');
    await fireEvent.press(answerButton);

    expect(mockPush).toHaveBeenCalledWith('/profile/icebreakers');
  });

  it('dismisses gate when "Skip for now" is pressed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('reveal-gate-skip-button')).toBeTruthy();
    });

    const skipButton = screen.getByTestId('reveal-gate-skip-button');
    await fireEvent.press(skipButton);

    await waitFor(() => {
      // Gate should be dismissed
      expect(screen.queryByText('Three answers to share')).toBeNull();
      // Reveal content should be visible
      expect(screen.getByText('Mara')).toBeTruthy();
    });
  });

  it('RULING 3 — RULES 13.11: skip is never shame-framed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      const skipButton = screen.getByTestId('reveal-gate-skip-button');
      // Should say "Skip for now" not punishing language
      expect(screen.getByText('Skip for now')).toBeTruthy();
      // Should not say "Maybe later", "Not interested", etc.
      expect(screen.queryByText('Maybe later')).toBeNull();
    });
  });

  it('gate buttons are pressable', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      const answerButton = screen.getByTestId('reveal-gate-answer-button');
      const skipButton = screen.getByTestId('reveal-gate-skip-button');

      expect(answerButton).toBeTruthy();
      expect(skipButton).toBeTruthy();
    });
  });
});
