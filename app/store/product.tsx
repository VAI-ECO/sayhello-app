/**
 * PRODUCT (design RL-01-SN-70): name, price "before your points", option, the buyer's own Waverly colour
 * (all ten identity colours, §34.1), quantity, Add to bag, and "Shipping is never discounted". No points
 * ladder and no gap-to-next-tier here (§4.7); points are applied per item in the bag.
 */
import { useState } from 'react';
import { Image, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { getStoreProduct, putCartItem } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, PrimaryButton, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';

export default function ProductScreen() {
  const router = useRouter();
  const { id, shop } = useLocalSearchParams<{ id: string; shop?: string }>();
  const { state, data, errorCode, retry } = useLoader(async () => getStoreProduct(String(id)));
  const [variantId, setVariantId] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);

  const product = data?.product;
  const variants = product?.variants ?? [];
  const chosen = variantId ?? (variants.length === 1 ? variants[0].id : null);

  const add = async () => {
    if (!chosen) { setNote({ text: t('store.chooseSize'), bad: true }); return; }
    setBusy(true); setNote(null);
    const res = await putCartItem({ variantId: chosen, quantity: qty, waverlyColor: color, pointsPerUnit: 0 });
    setBusy(false);
    setNote(res?.error ? { text: res.error.message, bad: true } : { text: t('store.added'), bad: false });
  };

  return (
    <StoreScreen title={product?.name ?? t('store.title')} testID="store-product">
      {state === 'loading' ? <Loading />
        : errorCode === 'not_found' ? <Text style={s.body}>{t('store.loadFailed')}</Text>
        : state === 'error' || !product ? <ErrorBlock onRetry={retry} />
        : (
          <>
            {(product.photos ?? []).filter((ph) => ph.url).length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} testID="store-product-photos" contentContainerStyle={{ gap: 8 }}>
                {(product.photos ?? []).filter((ph) => ph.url).map((ph, i) => (
                  <Image key={ph.id} source={{ uri: ph.url as string }} resizeMode="cover" accessibilityLabel={`${product.name} ${i + 1}`}
                    style={{ width: 260, height: 220, borderRadius: 12, backgroundColor: Colors.Bone }} testID={`store-product-photo-${ph.id}`} />
                ))}
              </ScrollView>
            ) : (
              <View style={{ height: 180, borderRadius: 12, backgroundColor: Colors.Bone, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s.meta}>{t('store.productPhoto')}</Text>
              </View>
            )}
            {product.description ? <Text style={s.body}>{product.description}</Text> : null}
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.Ink }}>{formatCents(product.priceCents)}</Text>
            <Text style={s.meta}>{t('store.beforePoints')}</Text>

            {variants.length > 1 || (variants.length === 1 && (variants[0].sizeLabel || variants[0].garmentColor)) ? (
              <View style={{ gap: 8 }}>
                <Text style={s.label}>{t('store.size')}</Text>
                <View style={s.chips}>
                  {variants.map((v) => (
                    <TouchableOpacity key={v.id} onPress={() => setVariantId(v.id)} accessibilityRole="button" accessibilityState={{ selected: chosen === v.id }}
                      style={[s.chip, chosen === v.id && s.chipOn]} testID={`store-variant-${v.id}`}>
                      <Text style={s.chipText}>{[v.sizeLabel, v.garmentColor].filter(Boolean).join(' · ')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ gap: 8 }}>
              <Text style={s.label}>{t('store.yourColor')}</Text>
              <View style={s.chips}>
                {(data?.waverlyColors ?? []).map((c) => (
                  <TouchableOpacity key={c} onPress={() => setColor(color === c ? null : c)} accessibilityRole="button" accessibilityLabel={c}
                    accessibilityState={{ selected: color === c }} testID={`store-color-${c}`}
                    style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: color === c ? 3 : 1, borderColor: color === c ? Colors.Ink : Colors.Line }} />
                ))}
              </View>
            </View>

            <View style={[s.row, { justifyContent: 'flex-start' }]}>
              <Text style={s.label}>{t('store.quantity')}</Text>
              <OutlineButton label="−" onPress={() => setQty(Math.max(1, qty - 1))} testID="store-qty-minus" />
              <Text style={s.strong} testID="store-qty">{qty}</Text>
              <OutlineButton label="+" onPress={() => setQty(Math.min(99, qty + 1))} testID="store-qty-plus" />
            </View>

            {variants.length === 0 ? <Text style={s.meta} testID="store-no-options">{t('store.noOptions')}</Text> : null}
            <PrimaryButton label={busy ? '…' : t('store.addToBag')} onPress={add} disabled={busy || variants.length === 0} testID="store-add" />
            {note ? <Text style={note.bad ? s.error : s.meta} accessibilityRole={note.bad ? 'alert' : undefined}>{note.text}</Text> : null}
            <Text style={s.meta}>{t('store.shippingNever')}</Text>
            <OutlineButton label={t('store.bagCta')} onPress={() => router.push({ pathname: '/store/cart', params: { shop } } as never)} testID="store-product-bag" />
          </>
        )}
    </StoreScreen>
  );
}
