/**
 * R1 MEMBER REFERS A HELLO HANGOUT — "Where do you already go?" (design RL-03-SN-17).
 * POST /referrals/hangout sends the place to Say Hello, who ask the business. A member earns POINTS only — never money —
 * and only once the referred Hello Hangout has signed up and paid (RULES §4.11); the figure comes from the server.
 * No places provider is connected, so the member types the name rather than picking from a search list.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer, TextInput, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { s3AdminEn } from '../../src/i18n/s3-admin-en';
import { Colors } from '../../src/theme/tokens';
import { getMyReferrals, sendReferral, type ReferralRow } from '../../src/api/referrals';

export default function ReferHangoutScreen() {
  const router = useRouter();
  const [place, setPlace] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    const r = await getMyReferrals();
    if (r.error || !r.data) { setState('error'); setError(r.error?.code === 'business_unavailable' ? t('referral.errors.business_unavailable') : null); return; }
    setPoints(r.data.pointsIfConverted);
    setRows(r.data.referrals);
    setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function send() {
    if (busy || place.trim().length < 2) return;
    setBusy(true); setError(null); setMessage(null);
    const r = await sendReferral({ placeName: place.trim(), address: address.trim() || undefined, note: note.trim() || undefined });
    setBusy(false);
    if (r.error) {
      const code = r.error.code && r.error.code in s3AdminEn.referral.errors ? r.error.code : 'fallback';
      setError(t(`referral.errors.${code}`));
      return;
    }
    setPlace(''); setAddress(''); setNote('');
    setMessage(t('referral.sent'));
    void load();
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
          <Text style={styles.header}>{t('refer.hangout.title')}</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>{t('refer.hangout.headline')}</Text>
        <Text style={styles.body}>{t('refer.hangout.body')}</Text>
        <TextInput value={place} onChangeText={setPlace} placeholder={t('referral.placeLabel')} accessibilityLabel={t('referral.placeLabel')} testID="refer-search" />
        <TextInput value={address} onChangeText={setAddress} placeholder={t('referral.addressLabel')} accessibilityLabel={t('referral.addressLabel')} testID="refer-address" />
        <TextInput value={note} onChangeText={setNote} placeholder={t('referral.noteLabel')} accessibilityLabel={t('referral.noteLabel')} multiline testID="refer-note" />

        {points !== null && points > 0 ? (
          <View style={styles.pointsBox} testID="refer-points">
            <Text style={styles.pointsKicker}>{t('referral.ifTheySign')}</Text>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsValue}>{points}</Text>
              <Text style={styles.pointsLabel}>{t('refer.hangout.pointsLabel')}</Text>
            </View>
            <Text style={styles.pointsBody}>{t('refer.hangout.pointsBody')}</Text>
            <Text style={styles.pointsBody}>{t('referral.pointsOnlyAfterPaid')}</Text>
          </View>
        ) : null}

        <Text style={styles.boundary}>{t('refer.hangout.boundary')}</Text>

        {error ? <Text accessibilityRole="alert" style={styles.error} testID="refer-error">{error}</Text> : null}
        {message ? <Text style={styles.ok} testID="refer-sent">{message}</Text> : null}
        <Button title={busy ? t('referral.sending') : t('referral.send')} onPress={() => void send()} disabled={busy || place.trim().length < 2} testID="refer-submit" />

        <Text style={styles.header}>{t('referral.mine')}</Text>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="refer-retry">
            <Text style={styles.body}>{t('referral.loadFailed')} {t('referral.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && rows.length === 0 ? <Text style={styles.body} testID="refer-empty">{t('referral.mineEmpty')}</Text> : null}
        {rows.map((r) => (
          <View key={r.id} style={styles.row} testID={`refer-row-${r.id}`}>
            <Text style={styles.rowTitle}>{r.placeName}</Text>
            <Text style={styles.body}>{t(`referral.status.${r.status}`)}{r.status === 'converted' && r.pointsAwarded ? ` · ${t('referral.earned', { points: r.pointsAwarded })}` : ''}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 12, paddingBottom: 32 },
  back: { gap: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  headline: { fontSize: 25, fontWeight: '900', color: Colors.Ink, lineHeight: 28 },
  body: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  pointsBox: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 8, padding: 14, gap: 6 },
  pointsKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Muted },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  pointsValue: { fontSize: 34, fontWeight: '900', color: Colors.Ink },
  pointsLabel: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  pointsBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  boundary: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  error: { fontSize: 14, lineHeight: 20, color: Colors.SignalRed },
  ok: { fontSize: 14, lineHeight: 20, color: Colors.Ink, fontWeight: '700' },
  row: { borderTopWidth: 1, borderTopColor: Colors.Line, paddingVertical: 10, gap: 2 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
});
