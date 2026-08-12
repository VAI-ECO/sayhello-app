/**
 * SIGN IN SCREEN 1: PHONE NUMBER
 *
 * For returning users. No account exists check — that would leak who's on Say Hello.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function SignInPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSendCode = async () => {
    if (phone.length < 10) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    const result = await api.auth.sendOTP(phone);

    setLoading(false);

    if (result.error) {
      setError(true);
      return;
    }

    // Never confirm or deny account existence — always proceed
    router.push({
      pathname: '/(auth)/sign-in-code',
      params: { phone },
    });
  };

  const handleNewUser = () => {
    router.push('/(onboarding)/value-cards');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('signIn.phone.title')}</Text>
          <Text style={styles.subtitle}>{t('signIn.phone.subtitle')}</Text>

          <TextInput
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError(false);
            }}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoFocus
            error={error}
            accessibilityLabel="Phone number"
            testID="phone-input"
          />

          {error && (
            <Text style={styles.errorText} testID="error-message">
              Enter a valid phone number
            </Text>
          )}

          <Text style={styles.disclaimer}>{t('signIn.phone.disclaimer')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('signIn.phone.button')}
          onPress={handleSendCode}
          loading={loading}
          disabled={phone.length < 10}
          testID="send-code-button"
        />

        <Pressable
          onPress={handleNewUser}
          style={styles.newUserLink}
          role="button"
          accessibilityLabel="New here? Start from the beginning"
          testID="new-user-link"
        >
          <Text style={styles.newUserText}>{t('signIn.phone.newUser')}</Text>
        </Pressable>
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
    marginBottom: 24,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.7,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 16,
  },
  newUserLink: {
    padding: 12,
    alignItems: 'center',
  },
  newUserText: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    letterSpacing: -0.3,
  },
});
