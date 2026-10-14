/**
 * FRONT DOOR (CANON-SH-01-SN-14; RULES §26.4, §26.1). The no-session landing: "A map of people who said
 * Hello." Two ways in — Get started (the personal account, phone + code) and "I've been here before"
 * (sign in) — and one quiet line for a business, a club or earning, which opens Other paths. A door, not
 * a menu. No count, no claim, no social proof (SN-14 note). The map band is a drawing, not data: it
 * carries no pin that stands for a real place or person.
 */
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Waverly } from '../../src/components';
import { PIN_COLORS } from '../../src/components/consumer/pin-art';
import { setPendingRole } from '../../src/state/pending-role';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function FrontDoorScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const start = () => { setPendingRole(null); router.push('/(onboarding)/value-cards'); };
  return (
    <ScreenContainer fullWidth>
      <View style={[styles.shell, wide && styles.shellWide]}>
        <View style={[styles.mapBand, wide && styles.mapBandWide]} accessibilityLabel={t('s2c.frontDoor.mapAlt')} accessible>
          {PIN_COLORS.map((c, n) => (
            <View key={n} style={[styles.pin, { backgroundColor: c, left: `${PIN_POS[n][0]}%`, top: `${PIN_POS[n][1]}%` }]} />
          ))}
          <Waverly size={64} wave style={{ position: 'absolute', alignSelf: 'center', bottom: 16 }} />
        </View>
        <View style={[styles.copy, wide && { flex: 1 }]}>
          <Text style={styles.title} accessibilityRole="header">{t('s2c.frontDoor.headline')}</Text>
          <Text style={styles.body}>{t('s2c.frontDoor.body')}</Text>
          <Button title={t('s2c.frontDoor.getStarted')} onPress={start} testID="front-door-start" />
          <Button title={t('s2c.frontDoor.beenHere')} variant="secondary" onPress={() => router.push('/(auth)/sign-in-phone')} testID="front-door-sign-in" />
          <Text style={styles.quiet}>{t('s2c.frontDoor.otherPaths')}</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/other-paths')} accessibilityRole="button" testID="front-door-other-paths">
            <Text style={styles.link}>{t('s2c.frontDoor.otherPathsCta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const PIN_POS: Array<[number, number]> = [[14, 22], [38, 12], [62, 30], [82, 18], [24, 52], [52, 58], [76, 50], [44, 34]];

const styles = StyleSheet.create({
  shell: { flex: 1, width: '100%', maxWidth: 1040, alignSelf: 'center' },
  shellWide: { flexDirection: 'row', alignItems: 'stretch', gap: 32 },
  mapBand: { height: 280, backgroundColor: Colors.Canvas, borderRadius: 20, overflow: 'hidden', marginTop: 12 },
  mapBandWide: { flex: 1, height: undefined, minHeight: 420 },
  pin: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.Chalk },
  copy: { flex: 1, justifyContent: 'center', gap: 14, paddingVertical: 20 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.Ink, letterSpacing: -0.8 },
  body: { fontSize: 17, lineHeight: 25, color: Colors.Muted, marginBottom: 8 },
  quiet: { fontSize: 14, color: Colors.Muted, textAlign: 'center', marginTop: 8 },
  link: { fontSize: 15, fontWeight: '700', color: Colors.HelloBlue, textAlign: 'center' },
});
