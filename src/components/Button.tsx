/**
 * BUTTON COMPONENT
 *
 * Primary action button that themes to identity color
 */

import { TouchableOpacity, Text, StyleSheet, type ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function Button({ title, onPress, disabled, loading, variant = 'primary', style }: ButtonProps) {
  const { identityColor, contrast } = useTheme();

  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? { backgroundColor: identityColor } : styles.secondaryButton,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? contrast.foreground : identityColor}
          testID="loading-indicator"
        />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? { color: contrast.foreground } : { color: identityColor },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  disabled: {
    opacity: 0.4,
  },
});
