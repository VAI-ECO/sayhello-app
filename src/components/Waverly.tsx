/**
 * WAVERLY - THE HELLO HAND
 *
 * ⚠️ Waverly is THE SHAPE, not a color
 * Renders in the user's identity color
 *
 * This is a placeholder component. In production, this should render
 * the actual Waverly hand SVG with proper animations.
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface WaverlyProps {
  size?: number;
  color?: string; // Optional override for identity color
  wave?: boolean; // Whether to show waving animation
  style?: ViewStyle;
}

export function Waverly({ size = 120, color, wave = false, style }: WaverlyProps) {
  const { identityColor } = useTheme();
  const displayColor = color || identityColor;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Placeholder: In production, render actual Waverly SVG here */}
      <View style={[styles.hand, { backgroundColor: displayColor }]}>
        <Text style={styles.emoji}>👋</Text>
      </View>
      {wave && <Text style={styles.label}>Waving...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hand: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
});
