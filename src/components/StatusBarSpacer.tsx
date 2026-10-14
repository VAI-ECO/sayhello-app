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

type TopInset = { top: number } | null;
// The real library always exports the context. A test that mocks the module with a partial factory may not (three profile
// route suites do), so fall back to an empty context there: the designed height is kept (lane01 integration).
const InsetsContext: Context<TopInset> =
  ((SafeArea as unknown as { SafeAreaInsetsContext?: Context<TopInset> }).SafeAreaInsetsContext) ?? createContext<TopInset>(null);

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

export function StatusBarSpacer({ height = 44, style, testID }: StatusBarSpacerProps) {
  // Read the context directly: useSafeAreaInsets() throws without a provider, whereas a screen rendered outside one
  // (a test, a storybook-style harness) should simply fall back to the designed height.
  const insets = useContext(InsetsContext);
  return <View style={[{ height: topSpacerHeight(insets?.top ?? 0, height) }, style]} testID={testID} />;
}
