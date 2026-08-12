/**
 * ICEBREAKERS SCREEN
 *
 * Browsable library of questions — users type their own answers.
 *
 * RULES:
 * - 13.1-13.3: Tree structure (parent_id, arbitrary depth)
 * - 13.4: User's written entry IS the Icebreaker
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
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import {
  getMockIcebreakerNodes,
  getMockIcebreakerAnswers,
  saveMockIcebreakerAnswer,
  type IcebreakerNode,
  type IcebreakerAnswer,
} from '../../../src/data/mockIcebreakersData';

export default function IcebreakersScreen() {
  const router = useRouter();
  const [nodes, setNodes] = useState<IcebreakerNode[]>([]);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [draftText, setDraftText] = useState<Map<string, string>>(new Map());

  // Load nodes and answers on mount
  useEffect(() => {
    const loadedNodes = getMockIcebreakerNodes();
    const loadedAnswers = getMockIcebreakerAnswers();

    setNodes(loadedNodes);

    // Build answers map
    const answersMap = new Map<string, string>();
    const expanded = new Set<string>();
    loadedAnswers.forEach((answer) => {
      answersMap.set(answer.node_id, answer.text);
      expanded.add(answer.node_id); // Questions with answers start expanded
    });
    setAnswers(answersMap);
    setExpandedQuestions(expanded);

    // Initialize draft text with saved answers
    const drafts = new Map<string, string>();
    loadedAnswers.forEach((answer) => {
      drafts.set(answer.node_id, answer.text);
    });
    setDraftText(drafts);
  }, []);

  const answerCount = answers.size;

  // RULES 13.5: Tapping question toggles expansion
  const handleQuestionPress = (nodeId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId); // Collapse
      } else {
        next.add(nodeId); // Expand
      }
      return next;
    });
  };

  // RULES 13.7: Update draft text (kept in memory even when collapsed)
  const handleTextChange = (nodeId: string, text: string) => {
    setDraftText((prev) => {
      const next = new Map(prev);
      next.set(nodeId, text);
      return next;
    });
  };

  // Auto-save answer when field loses focus
  const handleBlur = (nodeId: string) => {
    const text = draftText.get(nodeId) || '';
    const trimmed = text.trim();

    // Save to mock API
    saveMockIcebreakerAnswer(nodeId, trimmed);

    // Update local state
    setAnswers((prev) => {
      const next = new Map(prev);
      if (trimmed === '') {
        next.delete(nodeId); // Remove answer if empty
      } else {
        next.set(nodeId, trimmed); // Save answer
      }
      return next;
    });
  };

  // Render selectable question (leaf node)
  const renderQuestion = (node: IcebreakerNode) => {
    const isExpanded = expandedQuestions.has(node.id);
    const hasAnswer = answers.has(node.id);
    const draftValue = draftText.get(node.id) || '';

    return (
      <View key={node.id} style={styles.questionCard}>
        <TouchableOpacity
          onPress={() => handleQuestionPress(node.id)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          testID={`question-${node.id}`}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>{node.label}</Text>
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
              onChangeText={(text) => handleTextChange(node.id, text)}
              onBlur={() => handleBlur(node.id)}
              placeholder={t('icebreakers.fieldPlaceholder')}
              placeholderTextColor={Colors.Muted}
              multiline
              accessibilityLabel={t('icebreakers.fieldLabel')}
              testID={`answer-input-${node.id}`}
            />
          </View>
        )}
      </View>
    );
  };

  // Render node (recursive for tree support)
  const renderNode = (node: IcebreakerNode) => {
    if (node.selectable) {
      return renderQuestion(node);
    }
    // Future: render category headers for non-selectable parent nodes
    return null;
  };

  // Header copy (plain counts, no completion badge)
  const headerText =
    answerCount === 0
      ? t('icebreakers.headerDefault')
      : t('icebreakers.headerCount', { count: answerCount });

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Header with back button */}
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

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText} testID="icebreakers-count">
          {headerText}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Empty state */}
        {nodes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {t('icebreakers.emptyTitle')}
            </Text>
            <Text style={styles.emptyBody}>{t('icebreakers.emptyBody')}</Text>
          </View>
        )}

        {/* Question list */}
        {nodes
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((node) => renderNode(node))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  statusBar: {
    height: 44,
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
