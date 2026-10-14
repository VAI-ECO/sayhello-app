/**
 * BLOCKED LIST SCREEN
 *
 * Shows people you've blocked with undo functionality.
 *
 * ⚠️ §24.8: Blocking is silent. Unblocking is silent too.
 * ⚠️ Declined nudges are NOT shown here — they're already permanent blocks with no UI.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useColumnStyle } from '../../../src/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer } from '../../../src/components/StatusBarSpacer';
import { api } from '../../../src/api/client';

interface BlockedUser {
  id: string;
  name: string;
  avatar?: string;
  blockedAt: string; // ISO date string
}

export default function BlockedListScreen() {
  const router = useRouter();

  const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'list'>('loading');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [undoingUserId, setUndoingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setViewState('loading');
    setError(null);

    const { data, error } = await api.get<{ blocks: BlockedUser[] }>('/safety/blocks');

    if (error) {
      setError(error.message);
      setViewState('error');
      return;
    }

    if (!data || !data.blocks || data.blocks.length === 0) {
      setViewState('empty');
      return;
    }

    setBlockedUsers(data.blocks);
    setViewState('list');
  };

  const handleUndo = async (userId: string) => {
    setUndoingUserId(userId);

    const { error } = await api.delete(`/safety/block/${userId}`);

    if (error) {
      setError(error.message);
      setUndoingUserId(null);
      return;
    }

    // Remove from local list
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));

    // If list is now empty, show empty state
    if (blockedUsers.length === 1) {
      setViewState('empty');
    }

    setUndoingUserId(null);
  };

  // T/D: centred column (700 / 900). D 1440 (RL-01-SN-59): list and the explanation card side by side (1.2fr / 1fr).
  const column = useColumnStyle();
  const desktop = useWindowDimensions().width >= 1024;
  const listContent = desktop ? [column, styles.twoUp] : column;
  const fullRow = desktop ? { width: '100%' as const } : null;

  const formatBlockedDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) return 'today';
    if (diffDays === 2) return 'yesterday';

    // Format as "12 Aug"
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <StatusBarSpacer height={46} />

      {/* Header */}
      <View style={[styles.header, column]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked</Text>
      </View>

      {/* Loading state */}
      {viewState === 'loading' && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.Ink} />
        </View>
      )}

      {/* Error state */}
      {viewState === 'error' && (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Couldn't load blocked list</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBlockedUsers}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {viewState === 'empty' && (
        <ScrollView style={styles.content} contentContainerStyle={column}>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>People you turned down aren't here</Text>
            <Text style={styles.explanationBody}>
              Saying no to a nudge already means you'll never be put together again. It happens quietly and there's nothing to manage. This list is only for people you met and then blocked.
            </Text>
          </View>

          <Text style={styles.footerNotice}>
            Undoing a block doesn't tell them anything either. You'll simply be able to be nudged again one day.
          </Text>
        </ScrollView>
      )}

      {/* List state */}
      {viewState === 'list' && (
        <ScrollView style={styles.content} contentContainerStyle={listContent}>
          <View style={desktop ? [styles.blockedList, { flex: 1.2 }] : styles.blockedList}>
            {blockedUsers.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.userRow,
                  index < blockedUsers.length - 1 && styles.userRowBorder,
                ]}
              >
                <View style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userMeta}>Blocked {formatBlockedDate(user.blockedAt)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.undoButton}
                  onPress={() => handleUndo(user.id)}
                  disabled={undoingUserId === user.id}
                >
                  <Text style={styles.undoButtonText}>
                    {undoingUserId === user.id ? 'Undoing...' : 'Undo'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={desktop ? [styles.explanationCard, { flex: 1 }] : styles.explanationCard}>
            <Text style={styles.explanationTitle}>People you turned down aren't here</Text>
            <Text style={styles.explanationBody}>
              Saying no to a nudge already means you'll never be put together again. It happens quietly and there's nothing to manage. This list is only for people you met and then blocked.
            </Text>
          </View>

          <Text style={[styles.footerNotice, fullRow]}>
            Undoing a block doesn't tell them anything either. You'll simply be able to be nudged again one day.
          </Text>

          {error && (
            <View style={[styles.errorBox, fullRow]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  twoUp: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, alignItems: 'flex-start' },
  container: {
    flex: 1,
    backgroundColor: Colors.Bone,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 4,
    paddingBottom: 14,
    gap: 12,
  },
  backButton: {
    fontSize: 17,
    color: Colors.Ink,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.Ink,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },

  // Center states (loading, error, empty)
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Ink,
  },
  errorMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.Muted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 27,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.Chalk,
  },

  // Blocked list
  blockedList: {
    backgroundColor: Colors.Chalk,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  userRow: {
    padding: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: Colors.Line,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.Ink,
  },
  userMeta: {
    fontSize: 13,
    color: Colors.Muted,
  },
  undoButton: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  undoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.Ink,
  },

  // Explanation card
  explanationCard: {
    backgroundColor: Colors.Chalk,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 15,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.Ink,
  },
  explanationBody: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.Muted,
  },

  // Footer notice
  footerNotice: {
    paddingHorizontal: 4,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.Muted,
    marginBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#C63A2C',
  },
});
