/**
 * HELLO HANGOUT MEMBERSHIP — billing summary, renew, stop renewing, hardship (S3 stage 06; API 080).
 * GET /hello-hangouts/:id/billing · POST /renew · /cancel · /resume · /hardship.
 *
 * ONE price and the coupon it was signed with (RULES §1.1) — both figures come from the server, in
 * integer cents; nothing here is a literal. Payment state changes ONLY by the verified webhook:
 * "Renew" creates a payment intent and says plainly when payments are not switched on or when this
 * build has no payment sheet. Hardship is never advertised (§1.8): one quiet link, shown only here.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { CouponEntry } from '../../src/components/hangout/CouponEntry';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { formatCents } from '../../src/lib/money-format';
import {
  cancelMembership, getBilling, petitionHardship, renewMembership, resumeMembership, withdrawHardship, type Billing,
} from '../../src/api/hangout-business';

function day(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HangoutBillingScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [b, setB] = useState<Billing | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [petition, setPetition] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const res = await getBilling(helloHangoutId);
    if (res.error || !res.data) { setState('error'); return; }
    setB(res.data.billing);
    setState('ready');
  }, [helloHangoutId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function run(fn: () => Promise<{ error?: { code?: string; status?: number; message: string } }>, ok?: string) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const res = await fn();
    setBusy(false);
    if (res.error) {
      setMessage(res.error.code === 'payments_not_configured' ? t('hangoutBiz.billing.paymentsOff') : res.error.message || t('hangoutBiz.loadFailed'));
      return;
    }
    if (ok) setMessage(ok);
    await load();
  }

  const renew = () => run(async () => {
    const res = await renewMembership(helloHangoutId!);
    // A payment intent exists now; finishing it needs the payment sheet this build does not carry.
    if (!res.error) setMessage(`${t('hangoutBiz.billing.checkoutReady')} ${t('hangoutBiz.billing.paymentSheetMissing')}`);
    return res;
  });

  function confirmStop() {
    if (!b) return;
    const unpaid = b.status === 'pending_payment';
    Alert.alert(
      t('hangoutBiz.billing.cancelTitle'),
      unpaid ? t('hangoutBiz.billing.cancelUnpaid') : t('hangoutBiz.billing.cancelBody', { date: day(b.renewsAt) }),
      [
        { text: t('hangoutBiz.billing.keep'), style: 'cancel' },
        {
          text: t('hangoutBiz.billing.cancelConfirm'),
          style: 'destructive',
          onPress: () => void run(() => cancelMembership(helloHangoutId!), t('hangoutBiz.billing.cancelled', { date: day(b.renewsAt) })),
        },
      ],
    );
  }

  if (state === 'loading') return <View style={[styles.screen, styles.centered]}><ActivityIndicator color={Colors.Ink} /></View>;
  if (state === 'error' || !b) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="billing-error">
          <Text accessibilityRole="alert" style={styles.muted}>{t('hangoutBiz.loadFailed')} {t('hangoutBiz.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusLabel = t(`hangoutBiz.billing.status.${b.status}`);
  const stopping = b.cancelRequestedAt !== null && b.status === 'active';
  const canStop = b.status === 'pending_payment' || (b.status === 'active' && !stopping);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.backText}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangoutBiz.billing.title')}</Text>
        <Text style={styles.status} testID="billing-status">{statusLabel}</Text>
        {b.status === 'lapsed' ? <Text style={styles.note}>{t('hangoutBiz.billing.lapsedNote')}</Text> : null}

        <View style={styles.card} testID="billing-price">
          <Text style={styles.label}>{t('hangoutBiz.billing.price')}</Text>
          <Text style={styles.big}>{formatCents(b.priceCents)}</Text>
          {b.couponOffCents > 0 ? (
            <Text style={styles.muted}>{t('hangoutBiz.billing.listPrice')} {formatCents(b.listPriceCents)} · {t('hangoutBiz.billing.coupon')} −{formatCents(b.couponOffCents)}</Text>
          ) : null}
          {b.lockedUntil ? <Text style={styles.muted}>{t('hangoutBiz.billing.locked')} {day(b.lockedUntil)}</Text> : null}
          <View style={styles.row}>
            <Text style={styles.muted}>{t('hangoutBiz.billing.renews')}</Text>
            <Text style={styles.value}>{b.renewsAt ? day(b.renewsAt) : t('hangoutBiz.billing.notYetPaid')}</Text>
          </View>
        </View>

        {(b.status === 'pending_payment' || b.status === 'lapsed') && !b.founding && helloHangoutId ? (
          <CouponEntry helloHangoutId={helloHangoutId} onChanged={() => void load()} />
        ) : null}

        {!b.paymentsConfigured ? <Text style={styles.note} testID="billing-payments-off">{t('hangoutBiz.billing.paymentsOff')}</Text> : null}

        {b.canRenew ? (
          <TouchableOpacity style={[styles.cta, busy && styles.ctaOff]} disabled={busy} onPress={() => void renew()} accessibilityRole="button" testID="billing-renew">
            <Text style={styles.ctaText}>{b.status === 'pending_payment' ? t('hangoutBiz.billing.payNow') : t('hangoutBiz.billing.renewNow')}</Text>
          </TouchableOpacity>
        ) : null}

        {stopping ? (
          <View style={styles.card}>
            <Text style={styles.muted}>{t('hangoutBiz.billing.cancelled', { date: day(b.renewsAt) })}</Text>
            <TouchableOpacity onPress={() => void run(() => resumeMembership(helloHangoutId!), t('hangoutBiz.billing.resumed'))} accessibilityRole="button" testID="billing-resume">
              <Text style={styles.link}>{t('hangoutBiz.billing.resume')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {canStop ? (
          <TouchableOpacity onPress={confirmStop} accessibilityRole="button" testID="billing-stop">
            <Text style={styles.link}>{t('hangoutBiz.billing.cancel')}</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.label}>{t('hangoutBiz.billing.history')}</Text>
        {b.payments.length === 0 ? <Text style={styles.muted}>{t('hangoutBiz.billing.historyEmpty')}</Text> : b.payments.map((p, i) => (
          <View key={`${p.paidAt}-${i}`} style={styles.row} testID={`billing-payment-${i}`}>
            <Text style={styles.muted}>{day(p.paidAt)}{p.periodStart && p.periodEnd ? ` · ${t('hangoutBiz.billing.term', { from: day(p.periodStart), to: day(p.periodEnd) })}` : ''}</Text>
            <Text style={styles.value}>{formatCents(p.amountCents)}</Text>
          </View>
        ))}

        {message ? <Text accessibilityRole="alert" style={styles.note} testID="billing-message">{message}</Text> : null}

        {/* Hardship: never advertised (§1.8). A quiet link at the very bottom; once petitioned, its state. */}
        {b.hardship && (b.hardship.status === 'pending' || b.hardship.status === 'approved' || b.hardship.status === 'declined') ? (
          <View style={styles.card} testID="billing-hardship-state">
            <Text style={styles.muted}>{t(`hangoutBiz.billing.hardship${b.hardship.status === 'pending' ? 'Pending' : b.hardship.status === 'approved' ? 'Approved' : 'Declined'}`)}</Text>
            {b.hardship.status === 'pending' ? (
              <TouchableOpacity onPress={() => void run(() => withdrawHardship(helloHangoutId!))} accessibilityRole="button">
                <Text style={styles.link}>{t('hangoutBiz.billing.hardshipWithdraw')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        {!b.hardship || b.hardship.status === 'declined' || b.hardship.status === 'withdrawn' ? (
          petition ? (
            <View style={styles.card} testID="billing-hardship-form">
              <Text style={styles.label}>{t('hangoutBiz.billing.hardshipTitle')}</Text>
              <Text style={styles.muted}>{t('hangoutBiz.billing.hardshipBody')}</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={2000}
                placeholder={t('hangoutBiz.billing.hardshipPlaceholder')}
                placeholderTextColor={Colors.Faint}
                testID="billing-hardship-note"
              />
              <TouchableOpacity
                style={[styles.cta, (busy || note.trim().length === 0) && styles.ctaOff]}
                disabled={busy || note.trim().length === 0}
                onPress={() => void run(async () => {
                  const r = await petitionHardship(helloHangoutId!, note.trim());
                  if (!r.error) { setPetition(false); setNote(''); }
                  return r;
                }, t('hangoutBiz.billing.hardshipSent'))}
                accessibilityRole="button"
                testID="billing-hardship-send"
              >
                <Text style={styles.ctaText}>{t('hangoutBiz.billing.hardshipSend')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setPetition(true)} accessibilityRole="button" testID="billing-hardship-link">
              <Text style={styles.quiet}>{t('hangoutBiz.billing.hardshipLink')}</Text>
            </TouchableOpacity>
          )
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.Chalk, paddingHorizontal: 0 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { padding: 22, gap: 14 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  status: { fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Fern },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 14, gap: 8 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Muted },
  big: { fontSize: 32, fontWeight: '900', color: Colors.Ink },
  muted: { fontSize: 14, lineHeight: 20, color: Colors.Muted, flexShrink: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  value: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  note: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 10, padding: 12 },
  cta: { backgroundColor: Colors.DeepFern, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  link: { fontSize: 15, fontWeight: '700', color: Colors.Ink, textDecorationLine: 'underline' },
  quiet: { fontSize: 13, color: Colors.Faint, textAlign: 'center', marginTop: 12 },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 10, padding: 12, minHeight: 100, fontSize: 15, color: Colors.Ink, textAlignVertical: 'top' },
});
