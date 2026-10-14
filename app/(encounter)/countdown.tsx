/**
 * ENCOUNTER SCREEN 1g: THE COUNTDOWN
 *
 * Reveal is 3 hours out (RULES 10.12).
 * Shows hours + minutes, NO seconds (RULES 10.14).
 * This replaces What's Happening as the default view while live (RULES 10.13).
 *
 * Background: identity color blended 35% over Midnight #1E2B63
 * Multiple countdowns stack as a carousel (not implemented in this version).
 */

import { View, Text, StyleSheet } from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';

// Helper to blend identity color 35% over Midnight
function blendColorOverMidnight(identityColor: string): string {
  // For production, this would do actual color blending
  // For now, using a hardcoded example (Fuchsia blended gives #57316D)
  // This should be implemented as proper color blending
  return '#57316D';
}

export default function CountdownScreen() {
  const { identityColor } = useTheme();
  const blendedBackground = blendColorOverMidnight(identityColor);

  // For production, these would come from encounter data
  const otherPersonName = 'Mara';
  const locationName = 'Otero Coffee';
  const timestamp = 'Tuesday, 4:12pm';
  const hoursRemaining = 2;
  const minutesRemaining = 47;

  return (
    <View style={[styles.container, { backgroundColor: blendedBackground }]}>
      {/* Status bar */}
      <View style={styles.statusBar} />

      {/* Header with Waverly */}
      <View style={styles.header}>
        <View style={styles.waverlyBadge}>
          <Waverly size={18} color={Colors.Chalk} />
        </View>
        <Text style={styles.headerText}>{t('encounter.countdown.header')}</Text>
      </View>

      {/* Photo carousel */}
      <View style={styles.photoSection}>
        <View style={styles.photoContainer}>
          {/* Placeholder for other person's photo */}
          <View style={styles.photoPlaceholder}>
            <Text style={styles.placeholderText}>{otherPersonName}'s photo</Text>
          </View>

          {/* Name and location overlay */}
          <View style={styles.photoOverlay}>
            <Text style={styles.name}>{otherPersonName}</Text>
            <Text style={styles.location}>{`${locationName} · ${timestamp}`}</Text>
          </View>
        </View>

        {/* Carousel dots (for multiple countdowns) */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Countdown clock */}
      <View style={styles.clockSection}>
        <Text style={styles.clock}>
          {hoursRemaining}h {minutesRemaining}m
        </Text>
        <Text style={styles.clockLabel}>{t('encounter.countdown.until')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
  },
  waverlyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.86)',
  },
  photoSection: {
    flex: 1,
    paddingHorizontal: 22,
    minHeight: 0,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    minHeight: 0,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 18,
    backgroundColor: 'rgba(10,10,10,0.82)',
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.78,
  },
  location: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingTop: 14,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.Chalk,
  },
  clockSection: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 4,
  },
  clock: {
    fontSize: 68,
    lineHeight: 68,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -2.9,
  },
  clockLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.66)',
  },
});
