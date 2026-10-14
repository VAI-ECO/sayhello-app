/**
 * THAT ONE IS TAKEN — CANON-RL-04-SN-03 (RULES §25.6–25.7).
 * "Somebody got there first. It is theirs and we will not move it." First come, first served with an
 * admin path to release a squatted code — not just because somebody wants it. Signal Red only because
 * this is a genuine error state (§34.4). No blame, and a way forward rather than a bare rejection.
 *
 * Not built, recorded: the design's "Free right now" list of suggested alternatives — how suggestions
 * are derived is not specified, so none are invented; the person tries their own.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { checkCodeAvailability } from '../../src/api/codes';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { setPendingCode } from '../../src/state/pending-code';

export default function CodeTakenScreen() {
  const router = useRouter();
  const { code: takenCode, reserved } = useLocalSearchParams<{ code?: string; reserved?: string }>();
  const [nextCode, setNextCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function tryAnother() {
    if (!nextCode.trim() || checking) return;
    setChecking(true);
    setMessage(null);
    const res = await checkCodeAvailability(nextCode.trim());
    setChecking(false);
    if (res?.data?.available) {
      // Hand the free code to the picker so it is not retyped.
      setPendingCode(nextCode);
      router.replace('/influencer/pick-code');
      return;
    }
    setMessage(res?.error ? t('influencer.pickCode.errors.validation_error') : t('influencer.pickCode.errors.code_taken'));
  }

  return (
    <InfluencerShell title={t('influencer.codeTaken.title')} subtitle={t('influencer.codeTaken.lead')} testID="creator-code-taken">
      <Eyebrow>{t('influencer.pickCode.yourCode')}</Eyebrow>
      <View style={styles.field}>
        <Text style={styles.prefix}>{t('influencer.pickCode.prefix')}</Text>
        {takenCode ? <Text style={styles.takenCode} testID="code-taken-display">{takenCode}</Text> : null}
        <Text style={styles.takenTag}>{reserved === '1' ? t('influencer.pickCode.reserved') : t('influencer.pickCode.taken')}</Text>
      </View>

      <Eyebrow>{t('influencer.codeTaken.freeNow')}</Eyebrow>
      <TextInput
        value={nextCode}
        onChangeText={(v) => { setNextCode(v); setMessage(null); }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={t('influencer.codeTaken.tryAnother')}
        placeholderTextColor={Colors.Faint}
        accessibilityLabel={t('influencer.codeTaken.tryAnother')}
        style={styles.input}
        testID="code-taken-input"
      />
      {message ? <Text accessibilityRole="alert" style={styles.error} testID="code-taken-message">{message}</Text> : null}

      <Card>
        <Text style={styles.cardTitle}>{t('influencer.codeTaken.squattedTitle')}</Text>
        <Text style={styles.body}>{t('influencer.codeTaken.squattedBody')}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>{t('influencer.codeTaken.reservedTitle')}</Text>
        <Text style={styles.body}>{t('influencer.codeTaken.reservedBody')}</Text>
      </Card>

      <TouchableOpacity
        onPress={() => void tryAnother()}
        disabled={!nextCode.trim() || checking}
        accessibilityRole="button"
        accessibilityState={{ disabled: !nextCode.trim() || checking, busy: checking }}
        style={[styles.outline, (!nextCode.trim() || checking) && styles.disabled]}
        testID="code-try-another"
      >
        <Text style={styles.outlineText}>{t('influencer.codeTaken.tryAnother')}</Text>
      </TouchableOpacity>
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.SignalRed, borderRadius: 13, minHeight: 56, paddingHorizontal: 16 },
  prefix: { fontSize: 17, color: Colors.Muted },
  takenCode: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  takenTag: { marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: Colors.SignalRed },
  input: { backgroundColor: '#F2EFEB', borderRadius: 13, minHeight: 52, paddingHorizontal: 18, fontSize: 17, color: Colors.Ink },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
