/**
 * MY LINKS — CANON-RL-04-SN-08: "One code, as many links as you want. Every link carries the same
 * code." GET /influencer/links. Shown: the code's link and how many signups have come on it.
 *
 * Not built, recorded: per-link taps and `?r=tag` breakdowns (the design's "412 taps · 9 signups")
 * need a link-tracking redirect that does not exist, so taps are not shown and the screen says so.
 * The link host `sayhello.world` is the delivered one; resolving it to the app/store is the website's
 * job (external), not this app's.
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getInfluencerLinks } from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { creatorLinkText, creatorLinkUrl } from '../../src/lib/creator-link';

export default function MyLinksScreen() {
  const router = useRouter();
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getInfluencerLinks();
    return res?.data ? { data: res.data.links } : res && res.error ? { error: res.error } : undefined;
  });
  const link = data ? creatorLinkText(data.code) : null;

  return (
    <InfluencerShell active="links" title={t('influencer.links.title')} subtitle={t('influencer.links.lead')} refreshing={refreshing} onRefresh={onRefresh} testID="creator-links">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="creator-links-loading" />
      ) : state === 'error' || !data || !link ? (
        <Card tone="error" testID="creator-links-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('influencer.links.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="creator-links-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <Card testID="creator-link-card">
            <Text style={styles.link} selectable testID="creator-link">{link}</Text>
            <Text style={styles.body} testID="creator-link-signups">
              {t(data.attributions === 1 ? 'influencer.links.signup' : 'influencer.links.signups', { count: data.attributions })}
            </Text>
            {!data.tapsTracked ? <Text style={styles.small}>{t('influencer.links.tapsNotTracked')}</Text> : (
              <Text style={styles.small} testID="creator-link-taps">
                {t('ambassadorS3.creator.taps', { count: data.tapsRecent ?? 0, days: data.tapsWindowDays ?? 30 })}
                {data.tapsRecentByDestination
                  ? ` · ${t('ambassadorS3.creator.byDestination', data.tapsRecentByDestination)}`
                  : ''}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => { void Share.share({ message: creatorLinkUrl(data.code) }).catch(() => undefined); }}
              accessibilityRole="button"
              style={styles.outline}
              testID="creator-link-share"
            >
              <Text style={styles.outlineText}>{t('influencer.links.share')}</Text>
            </TouchableOpacity>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{t('influencer.links.codeMattersTitle')}</Text>
            <Text style={styles.body}>{t('influencer.links.codeMattersBody')}</Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{t('influencer.links.sayCodeTitle')}</Text>
            <Text style={styles.body}>{t('influencer.links.sayCodeBody')}</Text>
          </Card>
          <Text style={styles.small}>{t('influencer.common.creditNotCoupon')}</Text>
        </>
      )}
      {state === 'error' ? (
        <TouchableOpacity onPress={() => router.push('/(influencer)/pick-code')} accessibilityRole="button" testID="creator-links-pick">
          <Text style={styles.linkText}>{t('influencer.links.noCode')}</Text>
        </TouchableOpacity>
      ) : null}
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  link: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  linkText: { fontSize: 15.5, fontWeight: '700', color: Colors.HelloBlue },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 6 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
