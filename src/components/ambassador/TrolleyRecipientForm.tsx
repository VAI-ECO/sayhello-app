/**
 * Payout recipient form (S1 wave 4): first name, last name, email, country -> POST /ambassador/payouts/account.
 * Honest states: the server answers 503 payouts_not_configured until Trolley credentials exist, and this shows that
 * plainly. Nothing here moves money and nothing claims the account is verified.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import { createPayoutAccount } from '../../api/ambassador';
import { Card } from './AmbassadorShell';

type Phase = 'idle' | 'sending' | 'done' | 'exists' | 'not_configured' | 'invalid' | 'failed' | 'network';

type Submit = (input: { firstName: string; lastName: string; email: string; country: string }) => ReturnType<typeof createPayoutAccount> | Promise<{ error?: { code?: string } | null }>;

export function TrolleyRecipientForm({ onSubmit }: { onSubmit?: Submit } = {}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');

  const valid = firstName.trim() && lastName.trim() && /^\S+@\S+\.\S+$/.test(email.trim()) && /^[A-Za-z]{2}$/.test(country.trim());

  async function submit() {
    if (!valid) { setPhase('invalid'); return; }
    setPhase('sending');
    const res = await (onSubmit ?? createPayoutAccount)({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), country: country.trim().toUpperCase() });
    if (!res.error) { setPhase('done'); return; }
    const code = res.error.code;
    if (code === 'payouts_not_configured') setPhase('not_configured');
    else if (code === 'recipient_exists') setPhase('exists');
    else if (code === 'invalid_account_details') setPhase('invalid');
    else if (code === 'provider_error') setPhase('failed');
    else setPhase('network');
  }

  const message: Record<Exclude<Phase, 'idle' | 'sending'>, string> = {
    done: t('payoutAccount.done'), exists: t('payoutAccount.exists'), not_configured: t('payoutAccount.notConfigured'),
    invalid: t('payoutAccount.invalid'), failed: t('payoutAccount.failed'), network: t('payoutAccount.network'),
  };
  const closed = phase === 'done' || phase === 'exists';

  return (
    <Card testID="payout-account-form">
      <Text style={styles.title}>{t('payoutAccount.title')}</Text>
      <Text style={styles.body}>{t('payoutAccount.body')}</Text>
      {!closed ? (
        <View style={{ gap: 10 }}>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder={t('payoutAccount.firstName')} accessibilityLabel={t('payoutAccount.firstName')} autoCapitalize="words" testID="payout-first-name" />
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder={t('payoutAccount.lastName')} accessibilityLabel={t('payoutAccount.lastName')} autoCapitalize="words" testID="payout-last-name" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={t('payoutAccount.email')} accessibilityLabel={t('payoutAccount.email')} autoCapitalize="none" keyboardType="email-address" testID="payout-email" />
          <TextInput style={styles.input} value={country} onChangeText={(v) => setCountry(v.slice(0, 2))} placeholder={t('payoutAccount.country')} accessibilityLabel={t('payoutAccount.country')} autoCapitalize="characters" maxLength={2} testID="payout-country" />
          <TouchableOpacity style={[styles.button, phase === 'sending' && styles.buttonBusy]} onPress={submit} disabled={phase === 'sending'} accessibilityRole="button" testID="payout-account-submit">
            {phase === 'sending' ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.buttonText}>{t('payoutAccount.submit')}</Text>}
          </TouchableOpacity>
        </View>
      ) : null}
      {phase !== 'idle' && phase !== 'sending' ? <Text style={styles.status} accessibilityLiveRegion="polite" testID="payout-account-status">{message[phase]}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, fontSize: 16, color: Colors.Ink, backgroundColor: Colors.Chalk },
  button: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonBusy: { opacity: 0.6 },
  buttonText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  status: { fontSize: 14.5, lineHeight: 21, color: Colors.Muted },
});
