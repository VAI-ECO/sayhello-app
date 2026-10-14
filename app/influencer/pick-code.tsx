/**
 * PICK YOUR CODE — CANON-RL-04-SN-02 (RULES §25).
 *
 * "You choose it. It is never generated for you, and it is checked as you type." Availability is
 * checked live (debounced) against POST /codes/check-availability — case-insensitive, reserved
 * words and profanity refused, first come first served. The length bound is the server's (MONEY
 * Part 6), so a code that is too short or long comes back as a validation answer, not a number here.
 * "Take this code" (POST /codes/influencer) needs an approved application; the code is editable
 * until its first attribution and locked for good after (§25.5) — a locked code is shown as such,
 * not offered for editing. Codes carry credit, never price (§2.10).
 *
 * The explicit "Check it" button keeps the original flow: an unavailable answer opens "That one is
 * taken" (SN-03). Typing alone never navigates.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { checkCodeAvailability, setInfluencerCode } from '../../src/api/codes';
import { getInfluencerMe, type InfluencerMe } from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { takePendingCode } from '../../src/state/pending-code';
import { sameAttributionCode } from '../../src/lib/attribution-code';

const DEBOUNCE_MS = 350;
type Status = 'idle' | 'checking' | 'available' | 'taken' | 'reserved' | 'invalid' | 'error';

export default function PickCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState(() => takePendingCode() ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [me, setMe] = useState<InfluencerMe | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const checkId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      const res = await getInfluencerMe();
      if (!mounted.current || !res?.data) return;
      setMe(res.data.me);
      if (res.data.me.code && !code) setCode(res.data.me.code.code);
    })();
    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const own = me?.code?.code ?? null;

  const runCheck = useCallback(async (value: string): Promise<Status> => {
    const id = ++checkId.current;
    const trimmed = value.trim();
    if (!trimmed) { setStatus('idle'); return 'idle'; }
    // The person's own code is theirs under the namespace rules too (case, and O/0, I/1): the server excludes their own row on save.
    if (own && sameAttributionCode(trimmed, own)) { setStatus('available'); return 'available'; }
    setStatus('checking');
    const res = await checkCodeAvailability(trimmed);
    if (id !== checkId.current || !mounted.current) return 'idle';
    let next: Status;
    if (res?.error) next = res.error.code === 'validation_error' || res.error.status === 400 ? 'invalid' : 'error';
    else if (res?.data?.available) next = 'available';
    else next = res?.data?.reason === 'reserved_system' || res?.data?.reason === 'reserved_profanity' ? 'reserved' : 'taken';
    setStatus(next);
    return next;
  }, [own]);

  // Checked as they type.
  useEffect(() => {
    if (!code.trim()) { checkId.current++; setStatus('idle'); return; }
    const handle = setTimeout(() => { void runCheck(code); }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, own]);

  async function checkNow() {
    setMessage(null);
    const result = await runCheck(code);
    if (result === 'taken' || result === 'reserved') {
      router.push({ pathname: '/influencer/code-taken', params: { code: code.trim(), ...(result === 'reserved' ? { reserved: '1' } : {}) } });
    }
  }

  async function takeCode() {
    if (saving || status !== 'available') return;
    setSaving(true);
    setMessage(null);
    const res = await setInfluencerCode(code.trim());
    if (!mounted.current) return;
    setSaving(false);
    if (res?.error) {
      const known = ['code_taken', 'code_reserved', 'code_locked', 'not_approved', 'validation_error'];
      const c = res.error.code ?? '';
      setMessage(known.includes(c) ? t(`influencer.pickCode.errors.${c}`) : res.error.message);
      if (c === 'code_taken') setStatus('taken');
      if (c === 'code_reserved') setStatus('reserved');
      return;
    }
    router.replace('/influencer');
  }

  const locked = Boolean(me?.code?.locked);
  const blocked = me !== null && !me.isInfluencer && !me.canPickCode;
  const tag: { text: string; color: string } | null =
    status === 'available' ? { text: t('influencer.pickCode.available'), color: Colors.Fern }
      : status === 'taken' ? { text: t('influencer.pickCode.taken'), color: Colors.SignalRed }
        : status === 'reserved' ? { text: t('influencer.pickCode.reserved'), color: Colors.SignalRed }
          : status === 'checking' ? { text: t('influencer.pickCode.checking'), color: Colors.Muted }
            : null;

  if (locked) {
    return (
      <InfluencerShell title={t('influencer.pickCode.lockedTitle')} subtitle={t('influencer.pickCode.lockedBody')} testID="pick-code-locked">
        <View style={styles.field}>
          <Text style={styles.prefix}>{t('influencer.pickCode.prefix')}</Text>
          <Text style={styles.codeText} testID="pick-code-locked-code">{me?.code?.code}</Text>
        </View>
        <Text style={styles.body}>{t('influencer.common.creditNotCoupon')}</Text>
      </InfluencerShell>
    );
  }

  return (
    <InfluencerShell title={t('influencer.pickCode.title')} subtitle={t('influencer.pickCode.lead')} testID="creator-pick-code-screen">
      {blocked ? <Card testID="pick-code-not-approved"><Text style={styles.body}>{t('influencer.pickCode.notApproved')}</Text></Card> : null}

      <Text style={styles.eyebrow}>{t('influencer.pickCode.yourCode')}</Text>
      <View style={[styles.field, status === 'available' && styles.fieldOk, (status === 'taken' || status === 'reserved') && styles.fieldBad]}>
        <Text style={styles.prefix}>{t('influencer.pickCode.prefix')}</Text>
        <TextInput
          value={code}
          onChangeText={(v) => { setCode(v); setMessage(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('influencer.pickCode.yourCode')}
          style={styles.input}
          placeholderTextColor={Colors.Faint}
          testID="code-input"
        />
        {tag ? <Text style={[styles.tag, { color: tag.color }]} testID={status === 'available' ? 'code-available' : 'code-status'}>{tag.text}</Text> : null}
      </View>
      {status === 'invalid' ? <Text accessibilityRole="alert" style={styles.error} testID="code-invalid">{t('influencer.pickCode.errors.validation_error')}</Text> : null}
      {status === 'error' ? <Text accessibilityRole="alert" style={styles.error} testID="code-check-failed">{t('influencer.pickCode.checkFailed')}</Text> : null}
      {message ? <Text accessibilityRole="alert" style={styles.error} testID="code-message">{message}</Text> : null}

      {[
        ['lettersTitle', 'lettersBody'],
        ['editableTitle', 'editableBody'],
        ['firstTitle', 'firstBody'],
        ['reservedTitle', 'reservedBody'],
      ].map(([title, body]) => (
        <Card key={title}>
          <Text style={styles.cardTitle}>{t(`influencer.pickCode.${title}`)}</Text>
          <Text style={styles.body}>{t(`influencer.pickCode.${body}`)}</Text>
        </Card>
      ))}
      <Text style={styles.body} testID="pick-code-credit">{t('influencer.common.creditNotCoupon')}</Text>
      <Text style={styles.body}>{t('influencer.common.neverPercent')}</Text>

      <TouchableOpacity
        onPress={() => void checkNow()}
        disabled={!code.trim() || status === 'checking'}
        accessibilityRole="button"
        accessibilityState={{ disabled: !code.trim() || status === 'checking' }}
        style={[styles.outline, (!code.trim() || status === 'checking') && styles.disabled]}
        testID="code-check"
      >
        {status === 'checking' ? <ActivityIndicator color={Colors.Ink} /> : <Text style={styles.outlineText}>{t('influencer.pickCode.checkIt')}</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => void takeCode()}
        disabled={status !== 'available' || saving || blocked}
        accessibilityRole="button"
        accessibilityState={{ disabled: status !== 'available' || saving || blocked, busy: saving }}
        style={[styles.solid, (status !== 'available' || saving || blocked) && styles.disabled]}
        testID="code-take"
      >
        <Text style={styles.solidText}>{saving ? t('influencer.pickCode.saving') : t('influencer.pickCode.takeCode')}</Text>
      </TouchableOpacity>
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  eyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: Colors.Muted },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 13, minHeight: 56, paddingHorizontal: 16 },
  fieldOk: { borderColor: Colors.Fern },
  fieldBad: { borderColor: Colors.SignalRed },
  prefix: { fontSize: 17, color: Colors.Muted },
  codeText: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  input: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.Ink, paddingVertical: 12 },
  tag: { marginLeft: 8, fontSize: 14, fontWeight: '700' },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
