/**
 * A3 QUEUE OFFER — one at a time (§16.12): never a browsable list, never an entitlement.
 * GET /ambassador/queue · POST …/:offerId/respond
 *
 * The server decides eligibility and says why not (§16.15 a new Ambassador with no signed
 * Hello Hangouts has no radius and gets no offers; §16.17–16.20 behind on a visit → paused,
 * told plainly which venue; §14.25 Away mode). Offers on the hello_hangouts model come as
 * `helloOffers` (needs migration 058 on the server); legacy `offers` still render. Accepting a
 * hello_hangouts offer locks it exclusively to this Ambassador (§16.7) — it becomes theirs at
 * their first verified visit (§16.8). "Worth to you" is an MA-05 slot: "—".
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  firstHangoutFromOffer,
  getQueueOffer,
  respondToQueueOffer,
  type QueueResponse,
} from '../../src/api/ambassador';
import { dayMonthYear } from '../../src/lib/ambassador-format';

function msUntil(iso: string): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type OfferView = {
  id: string;
  name: string;
  address?: string;
  expiresAt: string;
  why?: string;
  lastVisitAt?: string | null;
  lastScanAt?: string | null;
  renewalDate?: string | null;
};

function firstOffer(data: QueueResponse): OfferView | null {
  const hello = data.helloOffers?.[0];
  if (hello) {
    return {
      id: hello.id,
      name: hello.helloHangout?.name ?? t('ambassador.common.helloHangout'),
      address: hello.helloHangout?.address,
      expiresAt: hello.expiresAt,
      why: hello.whyAvailable,
      lastVisitAt: hello.lastVisitAt,
      lastScanAt: hello.lastCustomerScanAt,
      renewalDate: hello.renewalDate,
    };
  }
  const legacy = data.offers?.[0];
  if (!legacy) return null;
  const h = firstHangoutFromOffer(legacy);
  return {
    id: legacy.id,
    name: h?.businessName ?? t('ambassador.common.helloHangout'),
    address: h?.address,
    expiresAt: legacy.expiresAt,
    why: legacy.whyAvailable,
    lastVisitAt: legacy.lastVisitAt,
    lastScanAt: legacy.lastCustomerScanAt,
    renewalDate: legacy.renewalDate,
  };
}

export default function QueueOfferScreen() {
  const router = useRouter();
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    setLoading(true);
    setError(null);
    const res = await getQueueOffer();
    if (id !== loadId.current) return;
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setData(res.data ?? null);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const offer = data ? firstOffer(data) : null;

  useEffect(() => {
    if (!offer) return;
    const tick = () => setCountdown(formatCountdown(msUntil(offer.expiresAt)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offer?.id, offer?.expiresAt]);

  async function respond(response: 'accept' | 'decline') {
    if (!offer || acting) return;
    setActing(true);
    setActionError(null);
    const res = await respondToQueueOffer(offer.id, response);
    setActing(false);
    if (res.error) {
      setActionError(res.error.message);
      return;
    }
    router.replace('/ambassador/hangouts');
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator testID="queue-loading" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="queue-error">
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  if (data && !data.eligible) {
    const body =
      data.reason === 'no_signed_hangouts' ? t('ambassador.queue.noSignedBody')
        : data.reason === 'away_mode' ? t('ambassador.queue.awayBody')
          : data.reason === 'visit_overdue' ? t('ambassador.queue.behindBody')
            : data.message ?? '';
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="queue-ineligible">
          <Text style={styles.ineligibleTitle}>
            {t(data.reason === 'no_signed_hangouts' ? 'ambassador.queue.noSignedTitle' : 'ambassador.queue.ineligibleTitle')}
          </Text>
          <Text style={styles.body}>{body}</Text>
          {data.behind && data.behind.length > 0 ? (
            <Text style={styles.body} testID="queue-behind-list">{t('ambassador.queue.behindList', { names: data.behind.map((b) => b.name).join(', ') })}</Text>
          ) : null}
          <Button
            title={t(data.reason === 'no_signed_hangouts' ? 'ambassador.hangouts.signCta' : 'ambassador.hangouts.title')}
            onPress={() => router.push(data.reason === 'no_signed_hangouts' ? '/ambassador/find-business' : '/ambassador/hangouts')}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!offer) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="queue-empty">
          <Text style={styles.title}>{t('ambassador.queue.emptyTitle')}</Text>
          <Text style={styles.body}>{t('ambassador.queue.emptyBody')}</Text>
          <Button title={t('error.retry')} onPress={load} variant="secondary" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('ambassador.common.backLabel')} testID="ambassador-back">
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t('ambassador.queue.offeredToYou')}</Text>
          <Text style={styles.timer} testID="queue-timer">
            {countdown}
          </Text>
        </View>

        <Text style={styles.name} testID="queue-business-name">{offer.name.toUpperCase()}</Text>
        {offer.address ? <Text style={styles.body}>{offer.address}</Text> : null}
        {offer.why ? <Text style={styles.body} testID="queue-why">{t('ambassador.queue.why', { why: offer.why })}</Text> : null}

        <View style={styles.worthCard}>
          <Text style={styles.worthLabel}>{t('ambassador.queue.worthYearOne')}</Text>
          <Text style={styles.worthAmount}>{t('ambassador.common.notAvailable')}</Text>
        </View>

        <View style={styles.meta}>
          <MetaRow label={t('ambassador.queue.signedBy')} value={t('ambassador.queue.anotherAmbassador')} />
          <MetaRow label={t('ambassador.queue.lastVisit')} value={offer.lastVisitAt ? dayMonthYear(offer.lastVisitAt) : t('ambassador.queue.never')} />
          <MetaRow label={t('ambassador.queue.lastScan')} value={offer.lastScanAt ? dayMonthYear(offer.lastScanAt) : t('ambassador.queue.never')} />
          <MetaRow label={t('ambassador.queue.renewal')} value={offer.renewalDate ? dayMonthYear(offer.renewalDate) : t('ambassador.queue.never')} />
          <MetaRow label={t('ambassador.queue.renewalYears')} value={t('ambassador.queue.renewalYearsValue')} />
        </View>

        {actionError ? <Text accessibilityRole="alert" style={styles.actionError} testID="queue-action-error">{actionError}</Text> : null}

        <View style={styles.actions}>
          <Button
            title={t('ambassador.queue.accept')}
            onPress={() => respond('accept')}
            loading={acting}
            testID="queue-accept"
          />
          <Button
            title={t('ambassador.queue.pass')}
            onPress={() => respond('decline')}
            disabled={acting}
            variant="secondary"
            testID="queue-pass"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 16 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  timer: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  title: { fontSize: 22, fontWeight: '800', color: Colors.Ink, textAlign: 'center' },
  ineligibleTitle: { fontSize: 22, fontWeight: '800', color: Colors.Ink, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, color: Colors.Muted, textAlign: 'center' },
  actionError: { fontSize: 15, color: Colors.SignalRed, textAlign: 'center' },
  name: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    color: Colors.Ink,
    lineHeight: 34,
  },
  worthCard: {
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worthLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  worthAmount: { fontSize: 30, fontWeight: '900', color: Colors.Ink },
  meta: { gap: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.Line },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    backgroundColor: Colors.Chalk,
  },
  metaLabel: { fontSize: 14, color: Colors.Muted },
  metaValue: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  actions: { gap: 10, marginTop: 8 },
});
