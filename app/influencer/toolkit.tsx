/**
 * INFLUENCER TOOLKIT — CANON-RL-04-SN-05: "Everything you are allowed to say, and the things you
 * are not." Built: your link and code, drawn as a QR (local encoding — the link is never sent to a QR
 * service). NOT built, and said plainly: a downloadable QR for print, and the do-not-say list — it is
 * not written and is MA-05 gated (ROLE-4 §6/§8), so nothing is invented. "Approved lines" from the
 * design are not shown for the same reason: they are drawn, not cleared.
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getInfluencerLinks } from '../../src/api/influencer';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { ScannableCode } from '../../src/components/qr-code';
import { useLoader } from '../../src/lib/use-loader';
import { creatorLinkText, creatorLinkUrl } from '../../src/lib/creator-link';

export default function InfluencerToolkitScreen() {
  const { state, data, errorCode, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getInfluencerLinks();
    return res?.data ? { data: res.data.links } : res && res.error ? { error: res.error } : undefined;
  });
  const url = data ? creatorLinkUrl(data.code) : null;

  return (
    <InfluencerShell active="toolkit" title={t('influencer.toolkit.title')} subtitle={t('influencer.toolkit.lead')} refreshing={refreshing} onRefresh={onRefresh} testID="creator-toolkit">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="creator-toolkit-loading" />
      ) : state === 'error' || !data || !url ? (
        <Card tone="error" testID="creator-toolkit-error">
          <Text accessibilityRole="alert" style={styles.body}>{errorCode === 'forbidden' ? t('influencer.links.noCode') : t('influencer.toolkit.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="creator-toolkit-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <Card testID="creator-toolkit-link">
            <Text style={styles.cardTitle}>{t('influencer.toolkit.linkTitle')}</Text>
            <Text style={styles.link} selectable>{creatorLinkText(data.code)}</Text>
            <View style={styles.qr}>
              <ScannableCode value={url} size={180} label={t('influencer.toolkit.qrLabel')} fallback={t('influencer.toolkit.qrFailed')} />
            </View>
            <Text style={styles.body}>{t('influencer.toolkit.linkBody')}</Text>
          </Card>
          <Card testID="creator-do-not-say">
            <Text style={styles.cardTitle}>{t('influencer.toolkit.doNotSayTitle')}</Text>
            <Text style={styles.body}>{t('influencer.toolkit.doNotSayBody')}</Text>
          </Card>
          <Card testID="creator-toolkit-not-ready">
            <Text style={styles.cardTitle}>{t('influencer.toolkit.notReadyTitle')}</Text>
            <Text style={styles.body}>{t('influencer.toolkit.notReadyBody')}</Text>
          </Card>
          <Text style={styles.small}>{t('figures.ma05Disclaimer')}</Text>
        </>
      )}
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint, textAlign: 'center' },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  link: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  qr: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', marginVertical: 6 },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
