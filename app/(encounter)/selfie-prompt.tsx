/**
 * ENCOUNTER SCREEN 1e: THE SELFIE PROMPT
 *
 * ⚠️ LEGALLY LOAD-BEARING: The permission prompt MUST state that the first
 * photo is kept and that retakes replace it (RULES 10.34). This disclosure
 * happens BEFORE the camera opens. Without this, 10.29 is a silent capture
 * and is not defensible.
 *
 * ⚠️ Skip IS allowed before the first capture. No photo, no 25 points (10.33).
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { useEffect, useRef } from 'react';

export default function SelfiePromptScreen() {
  const router = useRouter();

  // Ring animations
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      })
    ).start();
  }, [ringAnim]);

  const handleTakeSelfie = () => {
    // In production, this would open the camera
    // For now, navigate to review screen
    router.push('/(encounter)/selfie-review');
  };

  const handleSkip = () => {
    // RULES 10.33: Skip is allowed BEFORE first capture
    // No photo, no 25 points
    router.push('/(encounter)/pin-drop');
  };

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Waverly with ring - in Fern, not identity color */}
        <View style={styles.waverlyContainer}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 2.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={[styles.waverlyCircle, { backgroundColor: Colors.Fern }]}>
            <Waverly size={66} color={Colors.Chalk} wave />
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('encounter.selfiePrompt.title')}</Text>
          <Text style={styles.subtitle}>{t('encounter.selfiePrompt.subtitle')}</Text>
        </View>

        {/* Points display - in Fern */}
        <View style={styles.pointsContainer}>
          <Text style={[styles.points, { color: Colors.Fern }]}>
            {t('encounter.selfiePrompt.points')}
          </Text>
          <Text style={[styles.pointsLabel, { color: Colors.Fern }]}>
            {t('encounter.selfiePrompt.pointsLabel')}
          </Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.Ink }]}
          onPress={handleTakeSelfie}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.selfiePrompt.button')}
        >
          <Text style={[styles.buttonText, { color: Colors.Chalk }]}>
            {t('encounter.selfiePrompt.button')}
          </Text>
        </TouchableOpacity>

        {/* ⚠️ LEGALLY LOAD-BEARING DISCLOSURE per RULES 10.34 */}
        <Text style={styles.disclosure}>{t('encounter.selfiePrompt.disclosure')}</Text>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 30,
  },
  waverlyContainer: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: Colors.Fern,
  },
  waverlyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.9,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.Muted,
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
  },
  points: {
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  pointsLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  bottomContent: {
    paddingHorizontal: 30,
    paddingBottom: 34,
    gap: 12,
  },
  button: {
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  disclosure: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Faint,
    textAlign: 'center',
  },
});
