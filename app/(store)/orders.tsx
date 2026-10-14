/** ORDER HISTORY — GET /store/orders (the signed-in account's own orders only). */
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { getStoreOrders } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, storeStyles as s } from '../../src/components/store/StoreBits';
import { dayMonth } from '../../src/lib/ambassador-format';

export default function OrdersScreen() {
  const router = useRouter();
  const { state, data, errorCode, retry, refreshing, onRefresh } = useLoader(async () => getStoreOrders());
  return (
    <StoreScreen title={t('store.orders')} refreshing={refreshing} onRefresh={onRefresh} testID="store-orders">
      {state === 'loading' ? <Loading />
        : errorCode === 'store_unavailable' ? <Text style={s.body}>{t('store.unavailable')}</Text>
        : state === 'error' || !data ? <ErrorBlock onRetry={retry} />
        : data.orders.length === 0 ? <Text style={s.body} testID="store-orders-empty">{t('store.ordersEmpty')}</Text>
        : data.orders.map((o) => (
          <TouchableOpacity key={o.id} accessibilityRole="button" style={s.card} testID={`store-order-${o.id}`}
            onPress={() => router.push({ pathname: '/(store)/order', params: { id: o.id } } as never)}>
            <View style={s.row}>
              <Text style={s.strong}>{formatCents(o.totalCents)}</Text>
              <Text style={s.meta}>{t(`store.status.${o.status}`)}</Text>
            </View>
            <Text style={s.meta}>{t('store.placedOn', { date: dayMonth(o.createdAt) })}</Text>
          </TouchableOpacity>
        ))}
    </StoreScreen>
  );
}
