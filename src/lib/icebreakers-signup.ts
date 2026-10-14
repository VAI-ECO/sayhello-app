/**
 * The Icebreaker signup subset, defined ONCE so the framing screen announces exactly the number of
 * questions the one-per-screen flow actually asks (copy honesty: the person must never be told "4
 * questions" and then be asked 3).
 *
 * A slider whose range is too wide to render as tappable number cards stays answerable in
 * Settings → Icebreakers instead of onboarding (CANON-RL-01-SN-22), so it is not part of the
 * subset. Everything else the server marks `isShownAtSignup` is asked, in the order returned.
 */

export const SLIDER_CARD_LIMIT = 11;

export interface SignupQuestionLike {
  isShownAtSignup?: boolean;
  questionType: string;
  sliderMin?: number | null;
  sliderMax?: number | null;
}

function askableAtSignup(q: SignupQuestionLike): boolean {
  if (q.questionType !== 'slider') return true;
  return q.sliderMin != null && q.sliderMax != null && q.sliderMax - q.sliderMin < SLIDER_CARD_LIMIT;
}

/** The questions the onboarding sequence asks, in server order; an unreadable list asks nothing. */
export function signupQuestions<T extends SignupQuestionLike>(list: T[] | null | undefined): T[] {
  if (!Array.isArray(list)) return [];
  return list.filter(q => !!q.isShownAtSignup && askableAtSignup(q));
}
