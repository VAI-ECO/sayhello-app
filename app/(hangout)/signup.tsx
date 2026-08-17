/**
 * H8 SIGNUP AND TIER — no backend
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';

export default function HangoutSignupScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('hangout.signup.title')}</Text>

        <View style={styles.foundingCard}>
          <View style={styles.foundingHeader}>
            <View style={styles.foundingDot} />
            <Text style={styles.foundingLabel}>{t('hangout.common.foundingHelloHangout')}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{t('figures.foundingPrice')}</Text>
            <Text style={styles.perYear}>{t('hangout.common.perYear')}</Text>
          </View>
          <Bullet text={t('hangout.common.lockFiveYears')} />
          <Bullet text={t('hangout.common.goldenIcon')} />
          <Bullet text={t('hangout.common.everythingRegular')} />
          <Button title={t('hangout.common.chooseFounding')} onPress={() => {}} disabled testID="choose-founding" />
        </View>

        <View style={styles.regularCard}>
          <Text style={styles.regularLabel}>{t('hangout.common.regular')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.regularPrice}>{t('figures.regularPrice')}</Text>
            <Text style={styles.perYear}>{t('hangout.common.perYear')}</Text>
          </View>
          <Button
            title={t('hangout.common.chooseRegular')}
            onPress={() => {}}
            disabled
            variant="secondary"
            testID="choose-regular"
          />
        </View>

        <View style={styles.deferredBox}>
          <Text style={styles.deferredTitle}>{t('hangout.common.nothingDue')}</Text>
          <Text style={styles.deferredBody}>{t('hangout.common.billingNote')}</Text>
        </View>

        <Text style={styles.unavailable} testID="hangout-signup-unavailable">
          {t('hangout.signup.unavailable')}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>·</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.Ink, lineHeight: 30 },
  foundingCard: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 8, overflow: 'hidden' },
  foundingHeader: {
    backgroundColor: Colors.Ink,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  foundingDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.Amber },
  foundingLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Chalk,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 15, paddingTop: 12 },
  price: { fontSize: 38, fontWeight: '900', color: Colors.Ink },
  regularPrice: { fontSize: 30, fontWeight: '900', color: Colors.Ink },
  perYear: { fontSize: 15, fontWeight: '600', color: Colors.Muted },
  bulletRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 15 },
  bulletDot: { fontSize: 16, fontWeight: '900', color: Colors.Ink },
  bulletText: { flex: 1, fontSize: 14, color: Colors.Ink },
  regularCard: {
    borderWidth: 1.5,
    borderColor: Colors.Line,
    borderRadius: 8,
    padding: 15,
    gap: 10,
  },
  regularLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  deferredBox: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 8, padding: 14, gap: 4 },
  deferredTitle: { fontSize: 16, fontWeight: '900', color: Colors.Ink },
  deferredBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
});
