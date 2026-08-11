/**
 * ENCOUNTER SCREEN 1i: MISSED CONNECTION
 *
 * Same design as reveal, one line changed, NO PHOTO.
 * ⚠️ NOT framed as a rejection (RULES 10.21).
 * The app NEVER explains non-acceptance.
 *
 * Icebreakers still exchange. Accept points stand. No pin, no second wave,
 * no chat (RULES 10.25).
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

export default function MissedConnectionScreen() {
  const { identityColor } = useTheme();
  const blendedBackground = blendColorOverMidnight(identityColor);

  // For production, these would come from encounter data
  const otherPersonName = 'Theo';
  const locationName = 'Sunset Lanes';
  const timestamp = 'Thursday, 7:30pm';

  // Sample icebreakers
  const icebreakers = [
    {
      question: "What's something you'd love to be invited to?",
      answer: "Anything involving a long table, too much food, and people who don't know each other yet.",
    },
    {
      question: 'What are you weirdly good at?',
      answer: 'Naming the year a song came out within about twelve months. Every time.',
    },
    {
      question: "What's one thing you'd love someone to ask you about?",
      answer: 'The bowling league I joined as a joke and now take extremely seriously.',
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
          <Text style={styles.headerText}>{t('encounter.missedConnection.header')}</Text>
        </View>

        <View style={styles.profileRow}>
          {/* Avatar placeholder - in Fern for this example */}
          <View style={[styles.avatar, { backgroundColor: Colors.Fern }]}>
            <View style={styles.avatarFace} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{otherPersonName}</Text>
            <Text style={styles.location}>{`${locationName} · ${timestamp}`}</Text>
          </View>
        </View>
      </View>

      {/* Scrollable content - NO PHOTO per RULES 10.25 */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
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

      {/* Footer with points message */}
      <View style={styles.footer}>
        <View style={styles.pointsRow}>
          <View style={[styles.waverlyBadgeSmall, { backgroundColor: Colors.Fern }]}>
            <Waverly size={17} color={Colors.Chalk} />
          </View>
          <Text style={styles.pointsText}>
            {t('encounter.missedConnection.points')}
          </Text>
        </View>
        <Text style={styles.footerText}>{t('encounter.missedConnection.moreBelow')}</Text>
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
    alignItems: 'flex-start',
    gap: 11,
  },
  waverlyBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
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
  icebreakerSection: {
    paddingHorizontal: 26,
    paddingTop: 22,
  },
  icebreakerItem: {
    paddingVertical: 18,
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
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderTopWidth: 1,
    borderTopColor: Colors.Line,
    paddingTop: 14,
  },
  waverlyBadgeSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: 16,
    color: Colors.Ink,
  },
  footerText: {
    fontSize: 14,
    color: Colors.Faint,
    textAlign: 'center',
  },
});
