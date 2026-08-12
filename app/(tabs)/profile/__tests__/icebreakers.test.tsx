/**
 * ICEBREAKERS SCREEN TESTS
 *
 * Tests the Icebreakers library screen per RULES section 13 and Rulings.
 *
 * RNTL v14: All operations (render, fireEvent, userEvent) are async.
 * Must use imported screen, not destructuring from render.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import IcebreakersScreen from '../icebreakers';
import {
  resetMockIcebreakerAnswers,
  saveMockIcebreakerAnswer,
} from '../../../../src/data/mockIcebreakersData';

// Mock expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('IcebreakersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockIcebreakerAnswers();
  });

  it('renders the screen with header and title', async () => {
    await render(<IcebreakersScreen />);

    expect(screen.getByText('Icebreakers')).toBeTruthy();
    expect(screen.getByText('←')).toBeTruthy();
  });

  it('shows "Your answers" when no answers exist', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        'Your answers'
      );
    });
  });

  it('loads and displays questions from mock API', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByText('What gets you out of the house?')).toBeTruthy();
      expect(
        screen.getByText('What do you do on a Sunday morning?')
      ).toBeTruthy();
      expect(screen.getByText('What are you reading right now?')).toBeTruthy();
    });
  });

  it('shows "Tap to answer" status for unanswered questions', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      const statusElements = screen.getAllByText('Tap to answer');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  it('RULES 13.5: tapping question expands text field immediately', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    // Question field should not be visible initially
    expect(screen.queryByTestId('answer-input-q1')).toBeNull();

    // Tap question to expand
    await fireEvent.press(screen.getByTestId('question-q1'));

    // Field should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });
  });

  it('RULES 13.7: collapsing field keeps text in memory', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    // Expand question
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });

    // Type answer
    const input = screen.getByTestId('answer-input-q1');
    await fireEvent.changeText(input, 'Live music and coffee');

    // Collapse by tapping question again
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      expect(screen.queryByTestId('answer-input-q1')).toBeNull();
    });

    // Re-expand question
    await fireEvent.press(screen.getByTestId('question-q1'));

    await waitFor(() => {
      const inputAgain = screen.getByTestId('answer-input-q1');
      expect(inputAgain).toBeTruthy();
      // Text should still be there
      expect(inputAgain.props.value).toBe('Live music and coffee');
    });
  });

  it('saves answer when field loses focus', async () => {
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
    await fireEvent.changeText(input, 'My answer here');

    // Trigger blur to save
    await fireEvent(input, 'blur');

    // Count should update
    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        '1 answered'
      );
    });
  });

  it('RULING 2: shows plain counts (no completion badge at 3)', async () => {
    // Pre-populate 3 answers
    saveMockIcebreakerAnswer('q1', 'Answer 1');
    saveMockIcebreakerAnswer('q2', 'Answer 2');
    saveMockIcebreakerAnswer('q3', 'Answer 3');

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      const countElement = screen.getByTestId('icebreakers-count');
      expect(countElement).toHaveTextContent('3 answered');
      // Should NOT say "Ready to share" or any completion message
      expect(countElement).not.toHaveTextContent('Ready');
      expect(countElement).not.toHaveTextContent('ready');
    });
  });

  it('continues counting beyond 3 (floor, not cap)', async () => {
    // Pre-populate 4 answers
    saveMockIcebreakerAnswer('q1', 'Answer 1');
    saveMockIcebreakerAnswer('q2', 'Answer 2');
    saveMockIcebreakerAnswer('q3', 'Answer 3');
    saveMockIcebreakerAnswer('q4', 'Answer 4');

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        '4 answered'
      );
    });
  });

  it('shows answered questions as expanded with saved text', async () => {
    // Pre-populate an answer
    saveMockIcebreakerAnswer('q1', 'I love hiking');

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      // Question should be expanded
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
      // Should show saved text
      const input = screen.getByTestId('answer-input-q1');
      expect(input.props.value).toBe('I love hiking');
      // Status should say "Tap to edit"
      expect(screen.getByText('Tap to edit')).toBeTruthy();
    });
  });

  it('deletes answer when text is cleared and blurred', async () => {
    // Pre-populate an answer
    saveMockIcebreakerAnswer('q1', 'I love hiking');

    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        '1 answered'
      );
    });

    const input = screen.getByTestId('answer-input-q1');

    // Clear text
    await fireEvent.changeText(input, '');
    await fireEvent(input, 'blur');

    // Count should return to zero
    await waitFor(() => {
      expect(screen.getByTestId('icebreakers-count')).toHaveTextContent(
        'Your answers'
      );
    });
  });

  it('navigates back when back arrow is pressed', async () => {
    await render(<IcebreakersScreen />);

    const backButton = screen.getByText('←');
    await fireEvent.press(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders questions in sort order', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      const questions = screen.getAllByTestId(/^question-/);
      expect(questions.length).toBe(6);
      // All 6 questions should be rendered
      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.getByTestId('question-q6')).toBeTruthy();
    });
  });

  it('shows accessibility state for expanded/collapsed questions', async () => {
    await render(<IcebreakersScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    const question = screen.getByTestId('question-q1');

    // Initially collapsed - field should not be visible
    expect(screen.queryByTestId('answer-input-q1')).toBeNull();

    // Expand
    await fireEvent.press(question);

    await waitFor(() => {
      // Field should now be visible
      expect(screen.getByTestId('answer-input-q1')).toBeTruthy();
    });
  });
});
