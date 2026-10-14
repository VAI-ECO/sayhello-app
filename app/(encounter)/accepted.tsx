/**
 * ENCOUNTER SCREEN 1b: ACCEPTED
 *
 * Thumbs-up Waverly pops in, +25 points drift up.
 * Same ground colour as nudge so it reads as the same screen answering.
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { darkenColor } from '../../src/theme/contrast';
import { useEffect, useRef } from 'react';

export default function AcceptedScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();

  const otherPersonColor = identityColor;
  const groundColor = darkenColor(otherPersonColor);

  // Animations
  const waverlyScale = useRef(new Animated.Value(0.4)).current;
  const waverlyRotate = useRef(new Animated.Value(0)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;
  const pointsTranslateY = useRef(new Animated.Value(8)).current;

  // Ring animation
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Waverly pop animation
    Animated.parallel([
      Animated.timing(waverlyScale, {
        toValue: 1,
        duration: 620,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(waverlyRotate, {
          toValue: -18,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(waverlyRotate, {
          toValue: 4,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(waverlyRotate, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Points tally animation
    Animated.parallel([
      Animated.timing(pointsOpacity, {
        toValue: 1,
        duration: 500,
        delay: 340,
        useNativeDriver: true,
      }),
      Animated.timing(pointsTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 340,
        useNativeDriver: true,
      }),
    ]).start();

    // Ring animations
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
  }, [waverlyScale, waverlyRotate, pointsOpacity, pointsTranslateY, ring1Anim, ring2Anim]);

  const handleContinue = () => {
    router.push('/(encounter)/arrow');
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
                  outputRange: [0.5, 0],
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
            <Animated.View
              style={{
                transform: [
                  { scale: waverlyScale },
                  { rotate: waverlyRotate.interpolate({
                    inputRange: [-18, 18],
                    outputRange: ['-18deg', '18deg'],
                  })},
                ],
              }}
            >
              <Waverly size={178} color={Colors.Chalk} />
            </Animated.View>
          </View>
        </View>

        {/* Points display */}
        <Animated.View
          style={[
            styles.pointsContainer,
            {
              opacity: pointsOpacity,
              transform: [{ translateY: pointsTranslateY }],
            },
          ]}
        >
          <View style={styles.pointsRow}>
            <Text style={styles.points}>{t('encounter.accepted.points')}</Text>
            <Text style={styles.pointsLabel}>{t('encounter.accepted.pointsLabel')}</Text>
          </View>
          <Text style={styles.body}>{t('encounter.accepted.body')}</Text>
        </Animated.View>
      </View>

      {/* Bottom button */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.accepted.continue')}
        >
          <Text style={[styles.continueText, { color: groundColor }]}>
            {t('encounter.accepted.continue')}
          </Text>
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
    gap: 30,
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
  pointsContainer: {
    alignItems: 'center',
    gap: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
  },
  points: {
    fontSize: 52,
    lineHeight: 52,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -1.6,
  },
  pointsLabel: {
    fontSize: 19,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  bottomContent: {
    paddingHorizontal: 26,
    paddingBottom: 38,
  },
  continueButton: {
    backgroundColor: Colors.Chalk,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
