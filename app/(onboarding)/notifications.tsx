/**
 * ONBOARDING SCREEN 8: NOTIFICATION PERMISSION PRIMER
 *
 * ⚠️ Denied permission ≠ blocked. Limited mode plus ONE dismissible banner.
 */

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    const { status } = await Notifications.requestPermissionsAsync();
    setLoading(false);

    // Continue regardless of permission status
    router.push('/(onboarding)/welcome');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/welcome');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.title}>{t('onboarding.notifications.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.notifications.allow')}
          onPress={handleAllow}
          loading={loading}
        />
        <Button
          title={t('onboarding.notifications.skip')}
          onPress={handleSkip}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 16,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Ink,
    lineHeight: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    gap: 12,
  },
});
