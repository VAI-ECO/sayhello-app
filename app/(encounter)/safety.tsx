/**
 * SAFETY GUIDANCE IN THE MEET FLOW (CANON-SH-01-SN-23 / SN-21 P; RULES §24.18, §36.6)
 * Meet in public · tell someone · leave if uncomfortable. Guidance, not a warning: it never suggests the
 * other person is a risk. Shown once before the first meet on this device (accepted → here → arrow) and
 * any time from Settings (?from=settings, which just goes back). "Got it" is the only way on and costs
 * nothing.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { markSafetyGuidanceSeen } from '../../src/state/safety-guidance';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function SafetyGuidanceScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const gotIt = async () => {
    await markSafetyGuidanceSeen();
    if (from === 'settings') {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/profile');
    } else {
      router.replace('/(encounter)/arrow');
    }
  };
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.title} accessibilityRole="header">{t('s2c.safety.title')}</Text>
          <Text style={styles.sub}>{t('s2c.safety.sub')}</Text>
          {(['one', 'two', 'three'] as const).map((k, n) => (
            <View key={k} style={styles.item}>
              <Text style={styles.num}>{n + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{t(`s2c.safety.${k}Title`)}</Text>
                <Text style={styles.itemBody}>{t(`s2c.safety.${k}Body`)}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.itemTitle}>{t('s2c.safety.offTitle')}</Text>
          <Text style={styles.itemBody}>{t('s2c.safety.offBody')}</Text>
          <Text style={styles.note}>{t('s2c.safety.note')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={t('s2c.safety.gotIt')} onPress={() => void gotIt()} testID="safety-got-it" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 28, paddingBottom: 120 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 },
  title: { fontSize: 30, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7 },
  sub: { fontSize: 17, color: Colors.Muted, marginBottom: 10 },
  item: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.Ink, color: Colors.Chalk, textAlign: 'center', lineHeight: 30, fontWeight: '800', overflow: 'hidden' },
  itemTitle: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  itemBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted, marginTop: 2 },
  note: { fontSize: 13, color: Colors.Muted, marginTop: 8 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, maxWidth: 560, alignSelf: 'center', width: '100%' },
});
