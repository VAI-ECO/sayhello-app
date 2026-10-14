/**
 * TERRITORY — CANON-RL-03-SN-25 ("Your patch"). Territory here means PROXIMITY, not ownership: no exclusivity, anyone can
 * sign anywhere, and nothing on the screen implies a protected patch. The radius is the ring-radius setting
 * (GET /ambassador/me); "Signed" is the Hello Hangouts this Ambassador services or signed (GET /ambassador/hangouts);
 * "Open near you" is the places waiting in the queue for this Ambassador (GET /ambassador/queue). The design's map is a
 * placeholder and is not built: the signed places are listed instead.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getAmbassadorHangouts, getAmbassadorMe, getQueueOffer, type AmbassadorHangout } from '../../src/api/ambassador';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';

export default function TerritoryScreen() {
  const router = useRouter();
  const [radius, setRadius] = useState<number | null>(null);
  const [signed, setSigned] = useState<AmbassadorHangout[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    const [m, h, q] = await Promise.all([getAmbassadorMe(), getAmbassadorHangouts(), getQueueOffer()]);
    if (m?.error || !m?.data || h?.error || !h?.data) { setState('error'); return; }
    setRadius(m.data.me.ringRadiusMiles ?? null);
    setSigned(h.data.hangouts);
    setOpen(q?.data ? (q.data.offers?.length ?? 0) + (q.data.helloOffers?.length ?? 0) : null);
    setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <AmbassadorShell title={t('ambRole.territory.title')} subtitle={t('ambRole.territory.patch')} onBack={() => router.back()} testID="ambassador-territory">
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' ? (
        <Card tone="error"><TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="territory-retry"><Text accessibilityRole="alert" style={s.body}>{t('ambRole.loadFailed')} {t('ambRole.retry')}</Text></TouchableOpacity></Card>
      ) : null}
      {state === 'ready' ? (
        <>
          <Text style={s.body} testID="territory-radius">{radius === null ? t('ambRole.territory.noRadius') : t('ambRole.territory.within', { radius: t('ambRole.territory.miles', { n: radius }) })}</Text>
          <View style={s.tiles}>
            <Card testID="territory-signed"><Text style={s.big}>{signed.length}</Text><Text style={s.kicker}>{t('ambRole.territory.signed')}</Text></Card>
            {open !== null ? <Card testID="territory-open"><Text style={s.big}>{open}</Text><Text style={s.kicker}>{t('ambRole.territory.open')}</Text></Card> : null}
          </View>
          <Text style={s.kicker}>{t('ambRole.territory.listTitle')}</Text>
          {signed.length === 0 ? <Text style={s.body} testID="territory-none">{t('ambRole.territory.none')}</Text> : signed.map((h) => (
            <Card key={h.id} testID={`territory-place-${h.id}`}><Text style={s.head}>{h.name}</Text><Text style={s.body}>{h.address}</Text></Card>
          ))}
          <Text style={s.small}>{t('ambRole.territory.noExclusivity')}</Text>
        </>
      ) : null}
    </AmbassadorShell>
  );
}

const s = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 12 },
  big: { fontSize: 34, fontWeight: '900', color: Colors.Ink },
  kicker: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Faint },
  head: { fontSize: 16.5, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
});
