/**
 * TEXT INPUT COMPONENT
 *
 * Styled text input with theme support
 */

import { Text, TextInput as RNTextInput, StyleSheet, View, type TextInputProps as RNTextInputProps } from 'react-native';
import { Colors } from '../theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  error?: boolean;
  prefix?: string;
}

export function TextInput({ error, prefix, testID, ...props }: TextInputProps) {
  return (
    <View style={[styles.container, error && styles.errorContainer]}>
      {prefix ? (
        <Text style={styles.prefix} testID={testID ? `${testID}-prefix` : undefined}>
          {prefix}
        </Text>
      ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    borderColor: Colors.SignalRed,
  },
  prefix: {
    fontSize: 17,
    color: Colors.Ink,
    letterSpacing: -0.4,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.Ink,
    letterSpacing: -0.4,
  },
});
