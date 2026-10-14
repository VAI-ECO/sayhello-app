/**
 * ONBOARDING — ICEBREAKERS FRAMING (CANON-RL-01-SN-21; RULES §13.9-13.13)
 *
 * The framing matters more than the questions: the word "survey" appears nowhere. Whole-set skip is
 * right here at full legibility. The questions are the server's own signup subset
 * (GET /icebreakers/questions, is_shown_at_signup); how many there are is read, not stated.
 * The count uses the same signupQuestions() predicate as the one-per-screen flow, so the number
 * announced here is exactly the number asked (wide-range sliders stay in Settings).
 * No signup subset (or a failed read) never blocks: the person goes straight on to "You're in".
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { api } from '../../src/api/client';
import { signupQuestions } from '../../src/lib/icebreakers-signup';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function IcebreakersFraming() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    void api.icebreakers.getQuestions().then(res => {
      if (!live) return;
      const list = (res.data as { questions?: Array<{ isShownAtSignup?: boolean; questionType: string; sliderMin?: number | null; sliderMax?: number | null }> } | undefined)?.questions;
      if (res.error) { setFailed(true); return; }
      // Absent subset → nothing to ask → straight on. A malformed (non-array) payload is a server
      // contract violation, not "no questions": show the honest failure instead of skipping silently.
      if (list !== undefined && list !== null && !Array.isArray(list)) { setFailed(true); return; }
      const n = signupQuestions(list).length;
      if (n === 0) router.replace('/(onboarding)/done');
      else setCount(n);
    });
    return () => { live = false; };
  }, [router]);

  return (
    <ScreenContainer>
      <View style={styles.content}>
        {failed ? (
          <>
            <Text style={styles.body}>{t('s2c.onboardingIce.loadFailed')}</Text>
            <Button title={t('s2c.onboardingIce.later')} onPress={() => router.replace('/(onboarding)/done')} testID="ice-later" />
          </>
        ) : count === null ? (
          <ActivityIndicator size="large" color={Colors.Ink} testID="ice-loading" />
        ) : (
          <>
            <Text style={styles.title} accessibilityRole="header">{t('s2c.onboardingIce.framingTitle', { count })}</Text>
            <Text style={styles.body}>{t('s2c.onboardingIce.framingBody')}</Text>
            <Text style={styles.note}>{t('s2c.onboardingIce.framingNote')}</Text>
          </>
        )}
      </View>
      {count !== null && !failed ? (
        <View style={styles.footer}>
          <Button title={t('s2c.onboardingIce.start')} onPress={() => router.push('/(onboarding)/icebreaker-question?i=0' as never)} testID="ice-start" />
          <Button title={t('s2c.onboardingIce.skipAll', { count })} variant="secondary" onPress={() => router.replace('/(onboarding)/done')} testID="ice-skip-all" />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7 },
  body: { fontSize: 17, lineHeight: 25, color: Colors.Ink, opacity: 0.8 },
  note: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  footer: { gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
