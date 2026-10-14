/**
 * §19.1–19.3 — Waverly is always shown in place of a tally. At zero: Waverly
 * alone, no number, no "0". At one or more: Waverly plus the number. Applies
 * to map surfaces, search results and listings. The word "count" is never used.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Waverly } from '..';
import { Colors } from '../../theme';

export function WaverlyTally({ value, label, testID }: { value: number; label: string; testID?: string }) {
  const n = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  return (
    <View style={styles.tally} testID={testID} accessible accessibilityLabel={n > 0 ? `${n.toLocaleString()} ${label}` : label}>
      <View style={styles.row}>
        <Waverly size={22} color={Colors.Ink} />
        {n > 0 ? <Text style={styles.value}>{n.toLocaleString()}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tally: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 },
  value: { fontSize: 28, fontWeight: '700', color: Colors.Ink },
  label: { fontSize: 13, color: Colors.Muted },
});
