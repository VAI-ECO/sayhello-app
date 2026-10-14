/**
 * AT THE CAP — CHECK-IN (NEW-ENC-01, provisional key; RULES §11.8-11.10, §7.10)
 * Told plainly, never a wall: "Keep going today" grants blocks equal to the daily cap and logs it
 * (POST /hellos/nudge-cap/override); "That is enough for now" just closes. No figure is printed (the cap
 * is the admin setting, MONEY Part 6), no fear framing, no countdown. Nothing is unlocked or spent.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { overrideNudgeCap } from '../../src/api/hellos';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function AtCapScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));

  const keepGoing = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const res = await overrideNudgeCap();
    setBusy(false);
    // Already past the cap's end of day or no longer at the cap is the same outcome for the person: carry on.
    if (res.error && res.error.code !== 'not_at_cap') { setError(t('s2c.cap.failed')); return; }
    leave();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.eyebrow}>{t('s2c.cap.eyebrow')}</Text>
          <Text style={styles.title} accessibilityRole="header">{t('s2c.cap.title')}</Text>
          <Text style={styles.body}>{t('s2c.cap.body')}</Text>
          {(['why', 'carry', 'others'] as const).map(k => (
            <View key={k} style={styles.card}>
              <Text style={styles.cardTitle}>{t(`s2c.cap.${k}Title`)}</Text>
              <Text style={styles.cardBody}>{t(`s2c.cap.${k}Body`)}</Text>
            </View>
          ))}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={t('s2c.cap.keepGoing')} onPress={() => void keepGoing()} loading={busy} testID="cap-keep-going" />
        <Button title={t('s2c.cap.enough')} variant="secondary" onPress={leave} testID="cap-enough" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 28, paddingBottom: 170 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 },
  eyebrow: { fontSize: 13, fontWeight: '700', color: Colors.Muted },
  title: { fontSize: 30, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7 },
  body: { fontSize: 17, lineHeight: 25, color: Colors.Muted },
  card: { backgroundColor: Colors.Bone, borderRadius: 14, padding: 16, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  cardBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 14, color: Colors.SignalRed },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, gap: 12, maxWidth: 560, alignSelf: 'center', width: '100%' },
});
