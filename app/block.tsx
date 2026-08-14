/**
 * BLOCK CONFIRMATION SCREEN
 *
 * Confirms blocking a person with three consequences stated upfront.
 *
 * ⚠️ §24.8 and §24.16: Blocking is SILENT — blocked person's experience indistinguishable from ordinary quiet.
 * ⚠️ §24.12: Pin stays — blocking ends contact, not history.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../src/theme';
import { api } from '../src/api/client';

export default function BlockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const userId = params.userId as string;
  const userName = params.name as string;
  const userGender = params.gender as string | undefined; // 'male' | 'female' | undefined

  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gender-specific pronouns
  const pronounSubject = userGender === 'male' ? 'He' : userGender === 'female' ? 'She' : 'They';
  const pronounObject = userGender === 'male' ? 'him' : userGender === 'female' ? 'her' : 'them';

  const handleBlock = async () => {
    setIsBlocking(true);
    setError(null);

    const { error } = await api.post('/safety/block', { blockedUserId: userId });

    if (error) {
      setError(error.message);
      setIsBlocking(false);
      return;
    }

    // Success - go back
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Main content - vertically centered */}
      <View style={styles.content}>
        {/* Header with avatar and title */}
        <View style={styles.header}>
          <View style={styles.avatar} />
          <Text style={styles.title}>Block {userName}?</Text>
        </View>

        {/* Three consequences */}
        <View style={styles.consequencesList}>
          <View style={styles.consequenceRow}>
            <View style={[styles.icon, styles.iconStop]}>
              <Text style={styles.iconText}>×</Text>
            </View>
            <Text style={styles.consequenceText}>You'll never be nudged towards each other again.</Text>
          </View>

          <View style={styles.consequenceRow}>
            <View style={[styles.icon, styles.iconStop]}>
              <Text style={styles.iconText}>×</Text>
            </View>
            <Text style={styles.consequenceText}>No messages, either way.</Text>
          </View>

          <View style={styles.consequenceRow}>
            <View style={[styles.icon, styles.iconStay]}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <Text style={styles.consequenceText}>Your pin stays. You did meet.</Text>
          </View>
        </View>

        {/* Silence explanation */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>{pronounSubject} won't be told</Text>
          <Text style={styles.explanationBody}>
            No message, no missing profile, nothing that looks different from the app simply not putting you two together. That's how everything works here — the app never explains why somebody didn't turn up.
          </Text>
        </View>

        {/* Undo notice */}
        <Text style={styles.undoNotice}>
          You can undo this any time in Settings, under Blocked.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.blockButton}
          onPress={handleBlock}
          disabled={isBlocking}
        >
          <Text style={styles.blockButtonText}>
            {isBlocking ? 'Blocking...' : `Block ${pronounObject}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isBlocking}
        >
          <Text style={styles.cancelButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  statusBar: {
    height: 46,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 46,
    backgroundColor: Colors.Line,
  },
  title: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '800',
    color: Colors.Ink,
    letterSpacing: -0.75,
  },

  // Consequences list
  consequencesList: {
    backgroundColor: Colors.Hairline,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
    gap: 1,
  },
  consequenceRow: {
    backgroundColor: Colors.Chalk,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  iconStop: {
    backgroundColor: Colors.Ink,
  },
  iconStay: {
    backgroundColor: Colors.Fern,
  },
  iconText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.Chalk,
  },
  consequenceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.Ink,
  },

  // Explanation card
  explanationCard: {
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 16,
    gap: 5,
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

  // Undo notice
  undoNotice: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Muted,
  },

  // Error
  errorBox: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#C63A2C',
  },

  // Footer
  footer: {
    padding: 14,
    paddingHorizontal: 26,
    paddingBottom: 26,
    gap: 10,
  },
  blockButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 27,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.Chalk,
  },
  cancelButton: {
    backgroundColor: Colors.Bone,
    borderRadius: 27,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.Ink,
  },
});
