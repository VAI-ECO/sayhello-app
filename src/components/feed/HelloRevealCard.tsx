/**
 * A revealed Hello that this person has not opened yet. Sits at the top of Home like the nudge card
 * (RULES §10.13-10.15). Several reveals landing together are ONE card, never one per Hello (§10.15).
 * Says nothing about who (§21.1) - the name arrives on the reveal screen itself.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme';

export function HelloRevealCard({ color, count, onOpen }: { color: string; count: number; onOpen: () => void }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]} testID="hello-reveal-card">
      <Text style={styles.title} accessibilityRole="header">
        {count > 1 ? t('encounter.revealReady.titleMany', { count }) : t('encounter.revealReady.title')}
      </Text>
      <TouchableOpacity
        style={styles.open}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={t('encounter.countdown.open')}
        testID="hello-reveal-open"
      >
        <Text style={[styles.openText, { color }]}>{t('encounter.countdown.open')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 18, gap: 14, marginHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 25, lineHeight: 30, fontWeight: '700', color: Colors.Chalk, letterSpacing: -0.5 },
  open: { backgroundColor: Colors.Chalk, borderRadius: 24, height: 48, alignItems: 'center', justifyContent: 'center' },
  openText: { fontSize: 16, fontWeight: '700' },
});
