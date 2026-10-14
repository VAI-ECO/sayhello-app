/**
 * MOCK ICEBREAKERS DATA
 *
 * ⚠️ THIS IS MOCK DATA — REPLACE WITH REAL API CALLS
 *
 * Endpoint shapes match the proposed API:
 * - GET /api/v1/icebreakers/nodes → returns all questions (tree structure)
 * - GET /api/v1/users/me/icebreaker-answers → returns user's answers
 * - POST /api/v1/users/me/icebreaker-answers → save/update answer
 *
 * RULES 13.1-13.3: Tree structure with parent_id, arbitrary depth
 * RULES 13.9: Backend-driven (add/reword/reorder/retire without deploy)
 * RULES 13.13: Categories deferred — structure ships first
 */

export interface IcebreakerNode {
  id: string;
  parent_id: string | null;
  label: string; // Question text OR category name
  sort_order: number;
  selectable: boolean; // true = answerable question, false = category
  prompt: string | null; // Subtext for questions
  active: boolean;
}

export interface IcebreakerAnswer {
  node_id: string;
  text: string;
  updated_at: string;
}

/**
 * MOCK: Tree of nodes (questions)
 * Currently flat (all parent_id = null) per RULES 13.13 (categories deferred)
 * Supports arbitrary depth — API can add categories later
 */
export const MOCK_ICEBREAKER_NODES: IcebreakerNode[] = [
  {
    id: 'q1',
    parent_id: null,
    label: 'What gets you out of the house?',
    sort_order: 1,
    selectable: true,
    prompt: null,
    active: true,
  },
  {
    id: 'q2',
    parent_id: null,
    label: 'What do you do on a Sunday morning?',
    sort_order: 2,
    selectable: true,
    prompt: null,
    active: true,
  },
  {
    id: 'q3',
    parent_id: null,
    label: 'What are you reading right now?',
    sort_order: 3,
    selectable: true,
    prompt: null,
    active: true,
  },
  {
    id: 'q4',
    parent_id: null,
    label: "What's a place you keep coming back to?",
    sort_order: 4,
    selectable: true,
    prompt: null,
    active: true,
  },
  {
    id: 'q5',
    parent_id: null,
    label: "What's something you're trying to get better at?",
    sort_order: 5,
    selectable: true,
    prompt: null,
    active: true,
  },
  {
    id: 'q6',
    parent_id: null,
    label: "What's a skill you'd teach if someone asked?",
    sort_order: 6,
    selectable: true,
    prompt: null,
    active: true,
  },
];

/**
 * MOCK: User's answers (in-memory storage for development)
 * Real implementation will persist to backend
 */
let MOCK_USER_ANSWERS: IcebreakerAnswer[] = [];

/**
 * MOCK API: Get all nodes
 */
export function getMockIcebreakerNodes(): IcebreakerNode[] {
  return MOCK_ICEBREAKER_NODES.filter((node) => node.active);
}

/**
 * MOCK API: Get user's answers
 */
export function getMockIcebreakerAnswers(): IcebreakerAnswer[] {
  return MOCK_USER_ANSWERS;
}

/**
 * MOCK API: Save or update answer
 * Empty text = delete answer (per RULES 13.7 — collapse keeps text, but we allow deletion)
 */
export function saveMockIcebreakerAnswer(
  node_id: string,
  text: string
): IcebreakerAnswer | null {
  const now = new Date().toISOString();

  // Delete if text is empty
  if (text.trim() === '') {
    MOCK_USER_ANSWERS = MOCK_USER_ANSWERS.filter((a) => a.node_id !== node_id);
    return null;
  }

  // Update existing answer
  const existing = MOCK_USER_ANSWERS.find((a) => a.node_id === node_id);
  if (existing) {
    existing.text = text;
    existing.updated_at = now;
    return existing;
  }

  // Create new answer
  const newAnswer: IcebreakerAnswer = {
    node_id,
    text,
    updated_at: now,
  };
  MOCK_USER_ANSWERS.push(newAnswer);
  return newAnswer;
}

/**
 * MOCK API: Reset all answers (for testing)
 */
export function resetMockIcebreakerAnswers(): void {
  MOCK_USER_ANSWERS = [];
}
