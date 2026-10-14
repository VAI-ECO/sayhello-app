/**
 * ONBOARDING SCREEN 3: OTP VERIFICATION
 *
 * ⚠️ THE ACCOUNT IS CREATED HERE, not at the end
 */

import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';
import { deviceLocale } from '../../src/lib/phone';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const verifying = useRef(false);
  const resending = useRef(false);

  const handleVerify = async () => {
    if (verifying.current) return;
    if (code.length < 6) {
      setError(true);
      return;
    }

    verifying.current = true;
    setError(false);
    setLoading(true);

    const result = await api.auth.verifyOTP(phone, code, deviceLocale());

    verifying.current = false;
    setLoading(false);

    if (result.error) {
      setError(true);
      Alert.alert(t('onboarding.otp.error'), result.error.message);
      return;
    }

    // ⚠️ Account created! Token is stored by API client
    router.push('/(onboarding)/name');
  };

  const handleResend = async () => {
    if (resending.current) return;
    resending.current = true;
    // Canon (ROLE-1 §2) collects the birthday after the OTP: nothing real to send, nothing invented.
    // The real birthday is checked server-side on the name step.
    const result = await api.auth.requestOTP(phone);
    resending.current = false;
    if (result.error) {
      Alert.alert(t('onboarding.otp.resendFailed'), result.error.message);
    } else {
      Alert.alert(t('onboarding.otp.resent'));
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

          <Text style={styles.subtitle}>{t('onboarding.otp.didntArrive')}</Text>
          <Button
            title={t('onboarding.otp.resend')}
            onPress={handleResend}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.subtitle}>{t('onboarding.otp.accountNote')}</Text>
        <Button
          title={t('onboarding.otp.verify')}
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < 6}
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
