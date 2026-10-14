/**
 * The Founding badge — the golden Hello Hangout icon (RULES §1.6, §33.3).
 * Drawn, never a bitmap ("Badge is CSS, never a bitmap", Reserved Screens SN-15;
 * badge-hangout.png is banned by §7.18). The gradient is the one the P 375
 * operator frames draw (Desktop Surfaces at P 375, 8j / 8l). The word is live
 * text beside it, never baked in.
 */

import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../../i18n';

const GOLD = ['#e7aa51', '#ffe499', '#8d5a1b', '#e7aa51', '#ac7031'] as const;

export function FoundingBadge({ size = 30, withWord = false, wordColor = '#FFE499' }: { size?: number; withWord?: boolean; wordColor?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={t('hangout.directory.founding')} testID="founding-badge">
      <LinearGradient
        colors={GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.icon, { width: size, height: size, borderRadius: size * 0.2 }]}
      />
      {withWord ? <Text style={[styles.word, { color: wordColor }]}>{t('hangout.dashboard.founding')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { borderWidth: 1, borderColor: '#000000' },
  word: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
});
