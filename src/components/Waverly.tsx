/**
 * WAVERLY - THE HELLO HAND
 *
 * ⚠️ Waverly is THE SHAPE, not a color
 * Renders in the user's identity color
 *
 * Uses the original transparent mark preserved from Claude Design.
 * Gesture animation remains a separate implementation task.
 */

import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native';
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
      <Image
        source={require('../../assets/waverly-mark-white.png')}
        style={[styles.hand, { tintColor: displayColor }]}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="Waverly, the Hello hand"
      />
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
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
});
