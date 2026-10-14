/**
 * ICEBREAKERS SCREEN
 *
 * Browsable library of questions — users type their own answers.
 *
 * RULES:
 * - 13.1-13.3: Tree structure (backend uses flat categoryId, not parent_id — see OPEN-QUESTIONS.md)
 * - 13.4: User's written entry IS the Icebreaker (backend supports multiple types, we show short_answer only)
 * - 13.5: Checking node immediately expands write-in field
 * - 13.7: Unchecking collapses field but KEEPS TEXT in memory
 * - 13.9: Backend-driven (loaded from API)
 * - 13.10: Editable forever, super accessible
 * - 13.11: Easy exit, skipping never blocked
 * - 13.13: Categories deferred (flat list initially)
 *
 * RULINGS:
 * - Three answers minimum to share (floor, not cap)
 * - Gate is on sharing at reveal, NOT on signup
 * - Progress shown as plain counts (no completion badges)
 * - 2026-08-13: Backend shape diverges from canon. Take backend shape. See BUILD-LOG.md.
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator, useWindowDimensions } from 'react-native';
import { useColumnStyle } from '../../../src/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer } from '../../../src/components/StatusBarSpacer';
import { KeyboardAware } from '../../../src/components/KeyboardAware';
import { api, addSessionChangeListener } from '../../../src/api/client';
import { deviceLocale } from '../../../src/lib/phone';

interface Question {
  id: string;
  categoryId: string;
  questionText: string;
  questionType: string;
  displayOrder: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderLabelMin?: string;
  sliderLabelMax?: string;
  isShownAtSignup: boolean;
}

interface Answer {
  userId: string;
  questionId: string;
  selectedOptionIds?: string[];
  freeTextAnswer?: string;
  sliderValue?: number;
  isSelected?: boolean;
  contentLanguage: string;
  answeredAt: string;
  updatedAt: string;
}

export default function IcebreakersScreen() {
  const router = useRouter();
  // T/D: centred column (700 / 900). D 1440 (RL-01-SN-46): questions three-up.
  const column = useColumnStyle();
  const desktop = useWindowDimensions().width >= 1024;

  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [draftText, setDraftText] = useState<Map<string, string>>(new Map());
  const [failedQuestions, setFailedQuestions] = useState<Set<string>>(new Set());

  // Account-scoped draft recovery (RULES 26.7): unsent text survives navigation and
  // restart, keyed by the signed-in account so other accounts never inherit it.
  const [accountKey, setAccountKey] = useState<string | null>(null);
  const pendingDraftsRef = useRef<Record<string, { text: string; updatedAt: string }>>({});
  // Per-question save sequence: a completing save only commits if it is still the
  // newest save for that question, so an older in-flight save can never overwrite
  // newer text.
  const saveSeqRef = useRef<Map<string, number>>(new Map());

  // Track in-flight saves to handle collapse during save
  const savingRef = useRef<Set<string>>(new Set());

  // Load questions and answers on mount
  useEffect(() => {
    loadData();
  }, []);

  // Session change (sign-out / account switch / revoked session) drops every in-memory
  // draft and failed marker; persisted drafts stay keyed to their own account.
  useEffect(() => addSessionChangeListener(() => {
    setDraftText(new Map());
    setExpandedQuestions(new Set());
    setFailedQuestions(new Set());
    setAnswers(new Map());
    pendingDraftsRef.current = {};
    saveSeqRef.current = new Map();
    setAccountKey(null);
  }), []);

  const persistPendingDrafts = () => {
    if (!accountKey) return;
    void api.icebreakers.persistDrafts('profile', accountKey, pendingDraftsRef.current);
  };

  const resolveAccountKey = async (loadedAnswers: Answer[]): Promise<string | null> => {
    const fromAnswer = loadedAnswers.find((a) => a.userId)?.userId;
    if (fromAnswer) return fromAnswer;
    try {
      const profile = await api.user.getProfile();
      const id = (profile.data as { id?: string } | undefined)?.id;
      return typeof id === 'string' && id ? id : null;
    } catch {
      return null; // without an account key we degrade to in-memory drafts only
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load questions and answers in parallel
      const [questionsResult, answersResult] = await Promise.all([
        api.icebreakers.getQuestions(),
        api.icebreakers.getMyAnswers(),
      ]);

      if (questionsResult.error) {
        setError(questionsResult.error.message);
        setLoading(false);
        return;
      }

      if (answersResult.error) {
        setError(answersResult.error.message);
        setLoading(false);
        return;
      }

      const loadedQuestions = (questionsResult.data as any)?.questions || [];
      const loadedAnswers = (answersResult.data as any)?.answers || [];

      setQuestions(loadedQuestions);

      const key = await resolveAccountKey(loadedAnswers);
      setAccountKey(key);

      // Build answers map and expanded set. A node is checked (expanded) when the server
      // says so — including a checked-empty node with no text at all (RULES 13.6), which
      // must still be checked after reload or restart.
      const answersMap = new Map<string, Answer>();
      const expanded = new Set<string>();
      const drafts = new Map<string, string>();

      loadedAnswers.forEach((answer: Answer) => {
        answersMap.set(answer.questionId, answer);
        const checked = answer.isSelected !== false;
        if (checked) expanded.add(answer.questionId);
        if (answer.freeTextAnswer) {
          drafts.set(answer.questionId, answer.freeTextAnswer);
        }
      });

      // Recover unsent drafts (RULES 26.7): text that never reached the server is
      // restored into the field, flagged for an explicit retry, and never silently
      // auto-saved.
      const failed = new Set<string>();
      if (key) {
        const pending = await api.icebreakers.loadDrafts('profile', key);
        pendingDraftsRef.current = { ...pending };
        for (const [questionId, pendingDraft] of Object.entries(pending)) {
          const serverText = drafts.get(questionId);
          if (pendingDraft.text !== serverText) {
            drafts.set(questionId, pendingDraft.text);
            expanded.add(questionId);
            failed.add(questionId);
          }
        }
      }

      setAnswers(answersMap);
      setExpandedQuestions(expanded);
      setDraftText(drafts);
      setFailedQuestions(failed);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load icebreakers');
      setLoading(false);
    }
  };

  // RULES 13.5/13.6/13.7: Tapping a node toggles the check. Checking expands the write-in
  // field immediately and persists the check itself — an empty answer is fine and still
  // counts. Unchecking collapses the field but the written text is kept, in memory and on
  // the server.
  const handleQuestionPress = (questionId: string) => {
    // If save is in flight, don't allow collapse
    if (savingRef.current.has(questionId)) {
      return;
    }

    const wasExpanded = expandedQuestions.has(questionId);
    const hadServerRow = answers.has(questionId);

    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId); // Collapse
      } else {
        next.add(questionId); // Expand
      }
      return next;
    });

    if (wasExpanded) {
      // Uncheck: keep text everywhere, just flip the durable selection off. Nothing to
      // uncheck if there is no stored row and no unsent draft — the toggle was cosmetic.
      const hasUnsentDraft = !!pendingDraftsRef.current[questionId];
      if (hadServerRow || hasUnsentDraft) {
        void saveSelection(questionId, false);
      }
    } else {
      // Check: persist the selection even with no text (checked-empty, RULES 13.6).
      void saveSelection(questionId, true);
    }
  };

  // Persist only the selection flag. The server updates exactly the supplied columns,
  // so unchecking never deletes the stored answer text and re-checking restores it.
  const saveSelection = async (questionId: string, isSelected: boolean) => {
    savingRef.current.add(questionId);
    const seq = (saveSeqRef.current.get(questionId) ?? 0) + 1;
    saveSeqRef.current.set(questionId, seq);

    try {
      const result = await api.icebreakers.saveAnswer(questionId, {
        isSelected,
        contentLanguage: deviceLocale(),
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // A newer save for this question superseded this one — its own completion wins.
      if (saveSeqRef.current.get(questionId) !== seq) return;

      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = next.get(questionId);
        const saved = (result.data as any)?.answer;
        if (saved) {
          next.set(questionId, saved);
        } else if (existing) {
          next.set(questionId, { ...existing, isSelected });
        }
        return next;
      });
      setFailedQuestions((prev) => {
        if (!prev.has(questionId)) return prev;
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    } catch (err) {
      console.error('[Icebreakers] Failed to save selection:', err);
      // Honest UI: the check did not stick. Revert the toggle and offer a retry.
      if (saveSeqRef.current.get(questionId) === seq) {
        setExpandedQuestions((prev) => {
          const next = new Set(prev);
          if (isSelected) next.delete(questionId);
          else next.add(questionId);
          return next;
        });
        setFailedQuestions((prev) => new Set(prev).add(questionId));
      }
    } finally {
      if (saveSeqRef.current.get(questionId) === seq) {
        savingRef.current.delete(questionId);
      }
    }
  };

  // RULES 13.7: Update draft text (kept in memory even when collapsed)
  const handleTextChange = (questionId: string, text: string) => {
    setDraftText((prev) => {
      const next = new Map(prev);
      next.set(questionId, text);
      return next;
    });
  };

  // Auto-save answer when field loses focus. The text is sent exactly as written
  // (trimmed); an empty string is a deliberate clear, never a deselect — the check is
  // carried by the selection save, not inferred from blank text.
  const handleBlur = async (questionId: string) => {
    const captured = draftText.get(questionId) || '';
    const trimmed = captured.trim();

    savingRef.current.add(questionId);
    const seq = (saveSeqRef.current.get(questionId) ?? 0) + 1;
    saveSeqRef.current.set(questionId, seq);

    // Remember the unsent text until the server confirms it (RULES 26.7).
    pendingDraftsRef.current[questionId] = { text: captured, updatedAt: new Date().toISOString() };
    persistPendingDrafts();

    try {
      // Save to API — only the fields supplied here are written server-side.
      const result = await api.icebreakers.saveAnswer(questionId, {
        freeTextAnswer: trimmed,
        contentLanguage: deviceLocale(), // the language this answer is written in: the device's
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // A newer save owns this question now — let that completion commit instead.
      if (saveSeqRef.current.get(questionId) !== seq) return;

      // Server confirmed: the draft is sent, drop it from recovery storage.
      delete pendingDraftsRef.current[questionId];
      persistPendingDrafts();

      // Update local state from the confirmed row.
      setAnswers((prev) => {
        const next = new Map(prev);
        if ((result.data as any)?.answer) {
          next.set(questionId, (result.data as any).answer);
        }
        return next;
      });
      setFailedQuestions((prev) => {
        if (!prev.has(questionId)) return prev;
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });

      savingRef.current.delete(questionId);
    } catch (error) {
      console.error('[Icebreakers] Save failed:', error);
      // Keep the draft (memory + account-scoped storage) and show an explicit retry.
      // The text survives navigation, restart, and failure.
      if (saveSeqRef.current.get(questionId) === seq) {
        setFailedQuestions((prev) => new Set(prev).add(questionId));
        savingRef.current.delete(questionId);
      }
    }
  };

  // Explicit recovery (RULES 26.7): re-send the retained draft for a failed question.
  const handleRetry = (questionId: string) => {
    void handleBlur(questionId);
  };

  // Filter to only short_answer questions (the only type we can render)
  const shortAnswerQuestions = questions.filter(
    (q) => q.questionType === 'short_answer'
  );

  const answerCount = Array.from(answers.values()).filter(
    (a) => a.freeTextAnswer && a.freeTextAnswer.trim() !== ''
  ).length;

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBarSpacer height={44} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('icebreakers.backButton')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('icebreakers.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.Ink} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBarSpacer height={44} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('icebreakers.backButton')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('icebreakers.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadData}
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render selectable question
  const renderQuestion = (question: Question) => {
    const isExpanded = expandedQuestions.has(question.id);
    const answer = answers.get(question.id);
    const hasAnswer = answer?.freeTextAnswer && answer.freeTextAnswer.trim() !== '';
    const isChecked = isExpanded || answer?.isSelected === true;
    const saveFailed = failedQuestions.has(question.id);
    const draftValue = draftText.get(question.id) || '';

    const statusText = hasAnswer
      ? t('icebreakers.questionAnswered')
      : t('icebreakers.questionUnanswered');

    return (
      <View key={question.id} style={desktop ? [styles.questionCard, styles.questionCardThird] : styles.questionCard}>
        <TouchableOpacity
          onPress={() => handleQuestionPress(question.id)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded, selected: isChecked }}
          testID={`question-${question.id}`}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>{question.questionText}</Text>
            <Text style={styles.questionStatus}>{statusText}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.answerField}>
            <TextInput
              style={styles.textInput}
              value={draftValue}
              onChangeText={(text) => handleTextChange(question.id, text)}
              onBlur={() => handleBlur(question.id)}
              placeholder={t('icebreakers.fieldPlaceholder')}
              placeholderTextColor={Colors.Muted}
              multiline
              accessibilityLabel={t('icebreakers.fieldLabel')}
              testID={`answer-input-${question.id}`}
            />
            {saveFailed && (
              <TouchableOpacity
                onPress={() => handleRetry(question.id)}
                accessibilityRole="button"
                accessibilityLabel={t('error.retry')}
                testID={`save-retry-${question.id}`}
              >
                <Text style={styles.saveFailedText}>{t('error.retry')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Header copy (plain counts, no completion badge)
  const headerText =
    answerCount === 0
      ? t('icebreakers.headerDefault')
      : t('icebreakers.headerCount', { count: answerCount });

  return (
    <KeyboardAware style={styles.container}>
      <StatusBarSpacer height={44} />

      {/* Header with back button */}
      <View style={[styles.header, column]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('icebreakers.backButton')}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('icebreakers.title')}</Text>
      </View>

      {/* Progress indicator */}
      <View style={[styles.progressBar, column]}>
        <Text style={styles.progressText} testID="icebreakers-count">
          {headerText}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, column, desktop ? styles.threeUp : null]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state — no short_answer questions available */}
        {shortAnswerQuestions.length === 0 && (
          <View style={desktop ? [styles.emptyState, { width: '100%' }] : styles.emptyState} testID="empty-state">
            <Text style={styles.emptyTitle}>
              {t('icebreakers.emptyTitle')}
            </Text>
            <Text style={styles.emptyBody}>{t('icebreakers.emptyBody')}</Text>
          </View>
        )}

        {/* Question list — only short_answer questions */}
        {shortAnswerQuestions
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((question) => renderQuestion(question))}
      </ScrollView>
    </KeyboardAware>
  );
}

const styles = StyleSheet.create({
  threeUp: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  questionCardThird: { width: '32%' },
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  header: {
    paddingVertical: 4,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.Ink,
  },
  headerTitle: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  progressBar: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  progressText: {
    fontFamily: 'Assistant',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.Muted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 22,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Muted,
  },
  errorTitle: {
    fontFamily: 'Assistant',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.Ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.Ink,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Chalk,
  },
  emptyState: {
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Assistant',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.015,
  },
  emptyBody: {
    fontFamily: 'Assistant',
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: Colors.Muted,
  },
  questionCard: {
    borderWidth: 1,
    borderColor: Colors.Hairline,
    borderRadius: 8,
    backgroundColor: Colors.Chalk,
    overflow: 'hidden',
  },
  questionHeader: {
    padding: 16,
    gap: 6,
  },
  questionLabel: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
    lineHeight: 16 * 1.35,
  },
  questionStatus: {
    fontFamily: 'Assistant',
    fontSize: 14,
    color: Colors.Muted,
  },
  answerField: {
    borderTopWidth: 1,
    borderTopColor: Colors.Hairline,
    padding: 16,
    gap: 8,
  },
  saveFailedText: {
    fontFamily: 'Assistant',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.SignalRed,
  },
  textInput: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
