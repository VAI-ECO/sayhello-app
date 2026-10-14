/**
 * SIGN IN SCREEN 1: PHONE NUMBER
 *
 * For returning users. No account exists check — that would leak who's on Say Hello.
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { codeLengthParams, timingFromReply, timingParams } from '../../src/lib/otp-timing';
import { api } from '../../src/api/client';
import { DEFAULT_MARKET_CODE, marketByCallingCode, toE164InMarket } from '../../src/lib/phone';
import { MarketPicker } from '../../src/components/consumer/MarketPicker';

export default function SignInPhoneScreen() {
  const router = useRouter();
  const { setIdentityColor } = useTheme();
  useEffect(() => { setIdentityColor(Colors.Purple); }, [setIdentityColor]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const sending = useRef(false);
  // The market is picked by hand (§26.9), never read from the SIM or the device locale.
  const [callingCode, setCallingCode] = useState(DEFAULT_MARKET_CODE);
  const market = marketByCallingCode(callingCode).market;
  const storedPhone = toE164InMarket(phone, callingCode);

  const handleSendCode = async () => {
    if (sending.current) return;
    if (!storedPhone) {
      setError(true);
      return;
    }

    sending.current = true;
    setError(false);
    setSendError(null);
    setLoading(true);

    // Returning-user sign-in collects no birthday (and none is stored: RULES §24.4), so none is sent
    // — the server no longer requires one at this step.
    const result = await api.auth.requestOTP(storedPhone);

    sending.current = false;
    setLoading(false);

    if (result.error) {
      // A server or connection failure is not a bad number; say what happened.
      if (result.error.code === 'validation_error') setError(true);
      else setSendError(result.error.message);
      return;
    }

    // Never confirm or deny account existence — always proceed
    router.push({
      pathname: '/(auth)/sign-in-code',
      params: { phone: storedPhone, ...timingParams(timingFromReply(result.data)), ...codeLengthParams(result.data) },
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

          <View style={styles.phoneRow}>
            <View style={styles.marketCol}>
              <MarketPicker callingCode={callingCode} onChange={code => { setCallingCode(code); setError(false); }} />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError(false);
                  setSendError(null);
                }}
                placeholder={market.entryHint}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoFocus
                error={error}
                accessibilityLabel="Phone number"
                testID="phone-input"
              />
            </View>
          </View>

          {error && (
            <Text style={styles.errorText} testID="error-message">
              Enter a valid phone number
            </Text>
          )}
          {sendError ? (
            <Text accessibilityRole="alert" style={styles.errorText} testID="send-error-message">
              {sendError}
            </Text>
          ) : null}

          {/* "get in touch" is the underlined link drawn on SN-53; it opens the contact RULES §36.4 publishes. */}
          <Text style={styles.disclaimer}>
            {t('signIn.phone.disclaimerBefore')}
            <Text
              style={styles.disclaimerLink}
              onPress={() => void Linking.openURL(`mailto:${t('s2c.contact.email')}`).catch(() => undefined)}
              accessibilityRole="link"
              testID="get-in-touch-link"
            >
              {t('signIn.phone.disclaimerLink')}
            </Text>
            {t('signIn.phone.disclaimerAfter')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('signIn.phone.button')}
          onPress={handleSendCode}
          loading={loading}
          disabled={!storedPhone}
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
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  marketCol: { width: 104 },
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
  disclaimerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
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
