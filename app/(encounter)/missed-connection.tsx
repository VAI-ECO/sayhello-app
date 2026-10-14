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

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { getHelloReveal, type HelloReveal } from '../../src/api/hellos';
import { blendOverMidnight } from '../../src/lib/encounter';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { EncounterStage } from '../../src/components/ScreenContainer';
import { takeLostPhrase } from '../../src/state/lost-phrase';

const FIRST_SHOWN = 2;

export default function MissedConnectionScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const blendedBackground = blendOverMidnight(identityColor);
  const { helloId } = useEncounterHello();
  // Waverly's lost line, when Bluetooth lost the other phone (10.23, 12.3: blames the signal, never the person).
  const [lostLine] = useState(() => takeLostPhrase(helloId));
  const [reveal, setReveal] = useState<HelloReveal | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notYet' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const routerRef = useRef(router);
  routerRef.current = router;

  // Icebreakers exchange at countdown zero even without a meeting (10.24): the
  // server serves them once the reveal job has run. Name and answers only (10.25).
  const load = useCallback(async () => {
    if (!helloId) { setState('error'); setError(t('encounter.common.noHello')); return; }
    setState('loading');
    setError(null);
    const res = await getHelloReveal(helloId);
    if (res.error) {
      if (res.error.status === 409) { setState('notYet'); return; }
      if (res.error.status === 404 || res.error.status === 403) { routerRef.current.back(); return; }
      setState('error');
      setError(res.error.message || t('encounter.common.failed'));
      return;
    }
    setReveal(res.data?.reveal ?? null);
    setState('ready');
  }, [helloId]);

  useEffect(() => { void load(); }, [load]);

  const otherPersonName = reveal?.person.displayName ?? '';
  const icebreakers = reveal?.icebreakers ?? [];
  const remaining = icebreakers.length - FIRST_SHOWN;

  return (
    <EncounterStage background={blendedBackground} style={styles.container}>
      {/* Status bar with blended background */}
      <StatusBarSpacer height={44} style={{ backgroundColor: blendedBackground }} />

      {/* Header section */}
      <View style={[styles.headerSection, { backgroundColor: blendedBackground }]}>
        <View style={styles.waverlyRow}>
          <View style={styles.waverlyBadge}>
            <Waverly size={17} color={Colors.Chalk} />
          </View>
          <Text style={styles.headerText}>
            {lostLine ?? (reveal ? t('encounter.missedConnection.header') : t('encounter.reveal.notYet'))}
          </Text>
        </View>

        {reveal ? (
          <View style={styles.profileRow}>
            {/* No photo for a missed connection (10.25): the avatar is their colour only */}
            <View style={[styles.avatar, { backgroundColor: reveal.person.identityColor ?? Colors.Fern }]}>
              <View style={styles.avatarFace} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{otherPersonName}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Scrollable content - NO PHOTO per RULES 10.25 */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} style={{ marginTop: 24 }} /> : null}
        {state === 'notYet' || state === 'error' ? (
          <TouchableOpacity onPress={() => void load()} accessibilityRole="button" style={styles.icebreakerSection}>
            <Text accessibilityRole="alert" style={styles.question}>
              {state === 'error' ? `${error ?? ''} ${t('encounter.common.retry')}` : t('encounter.common.retry')}
            </Text>
          </TouchableOpacity>
        ) : null}
        {/* Icebreakers */}
        {reveal ? (
          <View style={styles.icebreakerSection}>
            {icebreakers.length === 0 ? (
              <Text style={styles.question}>{t('encounter.reveal.noAnswers', { name: otherPersonName })}</Text>
            ) : null}
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
        ) : null}
      </ScrollView>

      {/* Footer — no points line: whether accept points stand depends on the
          server's award (none on a repeat pair, 10.45), which is not reported here. */}
      <View style={styles.footer}>
        {remaining > 0 ? (
          <Text style={styles.footerText}>{t('encounter.missedConnection.moreBelow', { count: remaining })}</Text>
        ) : null}
      </View>
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
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
