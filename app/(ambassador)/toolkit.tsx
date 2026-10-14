/**
 * TOOLKIT — CANON-RL-03-SN-29 ("Everything you need at the door"). Printed material carries no figures: every rate is
 * admin-adjustable, so nothing in the kit has a price or a rate on it. Two tiles lead somewhere that exists: "Your QR,
 * printable" opens My code; "Order printed stock" opens the stand request (S3 wave 2). The window sticker, table card,
 * "What to say" page and the Hello Hangout hand-over need print files and approved copy that have not been supplied, so
 * they are named as not ready rather than shown as tiles that go nowhere.
 */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';

export default function ToolkitScreen() {
  const router = useRouter();
  const tile = (title: string, body: string, href: string, id: string) => (
    <TouchableOpacity onPress={() => router.push(href as never)} accessibilityRole="button" accessibilityLabel={title} testID={id}>
      <Card><Text style={s.head}>{title}</Text><Text style={s.body}>{body}</Text></Card>
    </TouchableOpacity>
  );
  return (
    <AmbassadorShell active="toolkit" title={t('ambRole.toolkit.title')} subtitle={t('ambRole.toolkit.lead')} onBack={() => router.back()} testID="ambassador-toolkit">
      <View style={{ gap: 12 }}>
        {tile(t('ambRole.toolkit.qr'), t('ambRole.toolkit.qrBody'), '/(ambassador)/my-code', 'toolkit-qr')}
        {tile(t('ambRole.toolkit.order'), t('ambRole.toolkit.orderBody'), '/(ambassador)/stands', 'toolkit-order')}
        <Card testID="toolkit-not-ready"><Text style={s.head}>{t('ambRole.toolkit.notReadyTitle')}</Text><Text style={s.body}>{t('ambRole.toolkit.notReadyBody')}</Text></Card>
        <Text style={s.small}>{t('ambRole.toolkit.noFigures')}</Text>
      </View>
    </AmbassadorShell>
  );
}

const s = StyleSheet.create({
  head: { fontSize: 16.5, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
});
