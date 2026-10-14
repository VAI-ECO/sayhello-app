/**
 * ONE ORDER — status, lines, totals, tracking. An open order can be paid or cancelled. Paying is honest:
 * the app has no payment sheet and the server answers 503 `payments_not_configured` until a real provider
 * is wired, so nothing here ever claims money moved. Cancelling an open order spends no points (§4.15).
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { t } from '../../src/i18n';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { getStoreOrder, payStoreOrder, cancelStoreOrder } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, PrimaryButton, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';

export default function OrderScreen() {
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const { state, data, errorCode, retry, reload, refreshing, onRefresh } = useLoader(async () => getStoreOrder(String(id)));
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const order = data?.order;

  const pay = async () => {
    setBusy(true); setNote(null);
    const res = await payStoreOrder(String(id));
    setBusy(false);
    if (res?.error) {
      setNote({ text: res.error.code === 'payments_not_configured' ? t('store.paymentsNotConnected') : res.error.message, bad: true });
      return;
    }
    // A real provider answered, but this build has no payment screen to take the card: say so, claim nothing.
    setNote({ text: t('store.payNoSheet'), bad: true });
  };
  const cancel = async () => {
    setBusy(true); setNote(null);
    const res = await cancelStoreOrder(String(id));
    setBusy(false);
    if (res?.error) { setNote({ text: t('store.cancelFailed'), bad: true }); return; }
    setNote({ text: t('store.cancelled'), bad: false });
    await reload();
  };

  return (
    <StoreScreen title={t('store.order')} refreshing={refreshing} onRefresh={onRefresh} testID="store-order-screen">
      {state === 'loading' ? <Loading />
        : errorCode === 'not_found' ? <Text style={s.body}>{t('store.loadFailed')}</Text>
        : state === 'error' || !order ? <ErrorBlock onRetry={retry} />
        : (
          <>
            <Text style={s.strong} testID="store-order-status">{t(`store.status.${order.status}`)}</Text>
            {placed === '1' && order.status === 'pending_payment' ? <Text style={s.body}>{t('store.orderSaved')}</Text> : null}
            {(order.items ?? []).map((i, n) => (
              <View key={n} style={s.row}>
                <Text style={[s.body, { flex: 1 }]}>{`${i.productName}${i.sizeLabel || i.garmentColor ? ` · ${[i.sizeLabel, i.garmentColor].filter(Boolean).join(' · ')}` : ''}  ×${i.quantity}`}</Text>
                <Text style={s.strong}>{formatCents(i.unitPriceCents * i.quantity)}</Text>
              </View>
            ))}
            <View style={s.card}>
              <View style={s.row}><Text style={s.body}>{t('store.items')}</Text><Text style={s.strong}>{formatCents(order.itemsCents - order.discountCents)}</Text></View>
              <View style={s.row}><Text style={s.body}>{t('store.shipping')}</Text><Text style={s.strong}>{formatCents(order.shippingCents)}</Text></View>
              <View style={s.row}><Text style={s.body}>{t('store.total')}</Text><Text style={s.strong}>{formatCents(order.totalCents)}</Text></View>
              {order.audience === 'member' && order.pointsReserved > 0 ? <View style={s.row}><Text style={s.body}>{t('store.pointsSpent')}</Text><Text style={s.strong}>{order.pointsReserved}</Text></View> : null}
            </View>
            {order.trackingNumber ? <Text style={s.meta} testID="store-tracking">{t('store.trackingLine', { carrier: order.carrier ?? '', number: order.trackingNumber })}</Text> : null}
            {note ? <Text style={note.bad ? s.error : s.meta} accessibilityRole={note.bad ? 'alert' : undefined}>{note.text}</Text> : null}
            {order.status === 'pending_payment' ? (
              <>
                <PrimaryButton label={t('store.payNow')} onPress={pay} disabled={busy} testID="store-pay" />
                <OutlineButton label={t('store.cancelOrder')} onPress={cancel} disabled={busy} testID="store-cancel" />
              </>
            ) : null}
          </>
        )}
    </StoreScreen>
  );
}
