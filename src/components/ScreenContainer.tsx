/**
 * SCREEN CONTAINER
 *
 * Standard container for onboarding screens
 */

import { View, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { KeyboardAware } from './KeyboardAware';

/** Style for a scroll content container / column so it centres at the T/D frame widths. Empty on phone. */
export function useColumnStyle(): ViewStyle {
  const { width } = useWindowDimensions();
  const maxWidth = columnMaxWidth(width);
  return maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : {};
}

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Opt out of the tablet/desktop centred column (screens that draw their own wide layout). */
  fullWidth?: boolean;
  /** Keep focused fields above the software keyboard (default on). Turn off only for a screen that does it itself. */
  keyboardAvoiding?: boolean;
}

/** Design frames: phone full width; tablet column 700 wide; desktop column 900 wide (same as RoleShell). */
export function columnMaxWidth(width: number): number | undefined {
  if (width >= 1024) return 900;
  if (width >= 700) return 700;
  return undefined;
}

export function ScreenContainer({ children, style, fullWidth, keyboardAvoiding = true }: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const maxWidth = fullWidth ? undefined : columnMaxWidth(width);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAware enabled={keyboardAvoiding}>
        <View style={[styles.container, maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : null, style]}>{children}</View>
      </KeyboardAware>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  container: {
    flex: 1,
    padding: 24,
  },
});

/**
 * ENCOUNTER STAGE
 * Full-bleed ground colour on every width; on tablet/desktop the screen content sits in a centred
 * column (700 / 900, same widths as ScreenContainer). Phone: renders exactly as the bare View did.
 */
export function EncounterStage({ background, style, children }: { background?: string; style?: ViewStyle | ViewStyle[]; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const maxWidth = columnMaxWidth(width);
  if (!maxWidth) return <View style={[{ flex: 1 }, style]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: background ?? Colors.Chalk }}>
      <View style={[{ flex: 1 }, style, { maxWidth, width: '100%', alignSelf: 'center' }]}>{children}</View>
    </View>
  );
}
