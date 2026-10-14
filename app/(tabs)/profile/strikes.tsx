/**
 * STRIKES ON YOUR ACCOUNT (Settings → Your account; NEW-ONB-11; RULES §35.3, §35.13-35.17, §35.22)
 *
 * The person's own count, shown plainly. GET /safety/strikes returns only the count, the rolling term and
 * the newest strike's date and room — never the reason, the report or the reporter, and this screen never
 * asks for them. One count across private chats and Hootza comments. Nothing here is automatic: a strike
 * is a person's written decision and the threshold goes to a human. No figure is printed from this file;
 * the count comes from the server.
 */
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import { getMyStrikes, type MyStrikes } from '../../../src/api/account';

function plainDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

export default function StrikesScreen() {
  const router = useRouter();
  const loader = useLoader<MyStrikes>(getMyStrikes);
  const s = loader.data;
  return (
    <SubScreen title={t('s2c.strikes.title')} state={loader.state} onRetry={loader.retry}>
      <Text style={subStyles.intro}>{t('s2c.strikes.intro')}</Text>
      <View style={[subStyles.card, { paddingVertical: 16 }]} testID="strikes-count-card">
        <Text style={subStyles.rowHint}>{t('s2c.strikes.heading')}</Text>
        <Text style={{ fontSize: 44, fontWeight: '800', color: Colors.Ink }} testID="strikes-count">{s ? s.active : ''}</Text>
        <Text style={subStyles.rowHint}>{t('s2c.strikes.onYourAccount')}</Text>
        {s && s.active === 0 ? <Text style={[subStyles.rowLabel, { marginTop: 10 }]}>{t('s2c.strikes.none')}</Text> : null}
        {s && s.latest ? (
          <Text style={[subStyles.note, { marginTop: 10 }]}>
            {t(s.latest.surface === 'hootza_comment' || s.latest.surface === 'hootza_chat' ? 's2c.strikes.latestHootza' : 's2c.strikes.latestChat', { date: plainDate(s.latest.issuedAt) })}
          </Text>
        ) : null}
      </View>
      {(['oneCount', 'nothingAuto', 'notSeen'] as const).map(k => (
        <View key={k} style={subStyles.card}>
          <Text style={[subStyles.rowLabel, { paddingTop: 12 }]}>{t(`s2c.strikes.${k}Title`)}</Text>
          <Text style={[subStyles.rowHint, { paddingBottom: 12 }]}>{t(`s2c.strikes.${k}Body`)}</Text>
        </View>
      ))}
      <TouchableOpacity style={subStyles.secondary} onPress={() => router.push('/(tabs)/profile/contact' as never)} accessibilityRole="button" testID="strikes-contact">
        <Text style={subStyles.secondaryText}>{t('s2c.strikes.contact')}</Text>
      </TouchableOpacity>
    </SubScreen>
  );
}
