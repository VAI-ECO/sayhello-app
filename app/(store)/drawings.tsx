/**
 * DRAWINGS — status and freeze views only (design RL-01-SN-68; RULES §5, §4.9). Rows are what an admin has
 * published: with none, "Nothing is scheduled yet." No cadence, no prize, no amount, no entries-in-the-next-
 * drawing (§5.2, §5.3, §5.11, §5.12). The winner engine is deferred (§5.8) and nothing here suggests it runs.
 * A freeze is the reset: this account's entries at that moment are shown as the record, and nobody loses anything.
 */
import { Linking, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { useLoader } from '../../src/lib/use-loader';
import { getDrawings } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';
import { dayMonth } from '../../src/lib/ambassador-format';

export default function DrawingsScreen() {
  const router = useRouter();
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => getDrawings());
  return (
    <StoreScreen title={t('drawings.title')} refreshing={refreshing} onRefresh={onRefresh} testID="drawings-screen">
      {state === 'loading' ? <Loading />
        : state === 'error' || !data ? <ErrorBlock message={t('drawings.loadFailed')} onRetry={retry} />
        : (
          <>
            {data.plans.length === 0 ? (
              <View style={s.card} testID="drawings-none">
                <Text style={s.strong}>{t('drawings.nothingTitle')}</Text>
                <Text style={s.body}>{t('drawings.nothingBody')}</Text>
              </View>
            ) : data.plans.map((p) => (
              <View key={p.id} style={[s.card, p.status === 'planned' && { borderStyle: 'dashed' }]} testID={`drawing-plan-${p.id}`}>
                <Text style={s.label}>{p.status === 'planned' ? t('drawings.planned') : t('drawings.fundedAndDated')}</Text>
                <Text style={s.strong}>{p.title}</Text>
                {p.summary ? <Text style={s.body}>{p.summary}</Text> : null}
                {p.datedFor ? <Text style={s.meta}>{t('drawings.datedFor', { date: dayMonth(p.datedFor) })}</Text> : null}
                {p.rulesUrl ? <OutlineButton label={t('drawings.rules')} onPress={() => { void Linking.openURL(p.rulesUrl as string); }} /> : null}
              </View>
            ))}

            {data.freezes.length > 0 ? (
              <View style={{ gap: 10 }} testID="drawings-freezes">
                <Text style={s.label}>{t('drawings.freezesTitle')}</Text>
                {data.freezes.map((f) => (
                  <View key={f.id} style={s.card}>
                    {f.frozenAt ? <Text style={s.strong}>{t('drawings.frozenOn', { date: dayMonth(f.frozenAt) })}</Text> : null}
                    <Text style={s.body}>{f.yourEntries === null ? t('drawings.notOnNumber') : t('drawings.yourEntries', { count: f.yourEntries })}</Text>
                  </View>
                ))}
                <Text style={s.meta}>{t('drawings.freezeNote')}</Text>
              </View>
            ) : null}

            <View style={s.card}>
              <Text style={s.strong}>{t('drawings.meanwhile')}</Text>
              <Text style={s.body}>{t('drawings.meanwhileBody')}</Text>
              <OutlineButton label={t('store.toStore')} onPress={() => router.push('/(store)' as never)} testID="drawings-to-store" />
            </View>
            <Text style={s.meta}>{t('drawings.noPurchase')}</Text>
          </>
        )}
    </StoreScreen>
  );
}
