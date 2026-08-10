/**
 * ONBOARDING SCREEN 7: LOCATION PERMISSION PRIMER
 *
 * ⚠️ "While Using" only, NEVER background
 * ⚠️ Denied permission ≠ blocked. Limited mode plus ONE dismissible banner.
 */

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function LocationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLoading(false);

    // Continue regardless of permission status
    router.push('/(onboarding)/notifications');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/notifications');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>{t('onboarding.location.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.location.subtitle')}</Text>
          <Text style={styles.note}>{t('onboarding.location.note')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.location.allow')}
          onPress={handleAllow}
          loading={loading}
        />
        <Button
          title={t('onboarding.location.skip')}
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
    marginBottom: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  note: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.6,
    letterSpacing: -0.2,
  },
  footer: {
    gap: 12,
  },
});
