/**
 * ENCOUNTER SCREEN 1h: THE REVEAL
 *
 * Profiles open ONLY if both say yes (RULES 10.6).
 * A late accept reads "[Name] accepted your hello" — no timestamp,
 * no elapsed time, indistinguishable from immediate (RULES 10.22).
 *
 * Minimal decoration. This is the screen somebody screenshots.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';

// Helper to blend identity color 35% over Midnight
function blendColorOverMidnight(identityColor: string): string {
  // For production, this would do actual color blending
  return '#57316D';
}

export default function RevealScreen() {
  const { identityColor } = useTheme();
  const blendedBackground = blendColorOverMidnight(identityColor);

  // For production, these would come from encounter data
  const otherPersonName = 'Mara';
  const locationName = 'Otero Coffee';
  const timestamp = 'Tuesday, 4:12pm';

  // Sample icebreakers
  const icebreakers = [
    {
      question: "What's something you'd tell a stranger that you wouldn't tell somebody you know?",
      answer: "I've been quietly planning to quit and move to Lisbon for about four years.",
    },
    {
      question: "What's a tiny adventure you'd actually say yes to?",
      answer: "Driving two hours somewhere with no plan and eating at whatever looks worst from the outside.",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Status bar with blended background */}
      <View style={[styles.statusBar, { backgroundColor: blendedBackground }]} />

      {/* Header section */}
      <View style={[styles.headerSection, { backgroundColor: blendedBackground }]}>
        <View style={styles.waverlyRow}>
          <View style={styles.waverlyBadge}>
            <Waverly size={17} color={Colors.Chalk} />
          </View>
          <Text style={styles.headerText}>{t('encounter.reveal.header')}</Text>
        </View>

        <View style={styles.profileRow}>
          {/* Avatar placeholder */}
          <View style={[styles.avatar, { backgroundColor: Colors.Amber }]}>
            <View style={styles.avatarFace} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{otherPersonName}</Text>
            <Text style={styles.location}>{`${locationName} · ${timestamp}`}</Text>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
        {/* Selfie */}
        <View style={styles.selfieContainer}>
          <View style={styles.selfiePlaceholder}>
            <Text style={styles.selfiePlaceholderText}>The selfie you took together</Text>
          </View>
        </View>

        {/* Icebreakers */}
        <View style={styles.icebreakerSection}>
          {icebreakers.map((item, index) => (
            <View key={index}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.icebreakerItem}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('encounter.reveal.moreBelow')}</Text>
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
    height: 44,
  },
  headerSection: {
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 26,
    gap: 16,
  },
  waverlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  waverlyBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.82)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avatarFace: {
    width: 38,
    height: 44,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  profileInfo: {
    gap: 3,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.62,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.68)',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    flexGrow: 1,
  },
  selfieContainer: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.Canvas,
  },
  selfiePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfiePlaceholderText: {
    fontSize: 15,
    color: Colors.Muted,
  },
  icebreakerSection: {
    paddingHorizontal: 26,
    paddingTop: 20,
  },
  icebreakerItem: {
    paddingVertical: 17,
    gap: 7,
  },
  question: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.Faint,
  },
  answer: {
    fontSize: 20,
    lineHeight: 27,
    color: Colors.Ink,
    letterSpacing: -0.24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.Line,
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: Colors.Faint,
    textAlign: 'center',
  },
});
