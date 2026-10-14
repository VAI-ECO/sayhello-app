/**
 * ONBOARDING SCREEN 3: OTP VERIFICATION
 *
 * ⚠️ THE ACCOUNT IS CREATED HERE, not at the end
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { showDialog } from '../../src/lib/dialog';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';
import { deviceLocale } from '../../src/lib/phone';
import { codeLengthFromParam, codeLengthFromReply, lifetimeMinutes, retryAfterFromError, timingFromParams, timingFromReply } from '../../src/lib/otp-timing';

export default function OTPScreen() {
  const router = useRouter();
  const { phone, expiresIn: expiresInParam, resendAfter: resendAfterParam, codeLength: codeLengthParam } = useLocalSearchParams<{
    phone: string;
    expiresIn?: string;
    resendAfter?: string;
    codeLength?: string;
  }>();
  const initial = timingFromParams({ expiresIn: expiresInParam, resendAfter: resendAfterParam });
  // The code length is the server's admin setting (otp_length); the ruled default of 6 only when the server did not say.
  const [codeLength, setCodeLength] = useState(codeLengthFromParam(codeLengthParam));
  // Both figures are the server's (admin settings); nothing is shown until the server has supplied them.
  const [lifetime, setLifetime] = useState<number | null>(initial.expiresIn);
  const [resendAvailableAt, setResendAvailableAt] = useState<number>(Date.now() + (initial.resendAfter ?? 0) * 1000);
  const [resendCooldown, setResendCooldown] = useState(initial.resendAfter ?? 0);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const verifying = useRef(false);
  const resending = useRef(false);

  useEffect(() => {
    const tick = () => setResendCooldown(Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  const handleVerify = async () => {
    if (verifying.current) return;
    if (code.length < codeLength) {
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
      showDialog(t('onboarding.otp.error'), result.error.message);
      return;
    }

    // ⚠️ Account created! Token is stored by API client
    router.push('/(onboarding)/name');
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending.current) return;
    resending.current = true;
    // Canon (ROLE-1 §2) collects the birthday after the OTP: nothing real to send, nothing invented.
    // The real birthday is checked server-side on the name step.
    const result = await api.auth.requestOTP(phone);
    resending.current = false;
    if (result.error) {
      const wait = retryAfterFromError(result.error.body);
      if (wait !== null) setResendAvailableAt(Date.now() + wait * 1000);
      showDialog(t('onboarding.otp.resendFailed'), result.error.message);
    } else {
      const next = timingFromReply(result.data);
      const nextLength = codeLengthFromReply(result.data);
      if (nextLength !== null) setCodeLength(nextLength);
      if (next.expiresIn !== null) setLifetime(next.expiresIn);
      setResendAvailableAt(Date.now() + (next.resendAfter ?? 0) * 1000);
      showDialog(t('onboarding.otp.resent'));
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
            placeholder={'0'.repeat(codeLength)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={codeLength}
            autoFocus
            error={error}
          />

          {error && <Text style={styles.errorText}>{t('onboarding.otp.error')}</Text>}

          {lifetimeMinutes(lifetime) !== null && (
            <Text style={styles.subtitle} testID="otp-lifetime">
              {lifetimeMinutes(lifetime) === 1
                ? t('onboarding.otp.lastsOne')
                : t('onboarding.otp.lasts', { minutes: lifetimeMinutes(lifetime) as number })}
            </Text>
          )}

          <Text style={styles.subtitle}>{t('onboarding.otp.didntArrive')}</Text>
          <Button
            title={resendCooldown > 0 ? t('onboarding.otp.resendIn', { seconds: resendCooldown }) : t('onboarding.otp.resend')}
            onPress={handleResend}
            variant="secondary"
            disabled={resendCooldown > 0}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.subtitle}>{t('onboarding.otp.accountNote')}</Text>
        <Button
          title={t('onboarding.otp.verify')}
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < codeLength}
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
