/**
 * ENCOUNTER SCREEN 1a: THE NUDGE
 *
 * Full-bleed in the OTHER person's identity colour (darkened ground).
 * No profile, no name, no photo — mutual accept comes first (RULES 10.6).
 * ⚠️ NEVER state a distance (RULES 8.12).
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { darkenColor } from '../../src/theme/contrast';
import { useEffect, useRef } from 'react';

export default function NudgeScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();

  // For this screen, we use the OTHER person's identity color
  // In production, this would come from the encounter data
  // For now, using the user's own color as placeholder
  const otherPersonColor = identityColor;
  const groundColor = darkenColor(otherPersonColor);

  // Ring animation
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createRingAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createRingAnimation(ring1Anim, 0),
      createRingAnimation(ring2Anim, 900),
    ]).start();
  }, [ring1Anim, ring2Anim]);

  const handleAccept = () => {
    router.push('/(encounter)/accepted');
  };

  const handleDecline = () => {
    // Per RULES 10.20, 10.21: The decliner never learns who accepted
    // The app never explains non-acceptance
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: groundColor }]}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Waverly with rings */}
        <View style={styles.waverlyContainer}>
          {/* Ring 1 */}
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 0],
                }),
                transform: [
                  {
                    scale: ring1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.62, 1.5],
                    }),
                  },
                ],
              },
            ]}
          />
          {/* Ring 2 */}
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0],
                }),
                transform: [
                  {
                    scale: ring2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.62, 1.5],
                    }),
                  },
                ],
              },
            ]}
          />
          {/* Waverly disc */}
          <View style={[styles.waverlyDisc, { backgroundColor: otherPersonColor }]}>
            <Waverly size={168} color={Colors.Chalk} wave />
          </View>
        </View>

        {/* Headline with Dreaming lockup */}
        <Text style={styles.headline}>
          It's time to{' '}
          <Text style={styles.dreamingText}>Say Hello</Text>.
        </Text>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomContent}>
        <Text style={styles.body}>{t('encounter.nudge.body')}</Text>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.nudge.accept')}
        >
          <Text style={[styles.acceptText, { color: groundColor }]}>
            {t('encounter.nudge.accept')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDecline}
          activeOpacity={0.7}
          style={styles.declineButton}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.nudge.decline')}
        >
          <Text style={styles.declineText}>{t('encounter.nudge.decline')}</Text>
        </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
    paddingHorizontal: 24,
  },
  waverlyContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  waverlyDisc: {
    width: 288,
    height: 288,
    borderRadius: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.9,
    textAlign: 'center',
  },
  dreamingText: {
    fontFamily: 'Dreaming',
    fontSize: 45, // 1.42em of 32px
    lineHeight: 27, // 0.85 of 32px
    fontWeight: '400',
  },
  bottomContent: {
    paddingHorizontal: 26,
    paddingBottom: 30,
    gap: 13,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: Colors.Chalk,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.Chalk,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: 18,
    fontWeight: '700',
  },
  declineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  declineText: {
    fontSize: 15,
    color: Colors.Chalk,
    textAlign: 'center',
  },
});
