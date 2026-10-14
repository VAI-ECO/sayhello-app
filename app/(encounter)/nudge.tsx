/**
 * ENCOUNTER SCREEN 1a: THE NUDGE
 *
 * Full-bleed in the OTHER person's identity colour (darkened ground).
 * No profile, no name, no photo — mutual accept comes first (RULES 10.6).
 * ⚠️ NEVER state a distance (RULES 8.12).
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer, useBottomPad } from '../../src/components/StatusBarSpacer';
import { darkenColor } from '../../src/theme/contrast';
import { useEffect, useRef, useState } from 'react';
import { acceptHello, declineHello } from '../../src/api/hellos';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { routeForHello } from '../../src/lib/encounter';
import { recordAward } from '../../src/state/active-hello';
import { EncounterStage } from '../../src/components/ScreenContainer';

export default function NudgeScreen() {
  const router = useRouter();
  const footerPad = useBottomPad(30);
  const { identityColor } = useTheme();
  const { helloId, hello, loading, error: loadError, gone, reload } = useEncounterHello();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acting = useRef(false);

  // The design wants the OTHER person's colour, but identity is withheld until
  // after mutual accept (§10.6), so the ground uses this phone's own colour.
  const otherPersonColor = identityColor;
  const groundColor = darkenColor(otherPersonColor);

  // Already past the nudge (mutual accept, reveal, missed): go to that step.
  useEffect(() => {
    if (hello && hello.status !== 'pending') router.replace(routeForHello(hello));
  }, [hello, router]);

  // Gone means expired or closed; leave without a word (§10.21).
  useEffect(() => {
    if (gone && !loading) router.back();
  }, [gone, loading, router]);

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

  const handleAccept = async () => {
    if (!helloId || acting.current) return;
    acting.current = true;
    setBusy(true);
    setError(null);
    const res = await acceptHello(helloId);
    acting.current = false;
    setBusy(false);
    if (res.error) {
      if (res.error.status === 404 || res.error.status === 403) { router.back(); return; }
      setError(res.error.message || t('encounter.common.failed'));
      return;
    }
    // Only a mutual accept carries an award; a half-accept is the silence shape.
    recordAward(helloId, 'accept', res.data?.pointsAwarded);
    router.push('/(encounter)/accepted');
  };

  const handleDecline = async () => {
    // Per RULES 10.20, 10.21: The decliner never learns who accepted
    // The app never explains non-acceptance
    if (!helloId || acting.current) return;
    acting.current = true;
    setBusy(true);
    setError(null);
    const res = await declineHello(helloId);
    acting.current = false;
    setBusy(false);
    if (res.error && res.error.status !== 404 && res.error.status !== 403) {
      setError(res.error.message || t('encounter.common.failed'));
      return;
    }
    router.back();
  };

  if (!helloId || loading || loadError) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: groundColor }]}>
        {loading ? (
          <ActivityIndicator color={Colors.Chalk} accessibilityLabel={t('encounter.common.loading')} />
        ) : (
          <>
            <Text accessibilityRole="alert" style={styles.body}>
              {loadError ?? t('encounter.common.noHello')}
            </Text>
            {loadError ? (
              <TouchableOpacity onPress={() => void reload()} accessibilityRole="button" style={styles.declineButton}>
                <Text style={styles.declineText}>{t('encounter.common.retry')}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>
    );
  }

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
      <View style={[styles.bottomContent, { paddingBottom: footerPad }]}>
        <Text style={styles.body}>{t('encounter.nudge.body')}</Text>

        {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          disabled={busy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.nudge.accept')}
          accessibilityState={{ disabled: busy, busy }}
        >
          <Text style={[styles.acceptText, { color: groundColor }]}>
            {t('encounter.nudge.accept')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDecline}
          disabled={busy}
          activeOpacity={0.7}
          style={styles.declineButton}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.nudge.decline')}
        >
          <Text style={styles.declineText}>{t('encounter.nudge.decline')}</Text>
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
