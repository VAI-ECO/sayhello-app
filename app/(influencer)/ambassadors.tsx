/**
 * AMBASSADORS — CANON-RL-04-SN-07 "Ambassadors — empty" (and the filled list).
 *
 * "Ambassadors who came through your channel" — never "your Ambassadors", "recruited", "your team"
 * or "your downline", and never next to a payment figure (§7.11). One level only, no hierarchy
 * (Sub-Ambassadors were retired 2026-08-22, §2.11). GET /influencer/ambassadors returns only a first
 * name + last initial and how many Hello Hangouts each has originated — nothing else about them.
 * The empty state is calm: nothing is late and there is nothing to chase.
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getChannelAmbassadors, type ChannelAmbassador } from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';

export default function ChannelAmbassadorsScreen() {
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getChannelAmbassadors();
    return res?.data ? { data: res.data } : res && res.error ? { error: res.error } : undefined;
  });

  return (
    <InfluencerShell active="ambassadors" title={t('influencer.ambassadors.title')} subtitle={t('influencer.ambassadors.lead')} refreshing={refreshing} onRefresh={onRefresh} testID="creator-ambassadors">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="creator-ambassadors-loading" />
      ) : state === 'error' || !data ? (
        <Card tone="error" testID="creator-ambassadors-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('influencer.ambassadors.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="creator-ambassadors-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : data.available === false ? (
        <Card testID="creator-ambassadors-unavailable"><Text style={styles.body}>{t('influencer.ambassadors.unavailable')}</Text></Card>
      ) : data.ambassadors.length === 0 ? (
        <View style={{ gap: 14 }} testID="creator-ambassadors-empty">
          <Text style={styles.emptyTitle}>{t('influencer.ambassadors.emptyTitle')}</Text>
          <Text style={styles.body}>{t('influencer.ambassadors.emptyBody')}</Text>
          <Card>
            <Text style={styles.cardTitle}>{t('influencer.ambassadors.landsTitle')}</Text>
            <Text style={styles.body}>{t('influencer.ambassadors.landsBody')}</Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{t('influencer.ambassadors.earnTitle')}</Text>
            <Text style={styles.body}>{t('influencer.ambassadors.earnBody')}</Text>
          </Card>
          <Text style={styles.small}>{t('figures.ma05Disclaimer')}</Text>
        </View>
      ) : (
        <View style={styles.list} testID="creator-ambassadors-list">
          {data.ambassadors.map((a: ChannelAmbassador, index) => (
            <View key={a.id} style={[styles.row, index > 0 && styles.rowBorder]} testID={`creator-ambassador-${a.id}`}>
              <Text style={styles.venue}>{t('influencer.ambassadors.came', { name: a.name })}</Text>
              <Text style={styles.detail}>
                {a.helloHangouts === 1 ? t('influencer.ambassadors.originatedOne') : t('influencer.ambassadors.originated', { count: a.helloHangouts })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  emptyTitle: { fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.6, color: Colors.Ink },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, overflow: 'hidden' },
  row: { padding: 16, gap: 3 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0EDE9' },
  venue: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  detail: { fontSize: 14, color: Colors.Muted },
});
