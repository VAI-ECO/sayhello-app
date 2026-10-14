/**
 * KEYBOARD AWARE
 *
 * One shared keyboard-avoidance wrapper so a form screen never hides its focused field behind the software
 * keyboard. ScreenContainer, SubScreen and RoleShell use it; screens that draw their own frame can use it directly.
 *
 * iOS: 'padding'. Android: no behavior (the manifest's windowSoftInputMode resizes the window; Expo's default
 * android.softwareKeyboardLayoutMode is 'resize'). This is the same convention the hangout edit, create-post and
 * encounter chat screens already use. Android behaviour on a physical device is not verified from source.
 */
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, type StyleProp, type ViewStyle } from 'react-native';

export function keyboardBehavior(os: string = Platform.OS): 'padding' | undefined {
  return os === 'ios' ? 'padding' : undefined;
}

interface KeyboardAwareProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Distance between the top of the screen and this view (e.g. a fixed header outside the wrapper). */
  verticalOffset?: number;
  enabled?: boolean;
  testID?: string;
}

export function KeyboardAware({ children, style, verticalOffset, enabled = true, testID }: KeyboardAwareProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={keyboardBehavior()}
      keyboardVerticalOffset={verticalOffset}
      enabled={enabled}
      testID={testID}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
