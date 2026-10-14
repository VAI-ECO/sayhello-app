/**
 * SIGN IN SCREEN 3: LOCKED OUT (Rate Limit)
 *
 * Shown after 5 wrong codes. 15 minute lockout.
 * ⚠️ Clock time display, never a countdown
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function SignInLockedScreen() {
  const router = useRouter();
  const { phone, unlockTime } = useLocalSearchParams<{ phone: string; unlockTime: string }>();
  const [isLocked, setIsLocked] = useState(true);
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const unlockTimestamp = parseInt(unlockTime, 10);

    // Format unlock time as clock time (e.g., "9:56")
    const unlockDate = new Date(unlockTimestamp);
    const hours = unlockDate.getHours();
    const minutes = unlockDate.getMinutes();
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    setDisplayTime(formattedTime);

    // Check if lockout has expired
    const checkLockout = () => {
      const now = Date.now();
      if (now >= unlockTimestamp) {
        setIsLocked(false);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  const handleTryAgain = () => {
    if (!isLocked) {
      router.replace({
        pathname: '/(auth)/sign-in-code',
        params: { phone },
      });
    }
  };

  // No support contact is ruled in canon, so none is invented: say so instead of a dead button.
  const [helpNote, setHelpNote] = useState(false);
  const handleGetHelp = () => setHelpNote(true);

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('signIn.locked.title')}</Text>
          <Text style={styles.subtitle}>{t('signIn.locked.subtitle')}</Text>

          <Text style={styles.tryAgain} testID="unlock-time">
            {t('signIn.locked.tryAgain', { time: displayTime })}
          </Text>

          <Text style={styles.reassurance} testID="reassurance">
            {t('signIn.locked.reassurance')}
          </Text>

          <View style={styles.links}>
            <Pressable
              style={styles.link}
              role="button"
              accessibilityLabel="Why this happens"
              testID="why-link"
            >
              <Text style={styles.linkText}>{t('signIn.locked.whyLink')}</Text>
            </Pressable>

            <Pressable
              onPress={handleGetHelp}
              style={styles.link}
              role="button"
              accessibilityLabel="Get help instead"
              testID="help-link"
            >
              <Text style={styles.linkText}>{t('signIn.locked.helpLink')}</Text>
            </Pressable>
          </View>

          {helpNote ? (
            <Text style={styles.disclaimer} accessibilityRole="alert" testID="help-note">
              {t('signIn.locked.helpUnavailable', { time: displayTime })}
            </Text>
          ) : null}
          <Text style={styles.disclaimer}>{t('signIn.locked.disclaimer')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Try again"
          onPress={handleTryAgain}
          disabled={isLocked}
          testID="try-again-button"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    marginBottom: 16,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  tryAgain: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.Ink,
    marginBottom: 24,
    letterSpacing: -0.4,
  },
  reassurance: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  links: {
    gap: 12,
    marginBottom: 24,
  },
  link: {
    padding: 8,
  },
  linkText: {
    fontSize: 16,
    color: Colors.Ink,
    textDecorationLine: 'underline',
    letterSpacing: -0.3,
  },
  disclaimer: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.7,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
