/**
 * ICEBREAKERS SCREEN TESTS
 *
 * Tests the Icebreakers library screen wired to the API.
 * Tests loading, error, empty, and success states.
 *
 * RNTL v14: All operations (render, fireEvent, userEvent) are async.
 * Must use imported screen, not destructuring from render.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import IcebreakersScreen from '../icebreakers';
import { api } from '../../../../src/api/client';

// Mock expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock API client
jest.mock('../../../../src/api/client', () => ({
  api: {
    icebreakers: {
      getQuestions: jest.fn(),
      getMyAnswers: jest.fn(),
      saveAnswer: jest.fn(),
    },
  },
}));

describe('IcebreakersScreen - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner and text while fetching data', async () => {
    // Mock API calls that never resolve (stay in loading)
    (api.icebreakers.getQuestions as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (api.icebreakers.getMyAnswers as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    await render(<IcebreakersScreen />);

    // Should show loading state
    expect(screen.getByText('Loading questions...')).toBeTruthy();
    expect(screen.getByText('Icebreakers')).toBeTruthy(); // Header still visible
  });
});

describe('IcebreakersScreen - Error State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error message when questions fail to load', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      error: { message: 'Network error' },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Network error')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });
  });

  it('shows error message when answers fail to load', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: { questions: [] },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      error: { message: 'Unauthorized' },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Unauthorized')).toBeTruthy();
    });
  });

  it('retries loading when Try Again button is pressed', async () => {
    let callCount = 0;
    (api.icebreakers.getQuestions as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ error: { message: 'Network error' } });
      }
      return Promise.resolve({
        data: {
          questions: [
            {
              id: 'q1',
              categoryId: 'cat1',
              questionText: 'Test question',
              questionType: 'short_answer',
              displayOrder: 1,
              isShownAtSignup: true,
            },
          ],
        },
      });
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });

    // Press retry button
    const retryButton = screen.getByText('Try Again');
    await fireEvent.press(retryButton);

    // Should show success after retry
    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeTruthy();
    });
  });
});

describe('IcebreakersScreen - Empty State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no short_answer questions exist', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: { questions: [] },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeTruthy();
      expect(
        screen.getByText('Questions to answer in your own words')
      ).toBeTruthy();
    });
  });

  it('shows empty state when only non-short_answer questions exist', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Pick your favorite',
            questionType: 'multiple_choice', // Not short_answer
            displayOrder: 1,
            isShownAtSignup: true,
          },
          {
            id: 'q2',
            categoryId: 'cat1',
            questionText: 'Rate this',
            questionType: 'slider', // Not short_answer
            displayOrder: 2,
            isShownAtSignup: false,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeTruthy();
      // Should not render the multiple_choice or slider questions
      expect(screen.queryByText('Pick your favorite')).toBeNull();
      expect(screen.queryByText('Rate this')).toBeNull();
    });
  });
});

describe('IcebreakersScreen - Success State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders short_answer questions from API', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: "Name one thing that's interesting about you",
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
          {
            id: 'q2',
            categoryId: 'cat1',
            questionText: 'What do you do for fun?',
            questionType: 'short_answer',
            displayOrder: 2,
            isShownAtSignup: false,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Name one thing that's interesting about you")
      ).toBeTruthy();
      expect(screen.getByText('What do you do for fun?')).toBeTruthy();
    });
  });

  it('shows "Your answers" when no answers exist', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Test question',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        'Your answers'
      );
    });
  });

  it('shows answer count when answers exist', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Question 1',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
          {
            id: 'q2',
            categoryId: 'cat1',
            questionText: 'Question 2',
            questionType: 'short_answer',
            displayOrder: 2,
            isShownAtSignup: false,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: {
        answers: [
          {
            userId: 'user1',
            questionId: 'q1',
            freeTextAnswer: 'I love hiking',
            contentLanguage: 'en-US',
            answeredAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            userId: 'user1',
            questionId: 'q2',
            freeTextAnswer: 'Reading books',
            contentLanguage: 'en-US',
            answeredAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        '2 answered'
      );
    });
  });

  it('expands questions that have answers', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Question with answer',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: {
        answers: [
          {
            userId: 'user1',
            questionId: 'q1',
            freeTextAnswer: 'My saved answer',
            contentLanguage: 'en-US',
            answeredAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      // Question should be expanded with answer text
      const input = screen.getByTestId('answer-input-q1');
      expect(input).toBeTruthy();
      expect(input.props.value).toBe('My saved answer');
    });
  });

  it('tapping question expands text field', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Test question',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    // Field should not be visible initially
    expect(screen.queryByTestId('answer-input-q1')).toBeNull();

    // Tap to expand
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });
  });

  it('saves answer when field loses focus', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Test question',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });
    (api.icebreakers.saveAnswer as jest.Mock).mockResolvedValue({
      data: {
        answer: {
          userId: 'user1',
          questionId: 'q1',
          freeTextAnswer: 'My answer',
          contentLanguage: 'en-US',
          answeredAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    // Expand and type
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });

    const input = screen.getByTestId('answer-input-q1');
    await fireEvent.changeText(input, 'My answer');
    await fireEvent(input, 'blur');

    await waitFor(() => {
      expect(api.icebreakers.saveAnswer).toHaveBeenCalledWith('q1', {
        freeTextAnswer: 'My answer',
        contentLanguage: 'en-US',
      });
    });
  });

  it('RULES 13.7: collapsing field keeps text in memory', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Test question',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    // Expand, type text
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });

    const input = screen.getByTestId('answer-input-q1');
    await fireEvent.changeText(input, 'Draft answer');

    // Collapse
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.queryByTestId('answer-input-q1')).toBeNull();
    });

    // Re-expand
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      const inputAgain = screen.getByTestId('answer-input-q1');
      expect(inputAgain.props.value).toBe('Draft answer');
    });
  });

  it('prevents collapse when save is in flight, preserves draft text', async () => {
    (api.icebreakers.getQuestions as jest.Mock).mockResolvedValue({
      data: {
        questions: [
          {
            id: 'q1',
            categoryId: 'cat1',
            questionText: 'Test question',
            questionType: 'short_answer',
            displayOrder: 1,
            isShownAtSignup: true,
          },
        ],
      },
    });
    (api.icebreakers.getMyAnswers as jest.Mock).mockResolvedValue({
      data: { answers: [] },
    });

    // Mock save that never resolves (stays in flight)
    (api.icebreakers.saveAnswer as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    await render(<IcebreakersScreen />);

    // Wait for data to load
    const question = await screen.findByTestId('question-q1');

    // Expand and type
    await fireEvent.press(question);

    const input = await screen.findByTestId('answer-input-q1');
    await fireEvent.changeText(input, 'Draft answer');

    // Trigger save by blurring
    fireEvent(input, 'blur'); // Don't await - let it start async

    // Give blur handler time to start async save and add to savingRef
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to collapse while save is in flight - should be blocked
    await fireEvent.press(question);

    // Field should still be visible (collapse blocked by guard)
    // This is the critical assertion: the guard prevents collapse during save
    expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    expect(screen.getByTestId('answer-input-q1').props.value).toBe('Draft answer');
  });
});
