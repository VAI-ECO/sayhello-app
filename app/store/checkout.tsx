/**
 * CHECKOUT — a shipping address, then POST /store/orders. The server prices the order; nothing is charged
 * here and no points are spent. The order opens on its own screen, where payment is attempted honestly.
 */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { createStoreOrder, type ShipTo } from '../../src/api/store';
import { StoreScreen, PrimaryButton, storeStyles as s } from '../../src/components/store/StoreBits';

const ERRORS: Record<string, string> = {
  shipping_not_set: 'store.shippingNotSet', insufficient_points: 'store.insufficientPoints', line_unavailable: 'store.lineUnavailable',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { shop } = useLocalSearchParams<{ shop?: string }>();
  const [f, setF] = useState({ name: '', line1: '', line2: '', city: '', region: '', postalCode: '', country: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.line1.trim() && f.city.trim() && f.postalCode.trim() && f.country.trim().length === 2;

  const place = async () => {
    setBusy(true); setErr(null);
    const shipTo: ShipTo = {
      name: f.name.trim(), line1: f.line1.trim(), city: f.city.trim(), postalCode: f.postalCode.trim(), country: f.country.trim().toUpperCase(),
      ...(f.line2.trim() ? { line2: f.line2.trim() } : {}), ...(f.region.trim() ? { region: f.region.trim() } : {}), ...(f.phone.trim() ? { phone: f.phone.trim() } : {}),
    };
    const res = await createStoreOrder(shipTo, shop === 'ambassador' ? 'ambassador' : 'member');
    setBusy(false);
    if (res?.data?.order) {
      router.replace({ pathname: '/store/order', params: { id: res.data.order.id, placed: '1' } } as never);
      return;
    }
    const key = res?.error?.code ? ERRORS[res.error.code] : undefined;
    setErr(key ? t(key) : t('store.placeFailed'));
  };

  const field = (k: keyof typeof f, label: string, extra: object = {}) => (
    <View style={{ gap: 4 }} key={k}>
      <Text style={s.label}>{label}</Text>
      <TextInput value={f[k]} onChangeText={set(k)} style={s.input} accessibilityLabel={label} testID={`store-ship-${k}`} {...extra} />
    </View>
  );

  return (
    <StoreScreen title={t('store.shipTo')} testID="store-checkout-screen">
      {field('name', t('store.fieldName'), { autoComplete: 'name' })}
      {field('line1', t('store.fieldLine1'))}
      {field('line2', t('store.fieldLine2'))}
      {field('city', t('store.fieldCity'))}
      {field('region', t('store.fieldRegion'))}
      {field('postalCode', t('store.fieldPostal'))}
      {field('country', t('store.fieldCountry'), { autoCapitalize: 'characters', maxLength: 2 })}
      {field('phone', t('store.fieldPhone'), { keyboardType: 'phone-pad' })}
      {err ? <Text style={s.error} accessibilityRole="alert" testID="store-place-error">{err}</Text> : null}
      <PrimaryButton label={busy ? t('store.placing') : t('store.placeOrder')} disabled={!valid || busy} onPress={place} testID="store-place" />
      <Text style={s.meta}>{t('store.pointsNote')}</Text>
    </StoreScreen>
  );
}
