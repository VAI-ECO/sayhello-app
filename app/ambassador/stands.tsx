/**
 * QR STANDS (ROLE-3, RULES §15): request stands (Say Hello pays, no limit, no minimum), follow each request
 * through packed → shipped → delivered, confirm arrival, and see every stand you hold with the business it
 * is bound to. Nothing ships by itself yet (no fulfilment provider): Hello Admin records each step and this
 * screen says so. Binding is the verified-visit install flow, not a button here.
 */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { useLoader } from '../../src/lib/use-loader';
import { getStands, requestStands, confirmStandsReceived, cancelStandRequest, type ShipTo } from '../../src/api/store';
import { StoreScreen, Loading, ErrorBlock, PrimaryButton, OutlineButton, storeStyles as s } from '../../src/components/store/StoreBits';
import { dayMonth } from '../../src/lib/ambassador-format';

export default function StandsScreen() {
  const router = useRouter();
  const { state, data, errorCode, retry, reload, refreshing, onRefresh } = useLoader(async () => getStands());
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('1');
  const [replaces, setReplaces] = useState('');
  const [f, setF] = useState({ name: '', line1: '', city: '', region: '', postalCode: '', country: '' });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const n = parseInt(qty, 10);
  const valid = Number.isInteger(n) && n >= 1 && f.name.trim() && f.line1.trim() && f.city.trim() && f.postalCode.trim() && f.country.trim().length === 2;

  const send = async () => {
    setBusy(true); setNote(null);
    const shipTo: ShipTo = { name: f.name.trim(), line1: f.line1.trim(), city: f.city.trim(), postalCode: f.postalCode.trim(), country: f.country.trim().toUpperCase(), ...(f.region.trim() ? { region: f.region.trim() } : {}) };
    const res = await requestStands({ quantity: n, shipTo, reason: replaces.trim() ? 'replacement' : 'new', ...(replaces.trim() ? { replacesSerial: replaces.trim() } : {}) });
    setBusy(false);
    if (res?.error) { setNote({ text: t('stands.sendFailed'), bad: true }); return; }
    setNote({ text: t('stands.sent'), bad: false }); setOpen(false); await reload();
  };
  const received = async (id: string) => { const r = await confirmStandsReceived(id); setNote(r?.error ? { text: t('stands.receivedFailed'), bad: true } : null); await reload(); };
  const cancel = async (id: string) => { const r = await cancelStandRequest(id); setNote(r?.error ? { text: t('stands.cancelFailed'), bad: true } : null); await reload(); };

  const input = (k: keyof typeof f, label: string, extra: object = {}) => (
    <View style={{ gap: 4 }} key={k}>
      <Text style={s.label}>{label}</Text>
      <TextInput value={f[k]} onChangeText={set(k)} style={s.input} accessibilityLabel={label} testID={`stands-${k}`} {...extra} />
    </View>
  );

  return (
    <StoreScreen title={t('stands.title')} refreshing={refreshing} onRefresh={onRefresh} onBack={() => router.back()} testID="ambassador-stands">
      <Text style={s.body}>{t('stands.lead')}</Text>
      {state === 'loading' ? <Loading />
        : errorCode === 'business_unavailable' ? <Text style={s.body}>{t('store.unavailable')}</Text>
        : state === 'error' || !data ? <ErrorBlock message={t('stands.loadFailed')} onRetry={retry} />
        : (
          <>
            {!data.fulfilment.automated ? <Text style={s.meta} testID="stands-not-automated">{t('stands.notAutomated')}</Text> : null}
            {note ? <Text style={note.bad ? s.error : s.meta} accessibilityRole={note.bad ? 'alert' : undefined}>{note.text}</Text> : null}

            {open ? (
              <View style={{ gap: 10 }} testID="stands-form">
                <View style={{ gap: 4 }}><Text style={s.label}>{t('stands.quantity')}</Text><TextInput value={qty} onChangeText={setQty} keyboardType="number-pad" style={s.input} testID="stands-qty" /></View>
                <View style={{ gap: 4 }}><Text style={s.label}>{t('stands.replacesSerial')}</Text><TextInput value={replaces} onChangeText={setReplaces} autoCapitalize="characters" style={s.input} testID="stands-replaces" /></View>
                {input('name', t('store.fieldName'))}
                {input('line1', t('store.fieldLine1'))}
                {input('city', t('store.fieldCity'))}
                {input('region', t('store.fieldRegion'))}
                {input('postalCode', t('store.fieldPostal'))}
                {input('country', t('store.fieldCountry'), { autoCapitalize: 'characters', maxLength: 2 })}
                <PrimaryButton label={busy ? t('stands.sending') : t('stands.sendRequest')} disabled={!valid || busy} onPress={send} testID="stands-send" />
                <OutlineButton label={t('store.back')} onPress={() => setOpen(false)} />
              </View>
            ) : <PrimaryButton label={t('stands.request')} onPress={() => setOpen(true)} testID="stands-open-form" />}

            <Text style={s.label}>{t('stands.ordersTitle')}</Text>
            {data.orders.length === 0 ? <Text style={s.body} testID="stands-orders-empty">{t('stands.ordersEmpty')}</Text> : data.orders.map((o) => (
              <View key={o.id} style={s.card} testID={`stands-order-${o.id}`}>
                <View style={s.row}><Text style={s.strong}>{t('stands.qty', { count: o.quantity })}</Text><Text style={s.meta}>{t(`stands.status.${o.status}`)}</Text></View>
                <Text style={s.meta}>{dayMonth(o.requestedAt)}{o.reason === 'replacement' ? ` · ${t('stands.reasonReplacement')}` : ''}</Text>
                {o.trackingNumber ? <Text style={s.meta}>{t('store.trackingLine', { carrier: o.carrier ?? '', number: o.trackingNumber })}</Text> : null}
                {o.status === 'shipped' ? <PrimaryButton label={t('stands.received')} onPress={() => received(o.id)} testID={`stands-received-${o.id}`} /> : null}
                {o.status === 'requested' ? <OutlineButton label={t('stands.cancel')} onPress={() => cancel(o.id)} testID={`stands-cancel-${o.id}`} /> : null}
              </View>
            ))}

            <Text style={s.label}>{t('stands.standsTitle')}</Text>
            {data.stands.length === 0 ? <Text style={s.body} testID="stands-empty">{t('stands.standsEmpty')}</Text> : data.stands.map((st) => (
              <View key={st.serial} style={s.card} testID={`stand-${st.serial}`}>
                <View style={s.row}><Text style={s.strong}>{st.serial}</Text><Text style={s.meta}>{t(`stands.status.${st.status}`)}</Text></View>
                <Text style={s.meta}>{st.businessName ? t('stands.boundTo', { name: st.businessName }) : t('stands.notBound')}</Text>
                {st.status === 'bound' ? <Text style={s.meta}>{st.neverScanned ? t('stands.neverScanned') : t('stands.scans', { count: st.customerScans })}</Text> : null}
              </View>
            ))}
            <Text style={s.meta}>{t('stands.bindNote')}</Text>
          </>
        )}
    </StoreScreen>
  );
}
