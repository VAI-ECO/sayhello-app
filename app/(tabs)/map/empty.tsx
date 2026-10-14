/**
 * HELLO MAP — EMPTY HERE (CANON-RL-01-SN-25 "Map · empty here"; delivered
 * "1 The Hello - P 375" §E: a sheet over the map ground).
 *
 * Reached when the server reports no pins in an area. An empty map is an
 * invitation, never a failure: no apology, no "check back later".
 *
 * "Turn on Hellos here" is the delivered action. Being open to Hellos with
 * people nearby needs discovery (RULES §8, pending the proximity ruling) and a
 * server-side setting that does not exist yet, so the button is shown
 * disabled with that stated plainly — it never pretends to switch anything on.
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer, useTopSpacerHeight } from '../../../src/components/StatusBarSpacer';
import { MapCanvas } from '../../../src/components/map/MapCanvas';
import { bboxFromParams } from '../../../src/lib/map-geo';
import { getOpenToHellos, setOpenToHellos, type OpenToHellos } from '../../../src/api/map';

export default function EmptyStateScreen() {
  const router = useRouter();
  const spacerHeight = useTopSpacerHeight(44);
  const params = useLocalSearchParams<Record<string, string>>();
  const [openState, setOpenState] = useState<OpenToHellos | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { void getOpenToHellos().then((r) => { if (!r.error && r.data) setOpenState(r.data); }); }, []);
  const turnOn = async () => {
    setBusy(true); setFailed(false);
    const r = await setOpenToHellos(true);
    setBusy(false);
    if (r.error || !r.data) setFailed(true); else setOpenState(r.data);
  };
  const locationName = typeof params.locationName === 'string' && params.locationName ? params.locationName : t('map.browsing.thisArea');

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapCanvas bbox={bboxFromParams(params)} pins={[]} hangouts={[]} />
        <StatusBarSpacer height={44} />
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('map.search.cancel')} style={[styles.back, { top: spacerHeight + 4 }]}>
          <Text style={styles.backArrow}>{t('map.common.back')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.headerTitle}>{locationName}</Text>
        <Text style={styles.emptyTitle}>{t('map.empty.title')}</Text>
        <Text style={styles.emptyBody}>{t('map.empty.body', { city: locationName })}</Text>

        <TouchableOpacity
          style={[styles.helloButton, (!openState || busy || openState.open) && styles.helloButtonDisabled]}
          disabled={!openState || busy || openState.open}
          onPress={() => void turnOn()}
          accessibilityRole="button"
          accessibilityState={{ disabled: !openState || busy || openState.open }}
          testID="turn-on-hello-button"
        >
          <Text style={styles.helloButtonText}>
            Turn on{' '}
            <Text style={styles.helloButtonHello}>Hellos</Text>
            {' '}here
          </Text>
        </TouchableOpacity>
        {failed ? <Text style={styles.note} accessibilityRole="alert">{t('map.common.failed')}</Text> : null}
        {openState?.open ? <Text style={styles.note}>{openState.discoveryActive ? t('map.empty.nowOpen') : t('map.open.notSwitchedOn')}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEDEA',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  back: {
    position: 'absolute',
    left: 16,
    padding: 8,
    backgroundColor: Colors.Chalk,
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.Ink,
  },
  sheet: {
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 14,
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Line,
    alignSelf: 'center',
  },
  headerTitle: {
    fontFamily: 'Assistant',
    fontSize: 25,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.6,
  },
  emptyTitle: {
    fontFamily: 'Assistant',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.Ink,
  },
  emptyBody: {
    fontFamily: 'Assistant',
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: Colors.Muted,
  },
  helloButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 26,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloButtonDisabled: {
    opacity: 0.45,
  },
  helloButtonText: {
    fontFamily: 'Assistant',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.Chalk,
  },
  helloButtonHello: {
    fontFamily: 'Dreaming',
    fontSize: 22,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    textAlign: 'center',
  },
});
