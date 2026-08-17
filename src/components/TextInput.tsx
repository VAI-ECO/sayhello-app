/**
 * TEXT INPUT COMPONENT
 *
 * Styled text input with theme support
 */

import { TextInput as RNTextInput, StyleSheet, View, type TextInputProps as RNTextInputProps } from 'react-native';
import { Colors } from '../theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  error?: boolean;
}

export function TextInput({ error, testID, ...props }: TextInputProps) {
  return (
    <View style={[styles.container, error && styles.errorContainer]}>
      <RNTextInput
        style={styles.input}
        placeholderTextColor={Colors.Ink}
        autoCapitalize="none"
        autoCorrect={false}
        testID={testID}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.Ink,
    backgroundColor: Colors.Chalk,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  errorContainer: {
    borderColor: Colors.SignalRed,
  },
  input: {
    fontSize: 17,
    color: Colors.Ink,
    letterSpacing: -0.4,
  },
});
