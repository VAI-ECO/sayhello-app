/**
 * ENCOUNTER SCREEN 1c: THE ARROW
 *
 * Directional guidance toward the other person.
 * ⚠️ NO DISTANCE - never states a distance (RULES 8.12).
 *
 * Direction needs phone-to-phone ranging (UWB / BLE hot-cold, §8.9), which is
 * not built and waits on the §8 proximity ruling. The screen says so plainly
 * and sends people to the code instead: no pointing arrow, no mock bearing.
 * Identity stays behind the reveal gate, so no name or photo here either.
 */

import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { useEffect, useRef } from 'react';
import { EncounterStage } from '../../src/components/ScreenContainer';
import { getActiveHelloId } from '../../src/state/active-hello';
import { useBleConfirmation } from '../../src/lib/use-ble-confirmation';

export default function ArrowScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  // W8-A (built OFF): keep Bluetooth confirming while this screen is up; a confirmed proof moves on like a scan.
  useBleConfirmation({
    helloId: getActiveHelloId(),
    active: true,
    onConfirmed: () => router.replace('/(encounter)/selfie-prompt'),
    onLost: () => router.replace('/(encounter)/missed-connection'),
  });

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
    <EncounterStage style={styles.container}>
      {/* Status bar spacer */}
      <StatusBarSpacer height={44} />

      {/* Headline */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>
          They said yes too. Go{' '}
          <Text style={styles.dreamingText}>Say Hello</Text>.
        </Text>
      </View>

      {/* Card: Waverly only; no direction, no identity before reveal */}
      <View style={styles.photoContainer}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderText}>{t('encounter.arrow.unavailable')}</Text>
        </View>

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
              ],
            },
          ]}
        >
          <View style={[styles.waverlyBadge, { backgroundColor: identityColor }]}>
            <Waverly size={31} color={Colors.Chalk} />
          </View>
        </Animated.View>
      </View>

      {/* NO DISTANCE per RULES 8.12 */}
      <View style={styles.bottomSpacer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/(encounter)/scan')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.arrow.next')}
        >
          <Text style={styles.nextText}>{t('encounter.arrow.next')}</Text>
        </TouchableOpacity>
      </View>
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
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
    minHeight: 46,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Chalk,
  },
});
