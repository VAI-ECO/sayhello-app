/**
 * REVEAL SCREEN — ICEBREAKER GATE TESTS
 *
 * Tests RULING 3: Gate on sharing (reveal), NOT on signup.
 * Users with < 3 answers see gate modal with option to answer or skip.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import RevealScreen from '../reveal';
import { api } from '../../../src/api/client';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../../src/theme', () => ({
  ...jest.requireActual('../../../src/theme'),
  useTheme: () => ({
    identityColor: '#E848D0',
  }),
}));

jest.mock('../../../src/api/client', () => ({
  api: {
    icebreakers: {
      getMyAnswers: jest.fn(),
    },
  },
}));

function mockAnswers(count: number) {
  (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
    data: {
      answers: Array.from({ length: count }, (_, i) => ({ questionId: `q${i + 1}` })),
    },
  });
}

describe('RevealScreen — Icebreaker Gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnswers(0);
  });

  it('RULING 3: shows gate modal when user has < 3 answers', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
    });
  });

  it('shows gate when user has 1 answer', async () => {
    mockAnswers(1);
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
    });
  });

  it('shows gate when user has 2 answers', async () => {
    mockAnswers(2);
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Three answers to share')).toBeTruthy();
    });
  });

  it('does NOT show gate when user has 3+ answers', async () => {
    mockAnswers(3);
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.queryByText('Three answers to share')).toBeNull();
      expect(screen.getByText('Mara')).toBeTruthy();
    });
  });

  it('navigates to Icebreakers when "Answer Icebreakers" is pressed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('reveal-gate-answer-button')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('reveal-gate-answer-button'));
    expect(mockPush).toHaveBeenCalledWith('/profile/icebreakers');
  });

  it('dismisses gate when "Skip for now" is pressed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('reveal-gate-skip-button')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('reveal-gate-skip-button'));

    await waitFor(() => {
      expect(screen.queryByText('Three answers to share')).toBeNull();
      expect(screen.getByText('Mara')).toBeTruthy();
    });
  });

  it('RULING 3 — RULES 13.11: skip is never shame-framed', async () => {
    await render(<RevealScreen />);

    await waitFor(() => {
      expect(screen.getByText('Skip for now')).toBeTruthy();
      expect(screen.queryByText('Maybe later')).toBeNull();
    });
  });

  it('never shows distance (§8.12)', async () => {
    const { container } = await render(<RevealScreen />);

    await waitFor(() => {
      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
