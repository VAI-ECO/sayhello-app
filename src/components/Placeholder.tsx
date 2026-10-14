/**
 * PLACEHOLDER SCREEN
 *
 * Used for screens that will be built in later runs
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { t } from '../i18n';

interface PlaceholderProps {
  screen: string;
}

export function Placeholder({ screen }: PlaceholderProps) {
  const { contrast } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: contrast.background }]}>
      <Text style={[styles.title, { color: contrast.foreground }]}>
        {t('placeholder.title', { screen })}
      </Text>
      <Text style={[styles.subtitle, { color: contrast.foreground }]}>
        {t('placeholder.subtitle')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
