/**
 * HELLO MAP — A PLACE (CANON-RL-01-SN-101 "Map · a place"; delivered
 * "1 The Hello - P 375" §E. Historically cross-walked as CANON-RL-02-SN-01,
 * which collides with "H11 Directory listing"; the 2026-09-20 manifest
 * addresses this screen as RL-01-SN-101.)
 *
 * An area of the map (a viewport, never a distance) with what the server
 * counts in it: Hellos, this month, Hello Hangouts, and the most recent pins.
 * Tallies are Waverly plus a number, Waverly alone at zero (§19.1–19.3).
 * The title is the real source of the area: the Hello Hangout it was opened
 * from, or "This area" for the map viewport (no geocoder names places).
 * Recent pins open the enlarged sheet, where the selfie lives (§10.43).
 * An area with no pins opens "Map · empty here" instead.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer, useTopSpacerHeight } from '../../../src/components/StatusBarSpacer';
import { MapCanvas } from '../../../src/components/map/MapCanvas';
import { PinSheet } from '../../../src/components/map/PinSheet';
import { WaverlyTally } from '../../../src/components/map/WaverlyTally';
import {
  getAreaSummary,
  getMapHangouts,
  getMapPins,
  type AreaSummary,
  type MapHangout,
  type MapPin,
} from '../../../src/api/map';
import { bboxFromParams, bboxToParams } from '../../../src/lib/map-geo';

export default function PlaceDetailScreen() {
  const router = useRouter();
  const spacerHeight = useTopSpacerHeight(44);
  const { width: windowWidth } = useWindowDimensions();
  const wide = windowWidth >= 700;
  const routerRef = useRef(router);
  routerRef.current = router;
  const params = useLocalSearchParams<Record<string, string>>();
  const label = typeof params.label === 'string' && params.label ? params.label : t('map.browsing.thisArea');
  const bboxKey = [params.minLat, params.maxLat, params.minLng, params.maxLng].join(',');
  const [area, setArea] = useState<AreaSummary | null>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [hangouts, setHangouts] = useState<MapHangout[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const bbox = bboxFromParams(params);

  const load = useCallback(async () => {
    const box = bboxFromParams(params);
    if (!box) { setState('error'); setError(t('map.common.failed')); return; }
    setState('loading');
    setError(null);
    const [a, p, h] = await Promise.all([getAreaSummary(box), getMapPins({ scope: 'all', bbox: box }), getMapHangouts(box)]);
    const failure = a.error || p.error || h.error;
    if (failure || !a.data) { setError(failure?.message || t('map.common.failed')); setState('error'); return; }
    if (a.data.area.hellos === 0) {
      routerRef.current.replace({ pathname: '/map/empty', params: { locationName: label, ...bboxToParams(box) } });
      return;
    }
    setArea(a.data.area);
    setPins(p.data?.pins ?? []);
    setHangouts(h.data?.hangouts ?? []);
    setState('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bboxKey, label]);

  useEffect(() => { void load(); }, [load]);

  return (
    <View style={[styles.container, wide && { flexDirection: 'row' }]}>
      <View style={styles.mapArea}>
        <MapCanvas bbox={bbox} pins={pins} hangouts={hangouts} selectedPinId={openPin} onPinPress={p => setOpenPin(p.id)} />
        <StatusBarSpacer height={44} />
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('map.search.cancel')} style={[styles.back, { top: spacerHeight + 4 }]}>
          <Text style={styles.backArrow}>{t('map.common.back')}</Text>
        </TouchableOpacity>
      </View>

      {/* Phone: bottom sheet. Tablet and desktop: a fixed side panel beside the map (Map and Pins, Pin sheet frames). */}
      <View style={wide ? { width: windowWidth >= 1280 ? 420 : 356, backgroundColor: Colors.Chalk, borderLeftWidth: 1, borderLeftColor: Colors.Line } : undefined}>
      {openPin ? (
        <PinSheet pinId={openPin} onClose={() => setOpenPin(null)} panel={wide} />
      ) : (
        <View style={[styles.sheet, wide && { flex: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: 30, shadowOpacity: 0 }]}>
          <View style={styles.handle} />
          <Text style={styles.title} testID="place-title">{label}</Text>
          {state === 'loading' ? <ActivityIndicator color={Colors.Ink} testID="place-loading" /> : null}
          {state === 'error' ? (
            <TouchableOpacity onPress={() => void load()} accessibilityRole="button" testID="place-retry">
              <Text accessibilityRole="alert" style={styles.muted}>{error} {t('map.common.retry')}</Text>
            </TouchableOpacity>
          ) : null}
          {state === 'ready' && area ? (
            <>
              <View style={styles.tallies}>
                <WaverlyTally value={area.hellos} label={t('map.place.statsHellos')} testID="place-hellos" />
                <WaverlyTally value={area.thisMonth} label={t('map.place.statsThisMonth')} testID="place-this-month" />
                <WaverlyTally value={area.helloHangouts} label={t('map.place.statsHangouts')} testID="place-hangouts" />
              </View>
              {area.recent.length > 0 ? (
                <View style={styles.recent}>
                  <Text style={styles.sectionLabel}>{t('map.place.sectionRecent')}</Text>
                  <View style={styles.recentRow}>
                    {area.recent.map(r => (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.recentTile, { borderColor: r.color ?? Colors.Line }]}
                        onPress={() => setOpenPin(r.id)}
                        accessibilityRole="button"
                        accessibilityLabel={t(r.mine ? 'map.browsing.yourPinLabel' : 'map.browsing.pinLabel')}
                        testID={`recent-${r.id}`}
                      >
                        <View style={[styles.recentPin, { backgroundColor: r.color ?? Colors.Muted }]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDEA' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  back: { position: 'absolute', left: 16, padding: 8, backgroundColor: Colors.Chalk, borderRadius: 20 },
  backArrow: { fontSize: 20, color: Colors.Ink },
  sheet: {
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    gap: 16,
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.Line, alignSelf: 'center' },
  title: { fontSize: 25, lineHeight: 28.5, fontWeight: '700', letterSpacing: -0.6, color: Colors.Ink },
  muted: { fontSize: 15, color: Colors.Muted },
  tallies: { flexDirection: 'row', gap: 26 },
  recent: { gap: 9 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  recentRow: { flexDirection: 'row', gap: 10 },
  recentTile: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E2DFDB', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  recentPin: { width: 20, height: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 0, transform: [{ rotate: '-45deg' }] },
});
