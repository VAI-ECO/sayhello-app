/**
 * H8 SIGNUP — one price; founding/deferred are coupons (MONEY Part 2).
 * WIRE: POST /hello-hangouts. Checkout amount from server. PIXEL is P11.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { createHelloHangout, type HangoutTier } from '../../src/api/hangouts';
import { formatCents } from '../../src/lib/money-format';

export default function HangoutSignupScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [priced, setPriced] = useState<string | null>(null);

  const create = async (tier: HangoutTier) => {
    const n = name.trim();
    const a = address.trim();
    if (!n || !a) {
      setError('Name and address are required.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await createHelloHangout({
      name: n,
      address: a,
      lat: 0,
      lng: 0,
      tier,
    });
    setBusy(false);
    if (result?.error) {
      setError(result.error.message);
      return;
    }
    setCreatedId(result?.data?.helloHangout?.id ?? null);
    const p = result?.data?.pricing;
    if (p) {
      if (tier === 'founding') {
        setPriced(
          t('figures.foundingCoupon', {
            off: formatCents(p.couponOffCents),
            due: formatCents(p.priceCents),
          })
        );
      } else if (tier === 'deferred_converted') {
        setPriced(
          t('figures.deferredCoupon', {
            off: formatCents(p.couponOffCents),
            due: formatCents(p.priceCents),
          })
        );
      } else {
        setPriced(t('figures.regularPrice', { amount: formatCents(p.priceCents) }));
      }
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('hangout.signup.title')}</Text>
        <Text style={styles.law}>{t('figures.onePriceLaw')}</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Business name"
          placeholderTextColor={Colors.Muted}
          testID="hangout-name"
        />
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          placeholderTextColor={Colors.Muted}
          testID="hangout-address"
        />

        <View style={styles.foundingCard}>
          <View style={styles.foundingHeader}>
            <View style={styles.foundingDot} />
            <Text style={styles.foundingLabel}>{t('hangout.common.foundingHelloHangout')}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.perYear}>{t('hangout.common.perYear')}</Text>
          </View>
          <Text style={styles.couponLine}>{t('hangout.common.nothingDue')}</Text>
          <Bullet text={t('hangout.common.lockFiveYears')} />
          <Bullet text={t('hangout.common.goldenIcon')} />
          <Bullet text={t('hangout.common.everythingRegular')} />
          <Button
            title={t('hangout.common.chooseFounding')}
            onPress={() => create('founding')}
            disabled={busy}
            testID="choose-founding"
          />
        </View>

        <View style={styles.regularCard}>
          <Text style={styles.regularLabel}>{t('hangout.common.regular')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.perYear}>{t('hangout.common.perYear')}</Text>
          </View>
          <Button
            title={t('hangout.common.chooseRegular')}
            onPress={() => create('regular')}
            disabled={busy}
            variant="secondary"
            testID="choose-regular"
          />
        </View>

        <View style={styles.deferredBox}>
          <Text style={styles.deferredTitle}>{t('hangout.common.nothingDue')}</Text>
          <Text style={styles.deferredBody}>{t('hangout.common.billingNote')}</Text>
          <Button
            title="Apply deferred coupon"
            onPress={() => create('deferred_converted')}
            disabled={busy}
            variant="secondary"
            testID="choose-deferred"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {priced ? (
          <Text style={styles.priced} testID="hangout-priced">
            {priced}
          </Text>
        ) : null}
        {createdId ? (
          <Text style={styles.priced} testID="hangout-created">
            Created {createdId}
          </Text>
        ) : null}
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
  law: { fontSize: 14, color: Colors.Muted, lineHeight: 20 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.Ink,
  },
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
  couponLine: {
    paddingHorizontal: 15,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.Ink,
  },
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
  regularLabel: { fontSize: 14, fontWeight: '800', color: Colors.Ink },
  deferredBox: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 8,
    padding: 15,
    gap: 8,
  },
  deferredTitle: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  deferredBody: { fontSize: 14, color: Colors.Muted, lineHeight: 20 },
  error: { fontSize: 14, color: Colors.SignalRed },
  priced: { fontSize: 14, fontWeight: '600', color: Colors.Ink },
});
