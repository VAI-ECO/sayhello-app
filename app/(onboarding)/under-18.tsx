/**
 * ONBOARDING HARD STOP: UNDER 18
 *
 * 18+ requirement. One correction allowed.
 * First attempt: Shows "Go back" button
 * Second attempt: Hard stop with no way back into signup
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

const UNDER_18_ATTEMPT_KEY = '@sayhello:under18_attempt';

export default function Under18Screen() {
  const router = useRouter();
  const [isSecondAttempt, setIsSecondAttempt] = useState(false);

  useEffect(() => {
    async function checkAttempt() {
      const hasAttemptedBefore = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      // If the flag exists, this is NOT the first time - it's the second attempt
      // First time: flag doesn't exist yet (it gets set when they continue)
      // Second time: flag exists
      setIsSecondAttempt(hasAttemptedBefore === 'true');
    }
    checkAttempt();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleCloseApp = () => {
    if (Platform.OS === 'web') {
      window.close();
    } else {
      // On native, this is handled by the user closing the app manually
      // We show the instruction but can't force close
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              {/* Waverly mark at 40% opacity would go here */}
              <Text style={styles.iconPlaceholder}>👋</Text>
            </View>
          </View>

          <Text style={styles.title}>{t('onboarding.under18.title')}</Text>

          <Text style={styles.body}>{t('onboarding.under18.body1')}</Text>

          <Text style={styles.body}>{t('onboarding.under18.body2')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {!isSecondAttempt && (
          <Button
            title={t('onboarding.under18.goBack')}
            onPress={handleGoBack}
            variant="secondary"
          />
        )}
        <Text style={styles.closeText} onPress={handleCloseApp}>
          {t('onboarding.under18.closeApp')}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 60,
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.Canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    fontSize: 32,
    opacity: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 8,
    letterSpacing: -0.56,
    lineHeight: 33.6,
  },
  body: {
    fontSize: 16,
    color: Colors.Muted,
    lineHeight: 25.6,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 12,
  },
  closeText: {
    fontSize: 14,
    color: Colors.Muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
