/**
 * A6 AMBASSADOR SIGNUP — partial: POST /ambassador/payouts/w9 stub
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { submitW9 } from '../../src/api/ambassador';

export default function AmbassadorSignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markW9() {
    setLoading(true);
    setError(null);
    const res = await submitW9();
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.replace('/(ambassador)/earned-building');
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassador.signup.title')}</Text>
        <Text style={styles.body}>{t('ambassador.signup.body')}</Text>

        <View style={styles.checklist}>
          <Check done label={t('ambassador.signup.stepAccount')} sub={t('ambassador.signup.stepAccountSub')} />
          <Check done label={t('ambassador.signup.stepPhone')} sub="••••" />
          <Check label={t('ambassador.signup.stepTax')} sub={t('ambassador.signup.stepTaxSub')} />
          <Check muted label={t('ambassador.signup.stepUnlock')} sub={t('ambassador.signup.stepUnlockSub')} />
        </View>

        <Text style={styles.anyone}>{t('ambassador.signup.anyone')}</Text>
        <Text style={styles.stripeNote}>{t('ambassador.signup.stripeNotReady')}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={t('ambassador.signup.markW9')}
          onPress={markW9}
          loading={loading}
          testID="signup-w9-stub"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function Check({
  label,
  sub,
  done,
  muted,
}: {
  label: string;
  sub: string;
  done?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.checkRow}>
      <Text style={[styles.checkMark, done && styles.checkDone]}>{done ? '✓' : '○'}</Text>
      <View>
        <Text style={[styles.checkLabel, muted && styles.checkMuted]}>{label}</Text>
        <Text style={styles.checkSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  back: { marginBottom: 4 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 30, fontWeight: '900', color: Colors.Ink, lineHeight: 32 },
  body: { fontSize: 16, lineHeight: 24, color: Colors.Muted },
  checklist: { gap: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.Line },
  checkRow: { flexDirection: 'row', gap: 11, paddingVertical: 13, backgroundColor: Colors.Chalk },
  checkMark: { width: 21, textAlign: 'center', fontSize: 14, color: Colors.Line },
  checkDone: { color: Colors.Ink, fontWeight: '800' },
  checkLabel: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  checkMuted: { color: Colors.Muted, fontWeight: '700' },
  checkSub: { fontSize: 13, color: Colors.Muted },
  anyone: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  stripeNote: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  error: { fontSize: 15, color: Colors.Ink },
});
