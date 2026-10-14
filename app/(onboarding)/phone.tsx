/**
 * ONBOARDING SCREEN 2: PHONE NUMBER + TERMS CONSENT
 *
 * ⚠️ TERMS CONSENT INLINE ON THIS SCREEN, never a separate step
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { showDialog } from '../../src/lib/dialog';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { codeLengthParams, timingFromReply, timingParams } from '../../src/lib/otp-timing';
import { api } from '../../src/api/client';
import { DEFAULT_MARKET_CODE, marketByCallingCode, toE164InMarket } from '../../src/lib/phone';
import { MarketPicker } from '../../src/components/consumer/MarketPicker';
import { getPublicConfig } from '../../src/api/account';
import { markTermsAccepted } from '../../src/state/pending-terms-acceptance';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sending = useRef(false);
  // The market is picked by hand (§26.9) — never read from the SIM or the device locale.
  const [callingCode, setCallingCode] = useState(DEFAULT_MARKET_CODE);
  const market = marketByCallingCode(callingCode).market;
  const storedPhone = toE164InMarket(phone, callingCode);
  // The terms are accepted on this screen (§36.2); nothing is sent until they are.
  const [accepted, setAccepted] = useState(false);
  // The minimum age is the server's setting (§24.1), never a constant here.
  const [minimumAge, setMinimumAge] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    void getPublicConfig().then(res => {
      if (live && res.data && Number.isInteger(res.data.minimumAge)) setMinimumAge(res.data.minimumAge);
    });
    return () => { live = false; };
  }, []);

  const handleContinue = async () => {
    if (sending.current) return;
    if (!accepted) return;
    if (!storedPhone) {
      setError(true);
      return;
    }

    sending.current = true;
    setError(false);
    setLoading(true);
    // The acceptance given on this screen travels with the OTP verify call, which creates the account.
    markTermsAccepted();

    // Canon (ROLE-1 §2: phone → OTP → name and birthday) collects the birthday after this step, so
    // there is nothing real to send here — and nothing invented is. The birthday is checked
    // server-side against minimum_age on the name step.
    const result = await api.auth.requestOTP(storedPhone);

    sending.current = false;
    setLoading(false);

    if (result.error) {
      showDialog('Error', result.error.message);
      return;
    }

    router.push({
      pathname: '/(onboarding)/otp',
      params: { phone: storedPhone, ...timingParams(timingFromReply(result.data)), ...codeLengthParams(result.data) },
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.phone.title')}</Text>

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
                }}
                placeholder={market.entryHint}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoFocus
                error={error}
              />
            </View>
          </View>
          <Text style={styles.hint}>{t('s2c.phone.pickHint')}</Text>
          <Text style={styles.hint}>{t('s2c.phone.elsewhere')}</Text>

          {error && <Text style={styles.errorText}>{t('onboarding.phone.error')}</Text>}

          {/* Terms accept with the zero-tolerance text ON the screen, never behind a link (§36.2) */}
          <View style={styles.eula} testID="eula-block">
            <Text style={styles.eulaTitle} accessibilityRole="header">{t('s2c.eula.title')}</Text>
            <Text style={styles.eulaIntro}>{t('s2c.eula.intro')}</Text>
            <Text style={styles.eulaHead}>{t('s2c.eula.zeroTitle')}</Text>
            <Text style={styles.eulaBody}>{t('s2c.eula.zeroBody')}</Text>
            <Text style={styles.eulaHead}>{t('s2c.eula.pinTitle')}</Text>
            <Text style={styles.eulaBody}>{t('s2c.eula.pinBody')}</Text>
            <TouchableOpacity
              style={styles.acceptRow}
              onPress={() => setAccepted(v => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              accessibilityLabel={t('s2c.phone.acceptLabel')}
              testID="terms-accept"
            >
              <View style={[styles.box, accepted && styles.boxOn]}>{accepted ? <Text style={styles.tick}>✓</Text> : null}</View>
              <Text style={styles.acceptText}>{t('s2c.phone.acceptLabel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readLink} onPress={() => router.push('/(onboarding)/legal')} accessibilityRole="link" testID="terms-read">
              <Text style={styles.link}>{t('s2c.eula.readFull')}</Text>
            </TouchableOpacity>
            <Text style={styles.eulaBody}>{t('s2c.eula.contactLine')}</Text>
            {minimumAge !== null ? <Text style={styles.eulaBody}>{t('s2c.phone.minimumAge', { age: minimumAge })}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.phone.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!storedPhone || !accepted}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
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
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  marketCol: { width: 104, paddingTop: 0 },
  hint: { fontSize: 13, lineHeight: 19, color: Colors.Muted },
  eula: { backgroundColor: Colors.Bone, borderRadius: 14, padding: 16, gap: 8, marginTop: 8 },
  eulaTitle: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  eulaIntro: { fontSize: 14, color: Colors.Muted },
  eulaHead: { fontSize: 15, fontWeight: '700', color: Colors.Ink, marginTop: 6 },
  eulaBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  acceptRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.Ink, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.Chalk },
  boxOn: { backgroundColor: Colors.Ink },
  tick: { color: Colors.Chalk, fontSize: 15, fontWeight: '800' },
  acceptText: { flex: 1, fontSize: 14, lineHeight: 20, color: Colors.Ink, fontWeight: '600' },
  link: { fontSize: 14, fontWeight: '700', color: Colors.Ink, textDecorationLine: 'underline', marginTop: 4 },
  readLink: { minHeight: 44, justifyContent: 'center' },
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
