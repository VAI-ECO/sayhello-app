/**
 * THE BAG. Points are spent PER ITEM: each line may carry one spend amount per unit, and the server turns it
 * into a discount (never above the per-item cap, never on shipping). Spend-now framing only — the options
 * are amounts to spend, never a ladder or a gap to the next tier (§4.7). Points come off only when the order
 * is paid (§4.15); the line below says so. The Ambassador Shop has no points (§4.12).
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { getCart, putCartItem, removeCartItem, type CartLine } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, PrimaryButton, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';

export default function CartScreen() {
  const router = useRouter();
  const { shop } = useLocalSearchParams<{ shop?: string }>();
  const ambassador = shop === 'ambassador';
  const { state, data, errorCode, retry, reload, refreshing, onRefresh } = useLoader(async () => getCart());
  const [err, setErr] = useState<string | null>(null);

  const setSpend = async (line: CartLine, pointsPerUnit: number) => {
    setErr(null);
    const res = await putCartItem({ variantId: line.variantId, quantity: line.quantity, waverlyColor: line.waverlyColor, pointsPerUnit });
    if (res?.error) setErr(res.error.message);
    await reload();
  };
  const remove = async (id: string) => { setErr(null); const r = await removeCartItem(id); if (r?.error) setErr(r.error.message); await reload(); };

  const cart = data;
  const canCheckout = !!cart && cart.lines.length > 0 && cart.checkout.shippingConfigured;

  return (
    <StoreScreen title={t('store.bag')} refreshing={refreshing} onRefresh={onRefresh} testID="store-cart">
      {state === 'loading' ? <Loading />
        : errorCode === 'store_unavailable' ? <Text style={s.body}>{t('store.unavailable')}</Text>
        : state === 'error' || !cart ? <ErrorBlock onRetry={retry} />
        : (
          <>
            {cart.lines.length === 0 ? <Text style={s.body} testID="store-cart-empty">{t('store.bagEmpty')}</Text> : null}
            {cart.unavailableLines.map((u) => (
              <View key={u.id} style={s.card}>
                <Text style={s.error}>{t('store.unavailableLine', { name: u.productName })}</Text>
                <OutlineButton label={t('store.remove')} onPress={() => remove(u.id)} />
              </View>
            ))}
            {cart.lines.map((l) => {
              const others = cart.pointsInCart - l.pointsPerUnit * l.quantity;
              const room = cart.balance - others;
              return (
                <View key={l.id} style={s.card} testID={`store-line-${l.id}`}>
                  <Text style={s.strong}>{l.productName}</Text>
                  <Text style={s.meta}>{[l.sizeLabel, l.garmentColor].filter(Boolean).join(' · ')}</Text>
                  <View style={s.row}>
                    <Text style={s.meta}>{t('store.lineMeta', { quantity: l.quantity })}</Text>
                    <Text style={s.strong}>{formatCents(l.unitPriceCents * l.quantity)}</Text>
                  </View>
                  {!ambassador ? (
                    <View style={{ gap: 6 }}>
                      <Text style={s.label}>{t('store.spendOnItem')}</Text>
                      <View style={s.chips}>
                        <TouchableOpacity onPress={() => setSpend(l, 0)} accessibilityRole="button" style={[s.chip, l.pointsPerUnit === 0 && s.chipOn]} testID={`store-spend-none-${l.id}`}>
                          <Text style={s.chipText}>{t('store.spendNone')}</Text>
                        </TouchableOpacity>
                        {cart.spendOptions.map((p) => {
                          const disabled = p * l.quantity > room && l.pointsPerUnit !== p;
                          return (
                            <TouchableOpacity key={p} disabled={disabled} onPress={() => setSpend(l, p)} accessibilityRole="button"
                              accessibilityState={{ disabled, selected: l.pointsPerUnit === p }}
                              style={[s.chip, l.pointsPerUnit === p && s.chipOn, disabled && { opacity: 0.4 }]} testID={`store-spend-${p}-${l.id}`}>
                              <Text style={s.chipText}>{t('store.spendOption', { points: p })}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                  <OutlineButton label={t('store.remove')} onPress={() => remove(l.id)} testID={`store-remove-${l.id}`} />
                </View>
              );
            })}
            {cart.lines.length > 0 ? (
              <View style={s.card} testID="store-totals">
                <View style={s.row}><Text style={s.body}>{t('store.items')}</Text><Text style={s.strong}>{formatCents(cart.itemsCents)}</Text></View>
                <View style={s.row}><Text style={s.body}>{t('store.shipping')}</Text><Text style={s.strong}>{cart.shippingCents === null ? t('store.shippingUnset') : formatCents(cart.shippingCents)}</Text></View>
                {!ambassador && cart.pointsInCart > 0 ? <View style={s.row}><Text style={s.body}>{t('store.pointsSpent')}</Text><Text style={s.strong}>{cart.pointsInCart}</Text></View> : null}
                <Text style={s.meta}>{t('store.shippingNever')}</Text>
                {!ambassador ? <Text style={s.meta}>{t('store.pointsNote')}</Text> : <Text style={s.meta}>{t('store.ambassadorNoPoints')}</Text>}
              </View>
            ) : null}
            {err ? <Text style={s.error} accessibilityRole="alert">{err}</Text> : null}
            {cart.lines.length > 0 && !cart.checkout.shippingConfigured ? <Text style={s.error} testID="store-shipping-unset">{t('store.shippingNotSet')}</Text> : null}
            <PrimaryButton label={t('store.checkout')} disabled={!canCheckout} onPress={() => router.push({ pathname: '/store/checkout', params: { shop } } as never)} testID="store-checkout" />
          </>
        )}
    </StoreScreen>
  );
}
