/**
 * HELLO ADMIN › VENUE LINKS (migration 072 + 103). A person says which older venue record is the same place as a
 * Hello Hangout. Search on both sides, choose one of each, write a reason, link. Clearing needs a reason too.
 * Nothing is matched by name or position; no suggestion is made. Looking needs overrides.view, changing needs
 * overrides.create (the server checks again and writes Audit).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../src/i18n';
import {
  searchVenueHello, searchVenueLegacy, getVenueLinkLog, setVenueLink, clearVenueLink, type VenueHelloRow, type VenueLegacyRow,
} from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';
import { Loaded, Btn, Field, Pill, ReasonAction, adminStyles as s } from '../../src/components/admin/AdminParts';
import { w3ErrorText } from '../../src/components/admin/storeErrors';

export default function AdminVenueLinksScreen() {
  const { me } = useAdminMe();
  const canSet = me?.permissions.includes('overrides.create') ?? false;
  const l = useLoader(async () => { const r = await getVenueLinkLog(); return r?.data ? { data: r.data } : r && r.error ? { error: r.error } : undefined; });
  const [qh, setQh] = useState('');
  const [ql, setQl] = useState('');
  const [hello, setHello] = useState<VenueHelloRow[] | null>(null);
  const [legacy, setLegacy] = useState<VenueLegacyRow[] | null>(null);
  const [pickH, setPickH] = useState<VenueHelloRow | null>(null);
  const [pickL, setPickL] = useState<VenueLegacyRow | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function findHello() { setMsg(null); const r = await searchVenueHello(qh.trim()); if (r?.data) setHello(r.data.hangouts); else setMsg(w3ErrorText(r?.error?.code)); }
  async function findLegacy() { setMsg(null); const r = await searchVenueLegacy(ql.trim()); if (r?.data) setLegacy(r.data.legacy); else setMsg(w3ErrorText(r?.error?.code)); }
  async function link() {
    if (!pickH || !pickL) return;
    setBusy(true); setMsg(null);
    const r = await setVenueLink({ helloHangoutId: pickH.id, legacyHangoutId: pickL.id, reason: reason.trim() });
    setBusy(false);
    if (r?.data) { setMsg(t('adminW3.venues.done')); setPickH(null); setPickL(null); setReason(''); setHello(null); setLegacy(null); l.reload(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  const ready = pickH && pickL && reason.trim() && !pickH.linkedLegacy && !pickL.linkedHello;

  return (
    <AdminShell active="venues" title={t('adminW3.venues.title')} subtitle={t('adminW3.venues.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-venues">
      <Loaded l={l} id="admin-venues-data">
        {(d) => (
          <View style={s.gap}>
            <Card testID="admin-venues-hello">
              <Eyebrow>{t('adminW3.venues.helloSide')}</Eyebrow>
              <Field label={t('adminW3.venues.searchHello')} value={qh} onChange={setQh} testID="admin-venues-hello-q" />
              <Btn kind="outline" label={t('adminW3.venues.search')} onPress={findHello} testID="admin-venues-hello-search" />
              {hello && hello.length === 0 ? <Text style={s.body}>{t('adminW3.venues.none')}</Text> : null}
              {(hello ?? []).map((h) => (
                <View key={h.id} style={s.gap} testID={`admin-venues-hello-${h.id}`}>
                  <View style={s.row}><Text style={s.title}>{h.name}</Text>{h.linkedLegacy ? <Pill tone="ok" text={t('adminW3.venues.linkedTo', { name: h.linkedLegacy.name, address: h.linkedLegacy.address })} /> : <Pill text={t('adminW3.venues.notLinked')} />}</View>
                  <Text style={s.small}>{h.address}</Text>
                  {h.linkedLegacy
                    ? (canSet ? <ReasonAction id={`admin-venues-clear-${h.id}`} label={t('adminW3.venues.clear')} submit={async (why) => { const r = await clearVenueLink(h.id, why); return r?.data ? null : r?.error?.code ?? 'fallback'; }} onDone={() => { setMsg(t('adminW3.venues.cleared')); setHello(null); setLegacy(null); l.reload(); }} /> : null)
                    : <Btn kind={pickH?.id === h.id ? 'primary' : 'outline'} label={pickH?.id === h.id ? t('adminW3.venues.picked') : t('adminW3.venues.pick')} onPress={() => setPickH(h)} testID={`admin-venues-pick-hello-${h.id}`} />}
                </View>
              ))}
            </Card>

            <Card testID="admin-venues-legacy">
              <Eyebrow>{t('adminW3.venues.legacySide')}</Eyebrow>
              <Field label={t('adminW3.venues.searchLegacy')} value={ql} onChange={setQl} testID="admin-venues-legacy-q" />
              <Btn kind="outline" label={t('adminW3.venues.search')} onPress={findLegacy} testID="admin-venues-legacy-search" />
              {legacy && legacy.length === 0 ? <Text style={s.body}>{t('adminW3.venues.none')}</Text> : null}
              {(legacy ?? []).map((r) => (
                <View key={r.id} style={s.gap} testID={`admin-venues-legacy-${r.id}`}>
                  <View style={s.row}><Text style={s.title}>{r.name}</Text><Pill tone={r.linkedHello ? 'ok' : undefined} text={r.linkedHello ? t('adminW3.venues.legacyLinked', { name: r.linkedHello.name }) : t('adminW3.venues.legacyFree')} /></View>
                  <Text style={s.small}>{r.address}</Text>
                  {r.linkedHello ? null : <Btn kind={pickL?.id === r.id ? 'primary' : 'outline'} label={pickL?.id === r.id ? t('adminW3.venues.picked') : t('adminW3.venues.pick')} onPress={() => setPickL(r)} testID={`admin-venues-pick-legacy-${r.id}`} />}
                </View>
              ))}
            </Card>

            {canSet ? (
              <Card testID="admin-venues-pair">
                <Eyebrow>{t('adminW3.venues.pairTitle')}</Eyebrow>
                {pickH && pickL ? (
                  <View style={s.gap}>
                    <Text style={s.body}>{t('adminW3.venues.pairHello', { name: pickH.name })}</Text>
                    <Text style={s.body}>{t('adminW3.venues.pairLegacy', { name: pickL.name })}</Text>
                    <Field label={t('adminW3.venues.reason')} value={reason} onChange={setReason} testID="admin-venues-reason" />
                    <Btn busy={busy} disabled={!ready} label={t('adminW3.venues.set')} onPress={link} testID="admin-venues-set" />
                  </View>
                ) : <Text style={s.small}>{t('adminW3.venues.pairNeed')}</Text>}
                {msg ? <Text style={s.body} accessibilityRole="alert" testID="admin-venues-message">{msg}</Text> : null}
              </Card>
            ) : null}

            <Eyebrow>{t('adminW3.venues.log')}</Eyebrow>
            {d.log.length === 0 ? <Text style={s.small}>{t('adminW3.venues.logNone')}</Text> : null}
            {d.log.map((o) => (
              <Text key={o.id} style={s.small}>
                {t('adminW3.venues.logLine', { what: o.action === 'linked' ? t('adminW3.venues.logLinked', { hello: o.helloName, legacy: o.legacyName }) : t('adminW3.venues.logCleared', { hello: o.helloName, legacy: o.legacyName }), when: whenLabel(o.at), by: o.by ?? '—', reason: o.reason })}
              </Text>
            ))}
          </View>
        )}
      </Loaded>
    </AdminShell>
  );
}
