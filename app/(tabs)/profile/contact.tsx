/**
 * GET IN TOUCH (Settings → The small print; CANON-00-SN-14; RULES §36.4, §10.11)
 *
 * The company's postal and email contact, published in the app verbatim (Guideline 1.2). The selfie
 * takedown route is stated as the rules have it: a written request, handled by a person out of band —
 * there is deliberately no button for it. "Report something instead" sends the person to their
 * Connections, where each entry carries its own Report.
 */
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';

export default function ContactScreen() {
  const router = useRouter();
  return (
    <SubScreen title={t('s2c.contact.title')}>
      <Text style={subStyles.intro}>{t('s2c.contact.intro')}</Text>
      <View style={subStyles.card}>
        <Text style={[subStyles.rowLabel, { paddingTop: 14 }]}>{t('s2c.contact.company')}</Text>
        <Text style={subStyles.rowHint}>{t('s2c.contact.addressLine1')}</Text>
        <Text style={subStyles.rowHint}>{t('s2c.contact.addressLine2')}</Text>
        <Text style={[subStyles.rowHint, { paddingBottom: 14 }]}>{t('s2c.contact.country')}</Text>
      </View>
      <View style={subStyles.card}>
        <Text style={[subStyles.rowHint, { paddingTop: 14 }]}>{t('s2c.contact.emailLabel')}</Text>
        <TouchableOpacity
          onPress={() => void Linking.openURL(`mailto:${t('s2c.contact.email')}`).catch(() => undefined)}
          accessibilityRole="link"
          testID="contact-email"
        >
          <Text style={[subStyles.rowLabel, { textDecorationLine: 'underline' }]}>{t('s2c.contact.email')}</Text>
        </TouchableOpacity>
        <Text style={[subStyles.rowHint, { paddingBottom: 14 }]}>{t('s2c.contact.emailHint')}</Text>
      </View>
      {(['selfie', 'urgent'] as const).map(k => (
        <View key={k} style={subStyles.card}>
          <Text style={[subStyles.rowLabel, { paddingTop: 14 }]}>{t(`s2c.contact.${k}Title`)}</Text>
          <Text style={[subStyles.rowHint, { paddingBottom: 14 }]}>{t(`s2c.contact.${k}Body`)}</Text>
        </View>
      ))}
      <TouchableOpacity style={subStyles.secondary} onPress={() => router.push('/(tabs)/hellos')} accessibilityRole="button" testID="contact-report">
        <Text style={subStyles.secondaryText}>{t('s2c.contact.reportInstead')}</Text>
      </TouchableOpacity>
    </SubScreen>
  );
}
