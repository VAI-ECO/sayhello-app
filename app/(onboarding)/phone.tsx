/**
 * ONBOARDING SCREEN 2: PHONE NUMBER + TERMS CONSENT
 *
 * ⚠️ TERMS CONSENT INLINE ON THIS SCREEN, never a separate step
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleContinue = async () => {
    if (phone.length < 10) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    // TODO: Get dateOfBirth from onboarding flow state
    const result = await api.auth.requestOTP(phone, '1990-01-01');

    setLoading(false);

    if (result.error) {
      Alert.alert('Error', result.error.message);
      return;
    }

    router.push({
      pathname: '/(onboarding)/otp',
      params: { phone },
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.phone.title')}</Text>

          <TextInput
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError(false);
            }}
            placeholder={t('onboarding.phone.placeholder')}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoFocus
            error={error}
          />

          {error && <Text style={styles.errorText}>{t('onboarding.phone.error')}</Text>}

          <Text style={styles.terms}>{t('onboarding.phone.terms')}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.phone.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={phone.length < 10}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
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
  terms: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.7,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginTop: -8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
