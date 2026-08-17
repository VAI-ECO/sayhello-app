/**
 * A3 QUEUE OFFER — one at a time (§16.12)
 * GET /ambassador/queue · POST …/:offerId/respond
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import {
  firstHangoutFromOffer,
  getQueueOffer,
  respondToQueueOffer,
  type QueueOffer,
} from '../../src/api/ambassador';

function msUntil(iso: string): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QueueOfferScreen() {
  const router = useRouter();
  const [offer, setOffer] = useState<QueueOffer | null>(null);
  const [eligible, setEligible] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getQueueOffer();
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setEligible(res.data?.eligible ?? false);
    setMessage(res.data?.message ?? null);
    setOffer(res.data?.offers?.[0] ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!offer) return;
    const tick = () => setCountdown(formatCountdown(msUntil(offer.expiresAt)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offer]);

  async function respond(response: 'accept' | 'decline') {
    if (!offer) return;
    setActing(true);
    const res = await respondToQueueOffer(offer.id, response);
    setActing(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.replace('/(ambassador)/hangouts');
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

  if (!eligible) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="queue-ineligible">
          <Text style={styles.ineligibleTitle}>{t('ambassador.queue.ineligibleTitle')}</Text>
          <Text style={styles.body}>{message}</Text>
          <Button title={t('ambassador.hangouts.title')} onPress={() => router.push('/(ambassador)/hangouts')} />
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

  const hangout = firstHangoutFromOffer(offer);
  const name = hangout?.businessName ?? t('ambassador.common.helloHangout');

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{t('ambassador.queue.offeredToYou')}</Text>
        <Text style={styles.timer} testID="queue-timer">
          {countdown}
        </Text>
      </View>

      <Text style={styles.name} testID="queue-business-name">{name.toUpperCase()}</Text>

      <View style={styles.worthCard}>
        <Text style={styles.worthLabel}>{t('ambassador.queue.worthYearOne')}</Text>
        <Text style={styles.worthAmount}>{t('figures.year1ServiceOnly')}</Text>
      </View>

      <View style={styles.meta}>
        <MetaRow label={t('ambassador.queue.signedBy')} value={t('ambassador.queue.anotherAmbassador')} />
        <MetaRow
          label={t('ambassador.queue.renewalYears')}
          value={t('ambassador.queue.renewalYearsValue', { amount: t('figures.annual') })}
        />
      </View>

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
          variant="secondary"
          testID="queue-pass"
        />
      </View>
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
  screen: { padding: 22, gap: 16 },
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
  actions: { gap: 10, marginTop: 'auto' as const },
});
