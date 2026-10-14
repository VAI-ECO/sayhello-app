/**
 * ENCOUNTER SCREEN 1b: ACCEPTED
 *
 * Thumbs-up Waverly pops in, +25 points drift up.
 * Same ground colour as nudge so it reads as the same screen answering.
 */

import { hasSeenSafetyGuidance } from '../../src/state/safety-guidance';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer, useBottomPad } from '../../src/components/StatusBarSpacer';
import { darkenColor } from '../../src/theme/contrast';
import { useEffect, useRef, useState } from 'react';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { getAward } from '../../src/state/active-hello';
import { getHelloPoints } from '../../src/api/hellos';
import { EncounterStage } from '../../src/components/ScreenContainer';
import { useBleConfirmation } from '../../src/lib/use-ble-confirmation';

export default function AcceptedScreen() {
  const router = useRouter();
  const footerPad = useBottomPad(38);
  const { identityColor } = useTheme();
  const { helloId, hello, gone, loading, reload, error } = useEncounterHello();
  const [checking, setChecking] = useState(false);
  const mutual = hello?.status === 'accepted';
  // W8-A (built OFF): Accept brought the app forward, so Bluetooth may now confirm the meeting (RULES 8.11). Silent on failure.
  useBleConfirmation({
    helloId: helloId ?? null,
    active: mutual && !hello?.qrScanned,
    onConfirmed: () => router.replace('/(encounter)/selfie-prompt'),
    // Lost (10.23): the server closed it as missed; Waverly's line shows on the next screen. No reason, no distance.
    onLost: () => router.replace('/(encounter)/missed-connection'),
  });
  // §4.2 — the accept award is paid on this person's OWN accept, kept whether or not
  // the other person accepts, so it can show while waiting too. It is read from the
  // server ledger (GET /hellos/:id/points): the half-accept response is the bare
  // silence shape and never carries it. The mutual-accept response's own award is
  // the fallback if that read fails. Nothing is shown unless the server reported it.
  const [ledgerAward, setLedgerAward] = useState<number | null>(null);
  useEffect(() => {
    if (!helloId) return;
    let live = true;
    void getHelloPoints(helloId).then(res => {
      if (live && res.data?.points) setLedgerAward(res.data.points.accept);
    });
    return () => { live = false; };
  }, [helloId, hello?.status]);
  const award = ledgerAward ?? (helloId ? getAward(helloId, 'accept') : null);

  // Still unanswered at its expiry, or closed: leave quietly (§10.20, §10.21).
  useEffect(() => {
    if (gone && !loading) router.back();
  }, [gone, loading, router]);

  useEffect(() => {
    if (hello?.status === 'missed') router.replace('/(encounter)/missed-connection');
  }, [hello, router]);

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

  const handleContinue = async () => {
    if (mutual) {
      // The safety guidance comes once, before the first meet on this device (RULES §24.18, §36.6).
      const seen = await hasSeenSafetyGuidance();
      router.push(seen ? '/(encounter)/arrow' : '/(encounter)/safety');
      return;
    }
    // Waiting on the other side: ask the server again; no timer, no guess.
    if (checking) return;
    setChecking(true);
    await reload();
    setChecking(false);
  };

  return (
    <EncounterStage background={groundColor} style={[styles.container, { backgroundColor: groundColor }]}>
      {/* Status bar spacer */}
      <StatusBarSpacer height={44} />

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
          {award != null && award > 0 ? (
            <View style={styles.pointsRow} testID="accept-points">
              <Text style={styles.points}>{t('encounter.common.pointsValue', { points: award })}</Text>
              <Text style={styles.pointsLabel}>{t('encounter.accepted.pointsLabel')}</Text>
            </View>
          ) : null}
          <Text style={styles.body}>
            {t(mutual ? 'encounter.accepted.bodyMutual' : 'encounter.accepted.bodyWaiting')}
          </Text>
          {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
        </Animated.View>
      </View>

      {/* Bottom button */}
      <View style={[styles.bottomContent, { paddingBottom: footerPad }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={checking || (!hello && loading)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t(mutual ? 'encounter.accepted.continue' : 'encounter.accepted.checkAgain')}
        >
          <Text style={[styles.continueText, { color: groundColor }]}>
            {t(mutual ? 'encounter.accepted.continue' : 'encounter.accepted.checkAgain')}
          </Text>
        </TouchableOpacity>
      </View>
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
