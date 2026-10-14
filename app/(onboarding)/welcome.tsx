/**
 * ONBOARDING SCREEN 9: WELCOME
 *
 * ⚠️ Re-openable forever
 */

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to main app (tabs)
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.header}>
          <Waverly size={120} wave />
          <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
        </View>

        <View style={styles.points}>
          <WelcomePoint icon="🏪" text={t('onboarding.welcome.point1')} />
          <WelcomePoint icon="👋" text={t('onboarding.welcome.point2')} />
          <WelcomePoint icon="🎁" text={t('onboarding.welcome.point3')} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title={t('onboarding.welcome.getStarted')} onPress={handleGetStarted} />
      </View>
    </ScreenContainer>
  );
}

function WelcomePoint({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.point}>
      <Text style={styles.pointIcon}>{icon}</Text>
      <Text style={styles.pointText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.Ink,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.Ink,
    opacity: 0.7,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  points: {
    gap: 24,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  pointIcon: {
    fontSize: 32,
  },
  pointText: {
    flex: 1,
    fontSize: 17,
    color: Colors.Ink,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
