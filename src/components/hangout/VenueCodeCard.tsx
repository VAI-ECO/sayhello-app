/**
 * The venue's own code, for the owner to show or print (§15.5). An Ambassador proves a visit
 * by scanning THIS code with the live camera (§14.5) — the API never sends it to an Ambassador,
 * so it is the owner's screen (or their printed copy) that makes a visit possible.
 * Not built, recorded: the print-ready PDF export (§15.11) and the physical stand (§15.5).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import { getVenueCode } from '../../api/hangouts';
import { ScannableCode } from '../qr-code';

export function VenueCodeCard({ helloHangoutId }: { helloHangoutId: string }) {
  const [payload, setPayload] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    setState('loading');
    try {
      const res = await getVenueCode(helloHangoutId);
      if (id !== loadId.current) return;
      if (!res || res.error || !res.data) {
        setState('error');
        return;
      }
      setPayload(res.data.venueCode.payload);
      setState('ready');
    } catch {
      if (id === loadId.current) setState('error');
    }
  }, [helloHangoutId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <View style={styles.card} testID="dashboard-venue-code">
      <Text style={styles.label}>{t('hangout.dashboard.venueCodeTitle')}</Text>
      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'error' ? (
        <TouchableOpacity onPress={() => void load()} accessibilityRole="button" testID="venue-code-retry">
          <Text accessibilityRole="alert" style={styles.muted}>{t('hangout.dashboard.venueCodeFailed')} {t('hangout.dashboard.retry')}</Text>
        </TouchableOpacity>
      ) : null}
      {state === 'ready' && payload ? (
        <>
          <View style={styles.qr}>
            <ScannableCode value={payload} size={180} label={t('hangout.dashboard.venueCodeLabel')} fallback={t('hangout.dashboard.venueCodeFailed')} />
          </View>
          <Text style={styles.muted}>{t('hangout.dashboard.venueCodeBody')}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, backgroundColor: Colors.Chalk, padding: 14, gap: 8 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.Muted },
  muted: { fontSize: 13, lineHeight: 19, color: Colors.Muted },
  qr: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' },
});
