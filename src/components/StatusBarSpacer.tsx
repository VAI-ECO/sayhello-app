/**
 * STATUS BAR SPACER
 *
 * Many screens reserve the top of the screen with a fixed 44/46pt spacer (the designs draw a phone status bar there).
 * On a real device the system's top inset can be larger (notch / Dynamic Island), which puts the header under the
 * clock. This spacer keeps the designed height as a FLOOR and grows to the real safe-area inset when that is taller,
 * so a design that fits today renders unchanged and a notched device is no longer overlapped.
 *
 * Uses the SafeAreaProvider above it (expo-router supplies one at the root); with none it keeps the design height.
 */
import { createContext, useContext, type Context } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

type Insets = { top: number; bottom: number } | null;
// The real library always exports the context. A test that mocks the module with a partial factory may not (three profile
// route suites do), so fall back to an empty context there: the designed height is kept (lane01 integration).
const InsetsContext: Context<Insets> =
  ((SafeArea as unknown as { SafeAreaInsetsContext?: Context<Insets> }).SafeAreaInsetsContext) ?? createContext<Insets>(null);

/** The spacer height for a given top inset: never shorter than the drawn design height. */
export function topSpacerHeight(topInset: number, designHeight: number): number {
  return Math.max(topInset, designHeight);
}

interface StatusBarSpacerProps {
  /** The height the design draws for the status bar area (44 or 46 in the current screens). */
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The spacer height for this device (design height as a floor, the real top inset when taller). Use it to position
 * anything absolutely placed against the same header area, e.g. a floating back button at `top: height + 4`.
 */
export function useTopSpacerHeight(designHeight = 44): number {
  const insets = useContext(InsetsContext);
  return topSpacerHeight(insets?.top ?? 0, designHeight);
}

/** The bottom padding for a given bottom inset: never smaller than the padding the design already draws. */
export function bottomPad(bottomInset: number, designPadding: number): number {
  return Math.max(bottomInset, designPadding);
}

/**
 * Bottom padding for a footer / pinned action on a screen that has no SafeAreaView bottom edge. The design's own bottom
 * padding stays as a FLOOR and grows to the real bottom inset when that is larger (iPhone home indicator 34pt; Android
 * 3-button / gesture navigation, which the app draws under: android/gradle.properties edgeToEdgeEnabled=true), so a
 * primary action is never under the system bar. With no SafeAreaProvider it returns the design padding.
 */
export function useBottomPad(designPadding: number): number {
  const insets = useContext(InsetsContext);
  return bottomPad(insets?.bottom ?? 0, designPadding);
}

export function StatusBarSpacer({ height = 44, style, testID }: StatusBarSpacerProps) {
  const spacerHeight = useTopSpacerHeight(height);
  return <View style={[{ height: spacerHeight }, style]} testID={testID} />;
}
