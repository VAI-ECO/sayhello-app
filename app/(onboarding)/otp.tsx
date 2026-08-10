/**
 * ONBOARDING SCREEN 3: OTP VERIFICATION
 *
 * ⚠️ THE ACCOUNT IS CREATED HERE, not at the end
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleVerify = async () => {
    if (code.length < 4) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    const result = await api.auth.verifyOTP(phone, code);

    setLoading(false);

    if (result.error) {
      setError(true);
      Alert.alert('Error', result.error.message);
      return;
    }

    // ⚠️ Account created! Token is stored by API client
    router.push('/(onboarding)/name');
  };

  const handleResend = async () => {
    const result = await api.auth.sendOTP(phone);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      Alert.alert('Sent', 'A new code has been sent');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('onboarding.otp.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.otp.subtitle', { phone })}</Text>

          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setError(false);
            }}
            placeholder="000000"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            autoFocus
            error={error}
          />

          {error && <Text style={styles.errorText}>{t('onboarding.otp.error')}</Text>}

          <Button
            title={t('onboarding.otp.resend')}
            onPress={handleResend}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.otp.verify')}
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < 4}
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
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
