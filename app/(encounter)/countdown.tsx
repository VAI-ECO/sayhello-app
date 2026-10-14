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

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { blendOverMidnight, formatHoursMinutes, routeForHello } from '../../src/lib/encounter';
import { EncounterStage } from '../../src/components/ScreenContainer';

export default function CountdownScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const blendedBackground = blendOverMidnight(identityColor);
  const { hello, gone, loading, error, reload } = useEncounterHello();
  const [now, setNow] = useState(() => Date.now());
  const [opening, setOpening] = useState(false);

  // The clock is the server's reveal_scheduled_at; this only re-reads the time
  // each minute so hours and minutes stay current (no seconds, 10.14).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gone && !loading) router.back();
  }, [gone, loading, router]);

  useEffect(() => {
    if (hello && (hello.status !== 'accepted' || hello.revealedAt)) router.replace(routeForHello(hello));
  }, [hello, router]);

  const revealAt = hello?.revealScheduledAt ? new Date(hello.revealScheduledAt).getTime() : NaN;
  const remaining = Number.isFinite(revealAt) ? revealAt - now : NaN;
  const due = Number.isFinite(remaining) && remaining <= 0;

  // The reveal job hands it over; ask the server rather than assume it has run.
  const open = async () => {
    if (opening) return;
    setOpening(true);
    await reload();
    setOpening(false);
  };

  return (
    <EncounterStage background={blendedBackground} style={[styles.container, { backgroundColor: blendedBackground }]}>
      {/* Status bar */}
      <StatusBarSpacer height={44} />

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
          {/* Identity, photo and place stay with Waverly until reveal (10.6, 10.41) */}
          <View style={styles.photoPlaceholder}>
            <Waverly size={72} color="rgba(255,255,255,0.5)" />
          </View>

          {hello?.helloCode ? (
            <View style={styles.photoOverlay}>
              <Text style={styles.name}>{t('encounter.countdown.helloLabel', { code: hello.helloCode })}</Text>
            </View>
          ) : null}
        </View>
        {/* Stacking (10.14) lives on the home tab (CountdownCarousel); this screen is one hello's own step, so no dots. */}
      </View>

      {/* Countdown clock */}
      <View style={styles.clockSection}>
        {!hello && loading ? (
          <ActivityIndicator color={Colors.Chalk} />
        ) : error ? (
          <TouchableOpacity onPress={() => void reload()} accessibilityRole="button">
            <Text accessibilityRole="alert" style={styles.clockLabel}>{error} {t('encounter.common.retry')}</Text>
          </TouchableOpacity>
        ) : due ? (
          <>
            <Text style={styles.clockLabel}>{t('encounter.countdown.ready')}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => void open()}
              disabled={opening}
              accessibilityRole="button"
              accessibilityLabel={t('encounter.countdown.open')}
            >
              <Text style={styles.openText}>{t('encounter.countdown.open')}</Text>
            </TouchableOpacity>
          </>
        ) : Number.isFinite(remaining) ? (
          <>
            <Text style={styles.clock} testID="countdown-clock">{formatHoursMinutes(remaining)}</Text>
            <Text style={styles.clockLabel}>{t('encounter.countdown.until')}</Text>
          </>
        ) : null}
      </View>
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  openButton: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: Colors.Chalk,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Ink,
  },
});
