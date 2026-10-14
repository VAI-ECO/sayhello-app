/**
 * SIGN IN SCREEN 2: OTP VERIFICATION
 *
 * ⚠️ Rate limiting: 5 wrong codes = 15 minute lockout
 * ⚠️ Code lifetime and resend cooldown come from the server (admin settings), not from this file
 * ⚠️ Copy never confirms or denies account existence
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { showDialog } from '../../src/lib/dialog';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { identityColorFromProfile } from '../../src/theme/profile-color';
import { api } from '../../src/api/client';
import { deviceLocale } from '../../src/lib/phone';
import { destinationAfterSignIn } from '../../src/lib/session-entry';
import { claimResumeRoute } from '../../src/lib/pending-claim';
import { codeLengthFromParam, codeLengthFromReply, lifetimeMinutes, retryAfterFromError, timingFromParams, timingFromReply } from '../../src/lib/otp-timing';

export default function SignInCodeScreen() {
  const router = useRouter();
  const { setIdentityColor } = useTheme();
  const { phone, expiresIn: expiresInParam, resendAfter: resendAfterParam, codeLength: codeLengthParam } = useLocalSearchParams<{
    phone: string;
    expiresIn?: string;
    resendAfter?: string;
    codeLength?: string;
  }>();
  const initial = timingFromParams({ expiresIn: expiresInParam, resendAfter: resendAfterParam });
  // The code length is the server's admin setting (otp_length); the ruled default of 6 only when the server did not say.
  const [codeLength, setCodeLength] = useState(codeLengthFromParam(codeLengthParam));
  const [lifetime, setLifetime] = useState<number | null>(initial.expiresIn);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // A failure that is not a wrong code (rate limit window, connection, server): shown plainly, code kept.
  const [notice, setNotice] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(Date.now() + (initial.resendAfter ?? 0) * 1000);
  const [resendCooldown, setResendCooldown] = useState(initial.resendAfter ?? 0);
  const resending = useRef(false);

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
    if (code.length < codeLength) {
      setError(true);
      return;
    }

    setError(false);
    setNotice(null);
    setLoading(true);

    const result = await api.auth.verifyOTP(phone, code, deviceLocale());

    if (result.error) {
      setLoading(false);

      // Check for server-side lockout (429 status)
      if (result.error.status === 429 && result.error.lockedUntil) {
        setError(true);
        router.replace({
          pathname: '/(auth)/sign-in-locked',
          params: { phone, unlockTime: result.error.lockedUntil.toString() },
        });
        return;
      }

      // Only a code the server judged wrong is "Wrong code". A rate-limit window, a dropped connection or a
      // server fault is not the person's mistake: say what happened and keep what they typed.
      if (result.error.code === 'otp_invalid' || result.error.code === 'validation_error') {
        setError(true);
        setCode('');
        return;
      }
      if (result.error.status === 429) {
        const wait = retryAfterFromError(result.error.body);
        setNotice(wait !== null ? t('signIn.code.tooManyTry', { minutes: Math.max(1, Math.ceil(wait / 60)) }) : t('signIn.code.tooMany'));
        return;
      }
      setNotice(t('signIn.code.verifyFailed'));
      return;
    }

    // Load the authenticated account's appearance before entering the main app.
    const profile = await api.user.getProfile();
    setLoading(false);
    if (profile.error || !profile.data) {
      // The saved-session entry provides retry without asking for another OTP.
      router.replace('/(auth)/entry');
      return;
    }
    setIdentityColor(identityColorFromProfile(profile.data));
    // Someone who left before the birthday step goes back to it, not into the app (RULES 26.7, 24.5).
    const destination = destinationAfterSignIn(profile.data);
    // A Hello Hangout claim link opened while signed out finishes here (lane02 pending-claim), but only once the account is
    // complete: if the birthday step is still owed the token stays in memory and the person goes to that step first.
    const resume = destination === '/(tabs)/home' ? claimResumeRoute() : null;
    router.replace(resume ?? destination);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending.current) return;
    resending.current = true;

    // Returning-user sign-in collects no birthday (none is stored, RULES §24.4): none is sent.
    const result = await api.auth.requestOTP(phone);
    resending.current = false;
    if (result.error) {
      const wait = retryAfterFromError(result.error.body);
      if (wait !== null) setResendAvailableAt(Date.now() + wait * 1000);
      showDialog('Error', result.error.message);
    } else {
      const next = timingFromReply(result.data);
      const nextLength = codeLengthFromReply(result.data);
      if (nextLength !== null) setCodeLength(nextLength);
      if (next.expiresIn !== null) setLifetime(next.expiresIn);
      setResendAvailableAt(Date.now() + (next.resendAfter ?? 0) * 1000);
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
              setNotice(null);
            }}
            placeholder={'0'.repeat(codeLength)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={codeLength}
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
          {notice ? (
            <Text accessibilityRole="alert" style={styles.errorText} testID="verify-notice">
              {notice}
            </Text>
          ) : null}

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

          {lifetimeMinutes(lifetime) !== null && (
            <Text style={styles.expiryNote}>
              {lifetimeMinutes(lifetime) === 1
                ? t('signIn.code.expiryNoteOne')
                : t('signIn.code.expiryNote', { minutes: lifetimeMinutes(lifetime) as number })}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < codeLength}
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
