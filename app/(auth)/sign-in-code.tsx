/**
 * SIGN IN SCREEN 2: OTP VERIFICATION
 *
 * ⚠️ Rate limiting: 5 wrong codes = 15 minute lockout
 * ⚠️ Code expires in 10 minutes
 * ⚠️ Copy never confirms or denies account existence
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { identityColorFromProfile } from '../../src/theme/profile-color';
import { api } from '../../src/api/client';

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds in milliseconds

export default function SignInCodeScreen() {
  const router = useRouter();
  const { setIdentityColor } = useTheme();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(Date.now() + RESEND_COOLDOWN_MS);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Compute remaining cooldown from timestamp
  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
      setResendCooldown(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [resendAvailableAt]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    // TODO: Get locale from device settings
    const result = await api.auth.verifyOTP(phone, code, 'en-US');

    if (result.error) {
      setLoading(false);
      setError(true);

      // Check for server-side lockout (429 status)
      if (result.error.status === 429 && result.error.lockedUntil) {
        router.replace({
          pathname: '/(auth)/sign-in-locked',
          params: { phone, unlockTime: result.error.lockedUntil.toString() },
        });
        return;
      }

      setCode('');
      return;
    }

    // Load the authenticated account's appearance before entering the main app.
    const profile = await api.user.getProfile();
    setLoading(false);
    if (profile.error || !profile.data) {
      // The saved-session entry provides retry without asking for another OTP.
      router.replace('/(auth)');
      return;
    }
    setIdentityColor(identityColorFromProfile(profile.data));
    router.replace('/(tabs)');
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    // TODO: Sign-in flow needs dateOfBirth from backend session or stored locally
    const result = await api.auth.requestOTP(phone, '1990-01-01');
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      // Server resets attempt counter on successful OTP resend
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('signIn.code.title')}</Text>

          {/* ⚠️ REQUIRED WORDING — never confirms account exists */}
          <Text style={styles.subtitle} testID="account-notice">
            {t('signIn.code.subtitle', { phone })}
          </Text>

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
            accessibilityLabel="Verification code"
            testID="code-input"
          />

          {error && (
            <Text style={styles.errorText} testID="error-message">
              Wrong code. Try again.
            </Text>
          )}

          <Pressable
            onPress={handleResend}
            disabled={resendCooldown > 0}
            style={[styles.resendButton, resendCooldown > 0 && styles.resendDisabled]}
            role="button"
            accessibilityState={{ disabled: resendCooldown > 0 }}
            accessibilityLabel={
              resendCooldown > 0
                ? `Resend available in ${resendCooldown} seconds`
                : 'Resend code'
            }
            testID="resend-button"
          >
            <Text
              style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}
            >
              {resendCooldown > 0
                ? t('signIn.code.resendLabel', { seconds: formatCountdown(resendCooldown) })
                : t('signIn.code.resendAvailable')}
            </Text>
          </Pressable>

          <Text style={styles.expiryNote}>{t('signIn.code.expiryNote')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < 6}
          testID="verify-button"
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
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginTop: 8,
    marginBottom: 16,
  },
  resendButton: {
    padding: 12,
    marginTop: 8,
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    letterSpacing: -0.3,
  },
  resendTextDisabled: {
    opacity: 0.4,
  },
  expiryNote: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.7,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
