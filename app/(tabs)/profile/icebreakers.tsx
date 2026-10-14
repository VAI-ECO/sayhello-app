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
import { api } from '../../../src/api/client';

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

  // Track in-flight saves to handle collapse during save
  const savingRef = useRef<Set<string>>(new Set());

  // Load questions and answers on mount
  useEffect(() => {
    loadData();
  }, []);

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

      // Build answers map and expanded set
      const answersMap = new Map<string, Answer>();
      const expanded = new Set<string>();
      const drafts = new Map<string, string>();

      loadedAnswers.forEach((answer: Answer) => {
        answersMap.set(answer.questionId, answer);
        if (answer.freeTextAnswer) {
          expanded.add(answer.questionId); // Questions with answers start expanded
          drafts.set(answer.questionId, answer.freeTextAnswer);
        }
      });

      setAnswers(answersMap);
      setExpandedQuestions(expanded);
      setDraftText(drafts);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load icebreakers');
      setLoading(false);
    }
  };

  // RULES 13.5: Tapping question toggles expansion
  const handleQuestionPress = (questionId: string) => {
    // If save is in flight, don't allow collapse
    if (savingRef.current.has(questionId)) {
      return;
    }

    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId); // Collapse
      } else {
        next.add(questionId); // Expand
      }
      return next;
    });
  };

  // RULES 13.7: Update draft text (kept in memory even when collapsed)
  const handleTextChange = (questionId: string, text: string) => {
    setDraftText((prev) => {
      const next = new Map(prev);
      next.set(questionId, text);
      return next;
    });
  };

  // Auto-save answer when field loses focus
  const handleBlur = async (questionId: string) => {
    const text = draftText.get(questionId) || '';
    const trimmed = text.trim();

    // Mark as saving
    savingRef.current.add(questionId);

    try {
      // Save to API
      const result = await api.icebreakers.saveAnswer(questionId, {
        freeTextAnswer: trimmed || undefined,
        contentLanguage: 'en-US', // TODO: Get from device settings
      });

      if (result.error) {
        console.error('[Icebreakers] Failed to save answer:', result.error);
        // Don't show error to user — they can retry by editing again
        savingRef.current.delete(questionId); // Clear flag after error
        return;
      }

      // Update local state
      setAnswers((prev) => {
        const next = new Map(prev);
        if (trimmed === '') {
          next.delete(questionId); // Remove answer if empty
        } else if ((result.data as any)?.answer) {
          next.set(questionId, (result.data as any).answer); // Save answer
        }
        return next;
      });

      // Clear saving flag after successful save
      savingRef.current.delete(questionId);
    } catch (error) {
      // Handle unexpected errors (network failures, etc.)
      console.error('[Icebreakers] Save failed with exception:', error);
      savingRef.current.delete(questionId);
    }
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
    const draftValue = draftText.get(question.id) || '';

    return (
      <View key={question.id} style={desktop ? [styles.questionCard, styles.questionCardThird] : styles.questionCard}>
        <TouchableOpacity
          onPress={() => handleQuestionPress(question.id)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          testID={`question-${question.id}`}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>{question.questionText}</Text>
            <Text style={styles.questionStatus}>
              {hasAnswer
                ? t('icebreakers.questionAnswered')
                : t('icebreakers.questionUnanswered')}
            </Text>
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
  },
  textInput: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
