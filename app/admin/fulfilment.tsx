/**
 * HELLO ADMIN › ORDERS AND STANDS — paid Waverly's Place orders and Ambassador QR stand requests, moved by hand
 * through paid → packed → shipped → delivered (stands: requested → packed with serials → shipped). No shipping
 * provider is connected, so this records the carrier and tracking number you enter and ships nothing itself.
 * Looking needs settings.view; changing needs settings.edit (§23.3 names no store permission — recorded).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import {
  getStoreOrders, setStoreOrderStatus, getStandOrders, assignStandSerials, shipStandOrder,
  type StoreOrderRow, type StoreOrderStatus, type StandOrderRow, type StandOrderStatus,
} from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Btn, Field, Pill, Seg, adminStyles as s } from '../../src/components/admin/AdminParts';
import { w3ErrorText } from '../../src/components/admin/storeErrors';

const addressLine = (shipTo: Record<string, unknown>) =>
  ['name', 'line1', 'line2', 'city', 'region', 'postalCode', 'country', 'phone'].map((k) => shipTo?.[k]).filter((v) => typeof v === 'string' && v).join(', ');

function OrderCard({ o, canEdit, onDone }: { o: StoreOrderRow; canEdit: boolean; onDone: () => void }) {
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function move(status: 'packed' | 'shipped' | 'delivered') {
    setBusy(true); setMsg(null);
    const r = await setStoreOrderStatus(o.id, { status, carrier: carrier.trim() || undefined, trackingNumber: tracking.trim() || undefined });
    setBusy(false);
    if (r?.data) onDone(); else setMsg(w3ErrorText(r?.error?.code));
  }
  return (
    <Card testID={`admin-order-${o.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{t(o.audience === 'ambassador' ? 'adminW3.fulfil.audienceAmbassador' : 'adminW3.fulfil.audienceMember')}</Text>
        <Pill tone={o.status === 'paid' ? 'warn' : o.status === 'delivered' ? 'ok' : undefined} text={t(`adminW3.fulfil.status.${o.status}`)} />
      </View>
      {o.storeOrderItems.map((i) => (
        <Text key={i.id} style={s.body}>{t('adminW3.fulfil.line', { qty: i.quantity, name: i.productName })}{[i.sizeLabel, i.garmentColor, i.waverlyColor].filter(Boolean).length ? ` (${[i.sizeLabel, i.garmentColor, i.waverlyColor].filter(Boolean).join(', ')})` : ''}</Text>
      ))}
      <Text style={s.small}>{t('adminW3.fulfil.totals', { items: formatCents(o.itemsCents - o.discountCents), shipping: formatCents(o.shippingCents), total: formatCents(o.totalCents) })}</Text>
      {o.pointsReserved > 0 ? <Text style={s.small}>{t('adminW3.fulfil.pointsHeld', { points: o.pointsReserved })}</Text> : null}
      <Text style={s.small}>{t('adminW3.fulfil.shipTo')}: {addressLine(o.shipTo)}</Text>
      {o.reviewFlags?.length ? <Pill tone="warn" text={t('adminW3.fulfil.flags', { flags: o.reviewFlags.join(', ') })} /> : null}
      {o.status === 'refunded' ? <Text style={s.small}>{t('adminW3.fulfil.refundedNote')}</Text> : null}
      {o.shippedAt ? <Text style={s.small}>{t('adminW3.fulfil.shippedAt', { when: whenLabel(o.shippedAt) })}{o.carrier ? ` · ${o.carrier}` : ''}{o.trackingNumber ? ` · ${o.trackingNumber}` : ''}</Text> : null}
      {o.deliveredAt ? <Text style={s.small}>{t('adminW3.fulfil.deliveredAt', { when: whenLabel(o.deliveredAt) })}</Text> : null}
      {canEdit && o.status === 'paid' ? <Btn busy={busy} label={t('adminW3.fulfil.markPacked')} onPress={() => move('packed')} testID={`admin-order-pack-${o.id}`} /> : null}
      {canEdit && o.status === 'packed' ? (
        <View style={s.gap}>
          <Field label={t('adminW3.fulfil.carrier')} value={carrier} onChange={setCarrier} testID={`admin-order-carrier-${o.id}`} />
          <Field label={t('adminW3.fulfil.tracking')} value={tracking} onChange={setTracking} testID={`admin-order-tracking-${o.id}`} />
          <Btn busy={busy} label={t('adminW3.fulfil.markShipped')} onPress={() => move('shipped')} testID={`admin-order-ship-${o.id}`} />
        </View>
      ) : null}
      {canEdit && o.status === 'shipped' ? <Btn busy={busy} label={t('adminW3.fulfil.markDelivered')} onPress={() => move('delivered')} testID={`admin-order-deliver-${o.id}`} /> : null}
      {msg ? <Text style={s.body} accessibilityRole="alert">{msg}</Text> : null}
    </Card>
  );
}

function StandCard({ o, canEdit, onDone }: { o: StandOrderRow; canEdit: boolean; onDone: () => void }) {
  const [serials, setSerials] = useState('');
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function run(fn: () => Promise<{ data?: unknown; error?: { code?: string } } | undefined>) {
    setBusy(true); setMsg(null);
    const r = await fn();
    setBusy(false);
    if (r?.data) onDone(); else setMsg(w3ErrorText(r?.error?.code));
  }
  const list = serials.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
  return (
    <Card testID={`admin-stand-${o.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{t('adminW3.fulfil.standQty', { qty: o.quantity })} · {o.reason === 'replacement' ? t('adminW3.fulfil.standReplacement', { serial: o.replacesSerial ?? '—' }) : t('adminW3.fulfil.standNew')}</Text>
        <Pill tone={o.status === 'requested' ? 'warn' : o.status === 'delivered' ? 'ok' : undefined} text={t(`adminW3.fulfil.status.${o.status}`)} />
      </View>
      <Text style={s.small}>{t('adminW3.fulfil.requestedAt', { when: whenLabel(o.requestedAt) })}</Text>
      <Text style={s.small}>{t('adminW3.fulfil.shipTo')}: {addressLine(o.shipTo)}</Text>
      {o.adminNote ? <Text style={s.small}>{t('adminW3.fulfil.adminNote', { note: o.adminNote })}</Text> : null}
      {o.trackingNumber || o.carrier ? <Text style={s.small}>{[o.carrier, o.trackingNumber].filter(Boolean).join(' · ')}</Text> : null}
      {canEdit && (o.status === 'requested' || o.status === 'packed') ? (
        <View style={s.gap}>
          <Field label={t('adminW3.fulfil.serials')} value={serials} onChange={setSerials} multiline testID={`admin-stand-serials-${o.id}`} />
          <Btn busy={busy} disabled={list.length === 0} label={t('adminW3.fulfil.assign')} onPress={() => run(() => assignStandSerials(o.id, list))} testID={`admin-stand-assign-${o.id}`} />
        </View>
      ) : null}
      {canEdit && o.status === 'packed' ? (
        <View style={s.gap}>
          <Field label={t('adminW3.fulfil.carrier')} value={carrier} onChange={setCarrier} testID={`admin-stand-carrier-${o.id}`} />
          <Field label={t('adminW3.fulfil.tracking')} value={tracking} onChange={setTracking} testID={`admin-stand-tracking-${o.id}`} />
          <Btn busy={busy} label={t('adminW3.fulfil.shipStand')} onPress={() => run(() => shipStandOrder(o.id, { carrier: carrier.trim() || undefined, trackingNumber: tracking.trim() || undefined }))} testID={`admin-stand-ship-${o.id}`} />
        </View>
      ) : null}
      {msg ? <Text style={s.body} accessibilityRole="alert">{msg}</Text> : null}
    </Card>
  );
}

export default function AdminFulfilmentScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const [os, setOs] = useState<'all' | StoreOrderStatus>('paid');
  const [ss, setSs] = useState<'all' | StandOrderStatus>('requested');
  const orders = useLoader(async () => { const r = await getStoreOrders(os === 'all' ? undefined : os); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const stands = useLoader(async () => { const r = await getStandOrders(ss === 'all' ? undefined : ss); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const reloadAll = () => { orders.reload(); stands.reload(); };

  return (
    <AdminShell active="fulfilment" title={t('adminW3.fulfil.title')} subtitle={t('adminW3.fulfil.lead')} refreshing={orders.refreshing || stands.refreshing} onRefresh={() => { orders.onRefresh(); stands.onRefresh(); }} testID="admin-fulfilment">
      <Eyebrow>{t('adminW3.fulfil.storeOrders')}</Eyebrow>
      <Seg id="admin-orders-filter" value={os} onChange={(k) => { setOs(k); setTimeout(orders.reload, 0); }} options={[
        { key: 'paid', label: t('adminW3.fulfil.status.paid') }, { key: 'packed', label: t('adminW3.fulfil.status.packed') }, { key: 'shipped', label: t('adminW3.fulfil.status.shipped') },
        { key: 'delivered', label: t('adminW3.fulfil.status.delivered') }, { key: 'refunded', label: t('adminW3.fulfil.status.refunded') }, { key: 'all', label: t('adminW3.fulfil.statusAll') }]} />
      <Loaded l={orders} id="admin-orders">
        {(d) => (
          <View style={s.gap}>
            {d.orders.length === 0 ? <Card testID="admin-orders-empty"><Text style={s.body}>{t('adminW3.fulfil.ordersEmpty')}</Text></Card> : null}
            {d.orders.map((o) => <OrderCard key={o.id} o={o} canEdit={canEdit} onDone={reloadAll} />)}
          </View>
        )}
      </Loaded>
      <Eyebrow>{t('adminW3.fulfil.standOrders')}</Eyebrow>
      <Seg id="admin-stands-filter" value={ss} onChange={(k) => { setSs(k); setTimeout(stands.reload, 0); }} options={[
        { key: 'requested', label: t('adminW3.fulfil.status.requested') }, { key: 'packed', label: t('adminW3.fulfil.status.packed') }, { key: 'shipped', label: t('adminW3.fulfil.status.shipped') },
        { key: 'delivered', label: t('adminW3.fulfil.status.delivered') }, { key: 'all', label: t('adminW3.fulfil.statusAll') }]} />
      <Loaded l={stands} id="admin-stands">
        {(d) => (
          <View style={s.gap}>
            {d.orders.length === 0 ? <Card testID="admin-stands-empty"><Text style={s.body}>{t('adminW3.fulfil.standsEmpty')}</Text></Card> : null}
            {d.orders.map((o) => <StandCard key={o.id} o={o} canEdit={canEdit} onDone={reloadAll} />)}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
