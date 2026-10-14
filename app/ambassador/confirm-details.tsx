/**
 * A9 CONFIRM DETAILS — CANON-RL-03-SN-02 (step 2 of 3): "Is this right?"
 *
 * Name and address (from A8), the PIN — this Ambassador's own live GPS reading at the door,
 * never typed and never a default — and, optionally, "who to call" (kept server-side, never
 * published). One listing per location (§1.13): an existing Hello Hangout at this address is
 * refused HERE, before the price step, not discovered later. The server checks again at signing.
 *
 * Not drawn from the design, recorded: Category ("A Places value") and Hours come from the
 * Google Places list, which is not connected; the owner sets hours in their own portal.
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { lookupBusinesses } from '../../src/api/ambassador';
import { AmbassadorShell, Card, useAmbassadorLayout } from '../../src/components/ambassador/AmbassadorShell';
import { readDeviceFix, type DeviceFix, type FixProblem } from '../../src/lib/device-fix';

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const PIN_PROBLEM_KEY: Record<FixProblem, string> = {
  denied: 'ambassador.visitCheckIn.gpsDenied',
  blocked: 'ambassador.visitCheckIn.gpsBlocked',
  services_off: 'ambassador.visitCheckIn.gpsServicesOff',
  failed: 'ambassador.visitCheckIn.gpsFailed',
};

export default function ConfirmDetailsScreen() {
  const router = useRouter();
  const layout = useAmbassadorLayout();
  const params = useLocalSearchParams<{ name?: string; address?: string }>();
  const [name, setName] = useState(typeof params.name === 'string' ? params.name : '');
  const [address, setAddress] = useState(typeof params.address === 'string' ? params.address : '');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fix, setFix] = useState<DeviceFix | null>(null);
  const [pin, setPin] = useState<'reading' | 'ready' | FixProblem>('reading');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(true);

  async function readPin() {
    setPin('reading');
    const result = await readDeviceFix();
    if (!mounted.current) return;
    if (result.ok) {
      setFix(result.fix);
      setPin('ready');
    } else {
      setFix(null);
      setPin(result.problem);
    }
  }

  useEffect(() => {
    mounted.current = true;
    void readPin();
    return () => { mounted.current = false; };
  }, []);

  const missingStart = !name.trim() || !address.trim();

  async function confirm() {
    if (checking) return;
    if (missingStart) { setMessage(t('ambassador.findBusiness.required')); return; }
    if (!fix) { setMessage(t(pin === 'reading' ? 'ambassador.confirmDetails.pinReading' : PIN_PROBLEM_KEY[pin === 'ready' ? 'failed' : pin])); return; }
    setChecking(true);
    setMessage(null);
    const res = await lookupBusinesses(address.trim());
    if (!mounted.current) return;
    setChecking(false);
    if (res.error || !res.data) { setMessage(t('ambassador.confirmDetails.failed')); return; }
    const dup = res.data.matches.find((m) => normalize(m.address) === normalize(address));
    if (dup) { setMessage(t('ambassador.confirmDetails.alreadyListed', { name: dup.name })); return; }
    router.push({
      pathname: '/ambassador/photo',
      params: {
        name: name.trim(),
        address: address.trim(),
        lat: String(fix.lat),
        lng: String(fix.lng),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      },
    });
  }

  const fields = (
    <>
      <Field label={t('ambassador.confirmDetails.nameLabel')} note={t('ambassador.confirmDetails.nameNote')}>
        <TextInput value={name} onChangeText={(v) => { setName(v); setMessage(null); }} style={styles.input} accessibilityLabel={t('ambassador.confirmDetails.nameLabel')} testID="confirm-name" />
      </Field>
      <Field label={t('ambassador.confirmDetails.addressLabel')} note={t('ambassador.confirmDetails.addressNote')}>
        <TextInput value={address} onChangeText={(v) => { setAddress(v); setMessage(null); }} style={styles.input} accessibilityLabel={t('ambassador.confirmDetails.addressLabel')} testID="confirm-address" />
      </Field>
      <Field label={t('ambassador.confirmDetails.pinLabel')} note={t('ambassador.confirmDetails.pinNote')}>
        {pin === 'reading' ? (
          <View style={styles.inline}><ActivityIndicator color={Colors.Ink} /><Text style={styles.value}>{t('ambassador.confirmDetails.pinReading')}</Text></View>
        ) : pin === 'ready' && fix ? (
          <Text style={styles.value} testID="confirm-pin-ready">
            {fix.accuracyM !== null ? t('ambassador.confirmDetails.pinReady', { m: Math.round(fix.accuracyM) }) : t('ambassador.confirmDetails.pinReadyNoAccuracy')}
          </Text>
        ) : (
          <View style={{ gap: 6 }}>
            <Text accessibilityRole="alert" style={styles.value} testID="confirm-pin-problem">{t(PIN_PROBLEM_KEY[pin as FixProblem])}</Text>
            {pin === 'blocked' ? (
              <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button" testID="confirm-open-settings">
                <Text style={styles.link}>{t('ambassador.common.openSettings')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        {pin !== 'reading' ? (
          <TouchableOpacity onPress={() => void readPin()} accessibilityRole="button" testID="confirm-pin-retry">
            <Text style={styles.link}>{t('ambassador.confirmDetails.pinRetry')}</Text>
          </TouchableOpacity>
        ) : null}
      </Field>
      <Field label={t('ambassador.confirmDetails.contactName')} note={t('ambassador.confirmDetails.contactNameNote')}>
        <TextInput value={contactName} onChangeText={setContactName} style={styles.input} accessibilityLabel={t('ambassador.confirmDetails.contactName')} testID="confirm-contact-name" />
      </Field>
      <Field label={t('ambassador.confirmDetails.contactPhone')} note={t('ambassador.confirmDetails.contactPhoneNote')}>
        <TextInput value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" style={styles.input} accessibilityLabel={t('ambassador.confirmDetails.contactPhone')} testID="confirm-contact-phone" />
      </Field>
    </>
  );

  return (
    <AmbassadorShell title={t('ambassador.confirmDetails.title')} subtitle={`${t('ambassador.confirmDetails.step')} · ${t('ambassador.confirmDetails.lead')}`} testID="ambassador-confirm-details">
      <View style={layout === 'phone' ? styles.column : styles.grid}>{fields}</View>
      <Text style={styles.body}>{t('ambassador.confirmDetails.oneListing')}</Text>
      <Text style={styles.body}>{t('ambassador.confirmDetails.noPlacesNote')}</Text>
      {message ? <Text accessibilityRole="alert" style={styles.error} testID="confirm-message">{message}</Text> : null}
      <TouchableOpacity
        onPress={() => void confirm()}
        disabled={checking}
        accessibilityRole="button"
        accessibilityState={{ disabled: checking, busy: checking }}
        style={[styles.solid, checking && styles.disabled]}
        testID="confirm-looks-right"
      >
        <Text style={styles.solidText}>{t('ambassador.confirmDetails.looksRight')}</Text>
      </TouchableOpacity>
    </AmbassadorShell>
  );
}

function Field({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>{label}</Text>
      {children}
      <Text style={styles.note}>{note}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  column: { gap: 13 },
  grid: { gap: 13 },
  body: { fontSize: 15, lineHeight: 23, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  eyebrow: { fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '700', color: Colors.Muted },
  note: { fontSize: 14, color: Colors.Muted },
  value: { fontSize: 15.5, lineHeight: 22, color: Colors.Ink },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  link: { fontSize: 15.5, fontWeight: '700', color: Colors.HelloBlue },
  input: { fontSize: 17, color: Colors.Ink, paddingVertical: 6 },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
