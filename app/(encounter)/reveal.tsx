/**
 * ENCOUNTER SCREEN 1h: THE REVEAL
 *
 * Profiles open ONLY if both say yes (RULES 10.6).
 * A late accept reads "[Name] accepted your hello" — no timestamp,
 * no elapsed time, indistinguishable from immediate (RULES 10.22).
 *
 * RULING 3: Gate on sharing (reveal), NOT on signup.
 * If user has < 3 Icebreaker answers, show gate with option to answer.
 *
 * Minimal decoration. This is the screen somebody screenshots.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { api } from '../../src/api/client';
import {
  continueHello,
  getHelloReveal,
  type EncounterHello,
  type HelloReveal,
} from '../../src/api/hellos';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { blendOverMidnight } from '../../src/lib/encounter';
import { recordAward } from '../../src/state/active-hello';
import { EncounterStage } from '../../src/components/ScreenContainer';

/** Shown before the rest scroll into view; the remainder is counted, not invented. */
const FIRST_SHOWN = 2;

export default function RevealScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const blendedBackground = blendOverMidnight(identityColor);
  const { helloId } = useEncounterHello();
  const [reveal, setReveal] = useState<HelloReveal | null>(null);
  const [hello, setHello] = useState<EncounterHello | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notYet' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const acting = useRef(false);
  const routerRef = useRef(router);
  routerRef.current = router;

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
    setHello(res.data?.hello ?? null);
    setState('ready');
  }, [helloId]);

  useEffect(() => { void load(); }, [load]);

  // Second wave (10.16, 10.17): this viewer's own choice only; never the other's.
  const choose = async (wantsToContinue: boolean) => {
    if (!helloId || acting.current) return;
    acting.current = true;
    setChoosing(true);
    setError(null);
    const res = await continueHello(helloId, wantsToContinue);
    acting.current = false;
    setChoosing(false);
    if (res.error || !res.data) {
      setError(res.error?.message || t('encounter.common.failed'));
      return;
    }
    recordAward(helloId, 'continue', res.data.pointsAwarded);
    setHello(res.data.hello);
  };

  // RULING 3: Check if user has < 3 Icebreaker answers (gate on sharing)
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await api.icebreakers.getMyAnswers();
      const answers = Array.isArray((result.data as { answers?: unknown[] } | undefined)?.answers)
        ? (result.data as { answers: unknown[] }).answers
        : Array.isArray(result.data)
          ? result.data
          : [];
      if (answers.length < 3) {
        setShowGate(true);
      }
    })();
  }, []);

  const handleAnswerIcebreakers = () => {
    setShowGate(false);
    router.push('/profile/icebreakers');
  };

  const handleSkipGate = () => {
    setShowGate(false);
  };

  const name = reveal?.person.displayName ?? '';
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
            {reveal ? t('encounter.reveal.header', { name }) : t('encounter.reveal.notYet')}
          </Text>
        </View>

        {reveal ? (
          <View style={styles.profileRow}>
            {reveal.person.profilePhotoUrl ? (
              <Image source={{ uri: reveal.person.profilePhotoUrl }} style={styles.avatar} accessibilityLabel={name} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: reveal.person.identityColor ?? Colors.Amber }]}>
                <View style={styles.avatarFace} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{name}</Text>
              {reveal.locationName ? <Text style={styles.location}>{reveal.locationName}</Text> : null}
            </View>
          </View>
        ) : null}
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} style={{ marginTop: 24 }} /> : null}
        {state === 'notYet' || state === 'error' ? (
          <TouchableOpacity onPress={() => void load()} accessibilityRole="button" style={styles.icebreakerSection}>
            <Text accessibilityRole="alert" style={styles.question}>
              {state === 'error' ? `${error ?? ''} ${t('encounter.common.retry')}` : t('encounter.common.retry')}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Selfie — the joint photo, signed URL from the server (10.43) */}
        {reveal?.selfieUrl ? (
          <View style={styles.selfieContainer}>
            <Image
              source={{ uri: reveal.selfieUrl }}
              style={StyleSheet.absoluteFill}
              accessibilityLabel={t('encounter.reveal.selfieLabel')}
              testID="reveal-selfie"
            />
          </View>
        ) : null}

        {/* Icebreakers — every answer they wrote (13.39) */}
        {reveal ? (
          <View style={styles.icebreakerSection}>
            {icebreakers.length === 0 ? (
              <Text style={styles.question}>{t('encounter.reveal.noAnswers', { name })}</Text>
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

        {/* Second wave — own choice, positive joint outcome only (10.16, 10.20) */}
        {reveal && hello?.status === 'accepted' ? (
          <View style={styles.icebreakerSection} testID="second-wave">
            <View style={styles.divider} />
            {hello.bothContinued ? (
              // §10.16 — both continued → private chat.
              <>
                <Text style={styles.answer}>{t('encounter.reveal.chatReady', { name: reveal.person.displayName })}</Text>
                <View style={styles.gateActions}>
                  <TouchableOpacity
                    style={styles.gateButtonPrimary}
                    onPress={() => router.push({ pathname: '/(encounter)/chat', params: { helloId: reveal.id } })}
                    accessibilityRole="button"
                    testID="open-chat"
                  >
                    <Text style={styles.gateButtonPrimaryText}>{t('encounter.reveal.openChat')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : hello.myContinue ? (
              <Text style={styles.answer}>{t('encounter.reveal.chosenYes')}</Text>
            ) : (
              <>
                <Text style={styles.answer}>{t('encounter.reveal.secondWave')}</Text>
                <View style={styles.gateActions}>
                  <TouchableOpacity
                    style={styles.gateButtonPrimary}
                    onPress={() => void choose(true)}
                    disabled={choosing}
                    accessibilityRole="button"
                  >
                    <Text style={styles.gateButtonPrimaryText}>{t('encounter.reveal.continueYes')}</Text>
                  </TouchableOpacity>
                  {hello.myContinue === null ? (
                    <TouchableOpacity
                      style={styles.gateButtonSecondary}
                      onPress={() => void choose(false)}
                      disabled={choosing}
                      accessibilityRole="button"
                    >
                      <Text style={styles.gateButtonSecondaryText}>{t('encounter.reveal.continueClear')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </>
            )}
            {error && state === 'ready' ? <Text accessibilityRole="alert" style={styles.question}>{error}</Text> : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Footer */}
      {remaining > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('encounter.reveal.moreBelow', { count: remaining })}</Text>
        </View>
      ) : null}

      {/* Icebreaker Gate Modal (RULING 3) */}
      <Modal
        visible={showGate}
        transparent
        animationType="fade"
        onRequestClose={handleSkipGate}
      >
        <View style={styles.gateOverlay}>
          <View style={styles.gateCard}>
            <Text style={styles.gateTitle}>{t('revealGate.title')}</Text>
            <Text style={styles.gateBody}>{t('revealGate.body')}</Text>
            <View style={styles.gateActions}>
              <TouchableOpacity
                style={styles.gateButtonPrimary}
                onPress={handleAnswerIcebreakers}
                accessibilityRole="button"
                testID="reveal-gate-answer-button"
              >
                <Text style={styles.gateButtonPrimaryText}>
                  {t('revealGate.answerButton')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gateButtonSecondary}
                onPress={handleSkipGate}
                accessibilityRole="button"
                testID="reveal-gate-skip-button"
              >
                <Text style={styles.gateButtonSecondaryText}>
                  {t('revealGate.skipButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    gap: 11,
  },
  waverlyBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 17,
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
  selfieContainer: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.Canvas,
  },
  selfiePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfiePlaceholderText: {
    fontSize: 15,
    color: Colors.Muted,
  },
  icebreakerSection: {
    paddingHorizontal: 26,
    paddingTop: 20,
  },
  icebreakerItem: {
    paddingVertical: 17,
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
    paddingTop: 16,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: Colors.Faint,
    textAlign: 'center',
  },
  // Gate modal styles
  gateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
  },
  gateCard: {
    backgroundColor: Colors.Chalk,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    maxWidth: 400,
    width: '100%',
  },
  gateTitle: {
    fontFamily: 'Assistant',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.02,
    textAlign: 'center',
  },
  gateBody: {
    fontFamily: 'Assistant',
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: Colors.Muted,
    textAlign: 'center',
  },
  gateActions: {
    gap: 12,
    marginTop: 8,
  },
  gateButtonPrimary: {
    backgroundColor: Colors.Ink,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gateButtonPrimaryText: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Chalk,
  },
  gateButtonSecondary: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gateButtonSecondaryText: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Muted,
  },
});
