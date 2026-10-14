/**
 * THE NUDGE CARD — "It's time to Say Hello" with a single "Yes" (Feed and Prizes All Sizes, the
 * frame captioned "The only thing that takes the top of this feed. The rest dims rather than
 * disappearing, so a nudge destroys nothing. No Holla, Discount or Hootza ever earns this treatment.").
 *
 * It opens the encounter's own nudge screen (frame 1a) for THIS hello, where the answer is given;
 * nothing is accepted here, nothing is said about a decline (§10.20–10.21), and there is no
 * distance (§8.12). The card takes the person's own identity colour, as drawn.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme';

export function HelloNudgeCard({ color, onYes }: { color: string; onYes: () => void }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]} testID="hello-nudge-card">
      <Text style={styles.title} accessibilityRole="header">
        {t('whatsHappening.helloTakeover.title')}{' '}
        <Text style={styles.dreaming}>Say Hello</Text>
      </Text>
      <TouchableOpacity
        style={styles.yes}
        onPress={onYes}
        accessibilityRole="button"
        accessibilityLabel={t('whatsHappening.helloNudge.yes')}
        testID="hello-nudge-yes"
      >
        <Text style={[styles.yesText, { color }]}>{t('whatsHappening.helloNudge.yes')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 18, gap: 14, marginHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 25, lineHeight: 30, fontWeight: '700', color: Colors.Chalk, letterSpacing: -0.5 },
  dreaming: { fontFamily: 'Dreaming', fontSize: 34, lineHeight: 26, fontWeight: '400', color: Colors.Chalk },
  yes: { backgroundColor: Colors.Chalk, borderRadius: 24, height: 48, alignItems: 'center', justifyContent: 'center' },
  yesText: { fontSize: 16, fontWeight: '700' },
});
