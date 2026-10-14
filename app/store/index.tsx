/**
 * WAVERLY'S PLACE (member) / AMBASSADOR SHOP (?shop=ambassador) — catalog index. Design RL-01-SN-90 / SN-93.
 * Categories and products are admin rows (API /store/*): nothing is hardcoded, and an empty catalog says
 * "No items yet". The balance sits beside the "anything you spend comes off that number" line; no price on a
 * category row and no gap to a next tier anywhere (RULES §4.7). The Ambassador Shop never shows points (§4.12).
 */
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { useLoader } from '../../src/lib/use-loader';
import { usePointsBalance } from '../../src/lib/use-points-balance';
import { formatCents } from '../../src/lib/money-format';
import { getStoreCategories, getStoreProducts, type Shop } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';

export default function StoreIndex() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shop?: string }>();
  const shop: Shop = params.shop === 'ambassador' ? 'ambassador' : 'member';
  const [category, setCategory] = useState<string | undefined>(undefined);
  const balance = usePointsBalance();

  const cats = useLoader(async () => getStoreCategories());
  const prods = useLoader(async () => getStoreProducts(shop, category));
  useEffect(() => { void prods.reload(); }, [category]); // eslint-disable-line react-hooks/exhaustive-deps
  const reload = () => { cats.retry(); prods.retry(); };
  const roots = (cats.data?.categories ?? []).filter((c) => c.parentId === null);
  const subs = (cats.data?.categories ?? []).filter((c) => c.parentId === category);
  const locked = shop === 'ambassador' && (prods.errorCode === 'forbidden' || cats.errorCode === 'forbidden');
  const unavailable = prods.errorCode === 'store_unavailable' || cats.errorCode === 'store_unavailable';

  return (
    <StoreScreen title={shop === 'ambassador' ? t('ambassador.store.title') : t('store.title')} refreshing={prods.refreshing} onRefresh={() => { cats.onRefresh(); prods.onRefresh(); }} testID="store-index">
      {locked ? null : shop === 'ambassador' ? (
        <>
          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.Ink }}>{t('store.ambassadorHeadline')}</Text>
          <Text style={s.body}>{t('store.ambassadorBody')}</Text>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.Ink }}>{t('store.headline')}</Text>
          <View style={s.card} testID="store-balance">
            <Text style={{ fontSize: 34, fontWeight: '800', color: Colors.Ink }}>{balance === null ? '—' : balance}</Text>
            <Text style={s.meta}>{t('store.onYourNumber')}</Text>
            <Text style={s.body}>{t('store.spendNote')}</Text>
          </View>
        </>
      )}

      {locked ? null : <View style={s.row}>
        <OutlineButton label={t('store.bagCta')} onPress={() => router.push({ pathname: '/store/cart', params: { shop } } as never)} testID="store-open-bag" />
        <OutlineButton label={t('store.toOrders')} onPress={() => router.push({ pathname: '/store/orders', params: { shop } } as never)} testID="store-open-orders" />
      </View>}

      {prods.state === 'loading' || cats.state === 'loading' ? <Loading />
        : locked ? (
          // RL-03-SN-18 "Ambassador Shop — locked": approved copy, verbatim. The lock is the recruitment.
          <View style={{ gap: 12 }} testID="store-ambassador-locked">
            <Text style={s.meta}>{t('shopLocked.supply')} · {t('shopLocked.locked')}</Text>
            <Text style={s.meta}>{t('shopLocked.tabs')}</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.Ink }}>{t('shopLocked.headline')}</Text>
            <Text style={s.body}>{t('shopLocked.body1')}</Text>
            <Text style={s.body}>{t('shopLocked.body2')}</Text>
            <Text style={s.body}>{t('shopLocked.body3')}</Text>
            <Text style={s.meta}>{t('shopLocked.behind')}</Text>
            <Text style={s.body}>{t('shopLocked.behindBody')}</Text>
            <Text style={s.body}>{t('shopLocked.issued')}</Text>
            <View style={s.card}><Text style={s.body}>{t('shopLocked.polo')}</Text><Text style={s.meta}>{t('shopLocked.issuedNotSale')}</Text></View>
            <View style={s.card}><Text style={s.body}>{t('shopLocked.jacket')}</Text><Text style={s.meta}>{t('shopLocked.issuedNotSale')}</Text></View>
            <Text style={s.meta}>{t('shopLocked.howTitle')}</Text>
            <OutlineButton label={t('shopLocked.cta')} onPress={() => router.push('/ambassador' as never)} testID="store-locked-become-ambassador" />
            <Text style={s.body}>{t('shopLocked.reviewed')}</Text>
          </View>
        )
        : unavailable ? <Text style={s.body} testID="store-unavailable">{t('store.unavailable')}</Text>
        : prods.state === 'error' || cats.state === 'error' ? <ErrorBlock onRetry={reload} />
        : (
          <>
            {roots.length > 0 ? (
              <View style={s.chips} testID="store-categories">
                <TouchableOpacity onPress={() => setCategory(undefined)} style={[s.chip, category === undefined && s.chipOn]} accessibilityRole="button" testID="store-cat-all">
                  <Text style={s.chipText}>{t('store.all')}</Text>
                </TouchableOpacity>
                {roots.map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => setCategory(c.id)} style={[s.chip, category === c.id && s.chipOn]} accessibilityRole="button" testID={`store-cat-${c.id}`}>
                    <Text style={s.chipText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {subs.length > 0 ? (
              <View style={s.chips}>
                {subs.map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => setCategory(c.id)} style={s.chip} accessibilityRole="button"><Text style={s.chipText}>{c.name}</Text></TouchableOpacity>
                ))}
              </View>
            ) : null}
            {(prods.data?.products ?? []).length === 0 ? (
              <View style={s.card} testID="store-empty">
                <Text style={s.strong}>{t('store.emptyTitle')}</Text>
                <Text style={s.body}>{t('store.emptyBody')}</Text>
              </View>
            ) : (
              (prods.data?.products ?? []).map((p) => (
                <TouchableOpacity key={p.id} accessibilityRole="button" style={s.card} testID={`store-product-${p.id}`}
                  onPress={() => router.push({ pathname: '/store/product', params: { id: p.id, shop } } as never)}>
                  <Text style={s.strong}>{p.name}</Text>
                  {p.description ? <Text style={s.meta}>{p.description}</Text> : null}
                  <Text style={s.strong}>{formatCents(p.priceCents)}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
    </StoreScreen>
  );
}
