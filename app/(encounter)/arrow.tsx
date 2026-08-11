/**
 * ENCOUNTER SCREEN 1c: THE ARROW
 *
 * Directional guidance toward the other person.
 * ⚠️ NO DISTANCE - never states a distance (RULES 8.12).
 * Still no profile details beyond photo and name.
 */

import { View, Text, StyleSheet, Animated } from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { useEffect, useRef } from 'react';

export default function ArrowScreen() {
  const { identityColor } = useTheme();

  // For production, these would come from encounter data
  const otherPersonName = 'Mara';

  // Lean animation for arrow
  const leanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leanAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(leanAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [leanAnim]);

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Headline */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>
          They said yes too. Waverly's pointing. Go{' '}
          <Text style={styles.dreamingText}>Say Hello</Text>.
        </Text>
      </View>

      {/* Photo with arrow and Waverly badge */}
      <View style={styles.photoContainer}>
        {/* Placeholder photo background */}
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderText}>Her photo — this is how you'll know her</Text>
        </View>

        {/* Name overlay at bottom */}
        <View style={styles.nameOverlay}>
          <Text style={styles.name}>{otherPersonName}</Text>
        </View>

        {/* Arrow and Waverly badge */}
        <Animated.View
          style={[
            styles.arrowContainer,
            {
              transform: [
                {
                  translateY: leanAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -9, 0],
                  }),
                },
                {
                  rotate: leanAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['-4deg', '4deg', '-4deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.arrow}>↑</Text>
          <View style={[styles.waverlyBadge, { backgroundColor: identityColor }]}>
            <Waverly size={31} color={Colors.Chalk} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom spacer - NO DISTANCE per RULES 8.12 */}
      <View style={styles.bottomSpacer} />
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
  headlineContainer: {
    paddingHorizontal: 26,
    paddingVertical: 8,
    paddingBottom: 14,
  },
  headline: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.7,
  },
  dreamingText: {
    fontFamily: 'Dreaming',
    fontSize: 37, // 1.42em of 26px
    lineHeight: 22, // 0.85 of 26px
    fontWeight: '400',
  },
  photoContainer: {
    flex: 1,
    marginHorizontal: 22,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F0F5FB',
    position: 'relative',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.Muted,
    textAlign: 'center',
  },
  nameOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 18,
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.8,
  },
  arrowContainer: {
    position: 'absolute',
    right: 14,
    top: 14,
    alignItems: 'center',
    gap: 6,
  },
  arrow: {
    fontSize: 46,
    lineHeight: 46,
    color: Colors.Chalk,
    textShadowColor: 'rgba(10,10,10,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  waverlyBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.Chalk,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(10,10,10,0.28)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  bottomSpacer: {
    height: 46,
  },
});
