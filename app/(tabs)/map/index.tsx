/**
 * HELLO MAP — BROWSING, SEARCH AND PIN SHEET
 * (CANON-RL-01-SN-31 Map · browsing, SN-32 Map · search, SN-33 Pin · selfie
 * sheet; delivered "1 The Hello - P 375" §E and "Map and Pins")
 *
 * Data: GET /map/pins (revealed pins only, §10.41), /map/hangouts, /map/search,
 * /map/pins/:id. Nothing is sample data.
 *
 * Filters:
 *  - Near me: the viewport around the device position. Location is used only
 *    to frame the map and find Hello Hangouts (§8.3), never to find people;
 *    pins are past meetings shown after reveal.
 *  - Mine: this person's own pins, framed to fit them.
 *  - Hello Hangouts: only Hello Hangouts in the current viewport.
 *  - This year: every revealed pin in the viewport since 1 January.
 * Location denied is limited mode with one dismissible banner (§26.5).
 *
 * Search: Hello Hangouts by name/street (a person is never a result), plus
 * Hello Hangouts opened recently on this device. City/neighbourhood search
 * needs a geocoding provider that is not in the app; the Places group says so.
 *
 * ⚠️ NEVER state a distance (RULES 8.12)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Waverly } from '../../../src/components';
import { MapView, chooseMapRenderer } from '../../../src/components/map/MapView';
import { PinSheet } from '../../../src/components/map/PinSheet';
import { setKnownOpen } from '../../../src/state/open-to-hellos';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { StatusBarSpacer } from '../../../src/components/StatusBarSpacer';
import {
  getMapPins,
  getMapProviderStatus,
  getOpenToHellos,
  getPinDetail,
  getViewport,
  searchMap,
  setOpenToHellos,
  type Bbox,
  type FullSearch,
  type MapHangout,
  type OpenToHellos,
  type PinKind,
  type ViewportCluster,
  type ViewportItem,
} from '../../../src/api/map';
import {
  bboxAround,
  bboxFitting,
  bboxToParams,
  startOfThisYearIso,
} from '../../../src/lib/map-geo';
import { getRecentHangouts, rememberHangout } from '../../../src/state/map-recent';
import { pinNeedsFraming } from '../../../src/lib/map-focus';
import { CoachMark } from '../../../src/components/consumer/CoachMark';

type FilterType = 'nearMe' | 'mine' | 'helloHangouts' | 'happening' | 'thisYear';
type ViewState = 'loading' | 'error' | 'needArea' | 'mineEmpty' | 'data';
const FILTERS: FilterType[] = ['nearMe', 'mine', 'helloHangouts', 'happening', 'thisYear'];
const FILTER_KINDS: Record<FilterType, PinKind[] | undefined> = {
  nearMe: undefined, // every pin type
  mine: ['hello'],
  helloHangouts: ['hangout'],
  happening: ['hootza', 'org_event', 'holla', 'discount'],
  thisYear: ['hello', 'hangout'],
};

/** Side-panel widths from the delivered Pin sheet frames: tablet 356, desktop 420. */
const PANEL_WIDTH_TABLET = 356;
const PANEL_WIDTH_DESKTOP = 420;

export default function MapBrowsingScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const wide = windowWidth >= 700;
  // The 1440 frame; between 1024 and 1280 the 260 px nav rail already takes room, so the tablet width stays.
  const panelWidth = windowWidth >= 1280 ? PANEL_WIDTH_DESKTOP : PANEL_WIDTH_TABLET;
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeFilter, setActiveFilter] = useState<FilterType>('nearMe');
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [items, setItems] = useState<ViewportItem[]>([]);
  const [clusters, setClusters] = useState<ViewportCluster[]>([]);
  const [clusterList, setClusterList] = useState<ViewportCluster | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [basemapNote, setBasemapNote] = useState<string | null>(null);
  const [basemapConfigured, setBasemapConfigured] = useState(false);
  const [openState, setOpenState] = useState<OpenToHellos | null>(null);
  const [openBusy, setOpenBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  // A Connections row opens the map on that Hello's pin with ?pin=<hello id> (lane09; DESIGN-BRIEF-11 req. 13-14).
  // The pin sheet loads it by id and the server still decides what it may show (reveal-gated, §10.41).
  // It is held in a ref and applied once the first load has finished (a normal load clears the selection), then forgotten,
  // so closing the sheet or changing filters never reopens it.
  // `at` is a timestamp the Connections link adds so asking for the same pin again (after closing its sheet, with the map
  // tab still mounted) is a new request and not an unchanged route. Moving the map to a pin that is outside the view is
  // done by the effect after `load` below.
  const { pin: pinParam, at: atParam } = useLocalSearchParams<{ pin?: string; at?: string }>();
  const pendingPin = useRef<string | null>(typeof pinParam === 'string' && pinParam ? pinParam : null);
  const pinRequestGeneration = useRef(0);
  useEffect(() => {
    ++pinRequestGeneration.current;
    pendingPin.current = typeof pinParam === 'string' && pinParam ? pinParam : null;
  }, [pinParam, atParam]);
  useEffect(() => () => { ++pinRequestGeneration.current; }, []);
  const [locationBanner, setLocationBanner] = useState<'off' | 'blocked' | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const gen = useRef(0);

  // Search overlay
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FullSearch | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recent, setRecent] = useState<MapHangout[]>([]);
  const [searchNonce, setSearchNonce] = useState(0);

  /** Device position, only when permission is already granted (never auto-prompts here). */
  const devicePosition = useCallback(async (ask: boolean): Promise<{ lat: number; lng: number } | null> => {
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && ask && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setLocationBanner(perm.canAskAgain ? 'off' : 'blocked');
        return null;
      }
      setLocationBanner(null);
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      setLocationBanner('off');
      return null;
    }
  }, []);

  const load = useCallback(async (filter: FilterType, opts: { ask?: boolean; area?: Bbox | null; silent?: boolean; pinRequest?: boolean } = {}) => {
    if (!opts.pinRequest) ++pinRequestGeneration.current;
    const mine = ++gen.current;
    // A pan or zoom reloads quietly: no spinner over the map, and an open pin sheet stays open.
    if (!opts.silent) {
      setViewState('loading');
      setSelectedPinId(null);
    }
    setErrorMessage(null);

    let area = opts.area ?? bbox;
    let nextFilter = filter;
    // An explicit area (a searched place, a zoomed cluster) is the frame; the device position only frames a plain Near me.
    if (filter === 'nearMe' && !opts.area) {
      const here = await devicePosition(Boolean(opts.ask));
      if (mine !== gen.current) return;
      if (here) area = bboxAround(here.lat, here.lng);
      else nextFilter = 'mine'; // limited mode: start with this person's own pins
    }

    if (nextFilter === 'mine') {
      const res = await getMapPins({ scope: 'mine' });
      if (mine !== gen.current) return;
      if (res.error) { setErrorMessage(res.error.message); setViewState('error'); return; }
      const own = res.data?.pins ?? [];
      // Near me without location shows this person's pins; the chip says so.
      setActiveFilter('mine');
      setItems(own.map((p): ViewportItem => ({
        kind: 'hello', id: p.id, lat: p.locationLat, lng: p.locationLng, title: null, mine: p.mine, color: p.color,
        destination: { type: 'pin', id: p.id },
      })));
      setClusters([]);
      setTruncated(Boolean(res.data?.truncated));
      const fit = bboxFitting(own.map(p => ({ lat: p.locationLat, lng: p.locationLng })));
      setBbox(fit);
      setViewState(own.length ? 'data' : filter === 'nearMe' ? 'needArea' : 'mineEmpty');
      return;
    }

    if (!area) {
      setActiveFilter(nextFilter);
      setViewState('needArea');
      return;
    }

    const res = await getViewport({
      bbox: area,
      kinds: FILTER_KINDS[nextFilter],
      since: nextFilter === 'thisYear' ? startOfThisYearIso() : null,
    });
    if (mine !== gen.current) return;
    if (res.error || !res.data) { setErrorMessage(res.error?.message ?? null); setViewState('error'); return; }
    setActiveFilter(nextFilter);
    setBbox(area);
    setItems(res.data.items);
    setClusters(res.data.clusters);
    setClusterList(null);
    setTruncated(Object.values(res.data.truncated).some(Boolean));
    setViewState('data');
  }, [bbox, devicePosition]);

  useEffect(() => {
    void getMapProviderStatus().then((r) => {
      if (!r.error && r.data) {
        setBasemapConfigured(r.data.basemap.configured);
        // The note stays until a real basemap is actually drawing: configured on the server AND a native renderer present.
        if (chooseMapRenderer(r.data.basemap.configured) === 'grid') setBasemapNote(t('map.browsing.basemapNotConfigured'));
      }
    });
    void getOpenToHellos().then((r) => { if (!r.error && r.data) { setOpenState(r.data); setKnownOpen(r.data.open); } });
  }, []);

  useEffect(() => {
    void load('nearMe');
    // First load only; later loads come from filters, search and retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A pin asked for by a Connections row (?pin=): once the map is not mid-load, move the map to it if it is not already in
  // view (same framing a searched place gets), then open its sheet. A pin whose position cannot be read just opens the
  // sheet, which says so. Runs again for each new request (pin or `at` changes), so a second tap on "On the map" works
  // while this tab is still mounted. The server decides what the pin shows; the position comes from GET /map/pins/:id.
  useEffect(() => {
    if (viewState === 'loading' || !pendingPin.current) return;
    const id = pendingPin.current;
    pendingPin.current = null;
    const request = pinRequestGeneration.current;
    void (async () => {
      const res = await getPinDetail(id);
      if (request !== pinRequestGeneration.current) return;
      const lat = res.data?.pin.locationLat;
      const lng = res.data?.pin.locationLng;
      if (pinNeedsFraming(bbox, lat, lng)) await load('nearMe', { area: bboxAround(lat as number, lng as number), pinRequest: true });
      if (request !== pinRequestGeneration.current) return;
      setSelectedPinId(id);
    })();
    // bbox and load are read at the moment the request is applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState, pinParam, atParam]);

  // Search: debounced Hello Hangout lookup; recent from this device.
  useEffect(() => {
    if (!isSearching) return;
    void getRecentHangouts().then(setRecent);
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching) return;
    const q = searchQuery.trim();
    if (q.length < 2) { setResults(null); setSearchState('idle'); return; }
    setSearchState('loading');
    const timer = setTimeout(async () => {
      const res = await searchMap(q, bbox ? { lat: (bbox.minLat + bbox.maxLat) / 2, lng: (bbox.minLng + bbox.maxLng) / 2 } : null);
      if (res.error) { setSearchError(res.error.message); setSearchState('error'); return; }
      setResults(res.data ?? null);
      setSearchState('done');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearching, searchNonce]);

  // VERTICAL-BUILD-06: a Hello Hangout's square (and a search result) opens its
  // directory page — "everything routes through the directory" (RULES §17.24).
  // The area view (SN-101) stays reachable from "this area".
  const openHangoutArea = (h: MapHangout) => {
    void rememberHangout(h);
    setIsSearching(false);
    router.push({ pathname: '/(hangout)/directory/[id]', params: { id: h.id } });
  };

  /** Frame the map on a searched place or Hootza and load around it. */
  const goTo = (lat: number, lng: number) => {
    setIsSearching(false);
    void load('nearMe', { area: bboxAround(lat, lng) });
  };

  /** Every pin opens its persisted entity (stage 04): a pin sheet, a directory page, or a Hootza. */
  const openItem = (it: ViewportItem) => {
    const d = it.destination;
    if (d.type === 'pin') { ++pinRequestGeneration.current; setSelectedPinId(d.id); return; }
    if (d.type === 'directory') {
      router.push({ pathname: '/(hangout)/directory/[id]', params: d.postId ? { id: d.id, postId: d.postId } : { id: d.id } });
      return;
    }
    router.push({ pathname: '/(hootzas)/[id]', params: { id: d.id } });
  };

  /**
   * Pan and zoom. Mine already holds every pin of the member's own, so it only re-frames; every other filter asks the
   * server for what is in the new viewport (filter, then limit; truncation is reported, never hidden).
   */
  const moveViewport = (next: Bbox) => {
    setBbox(next);
    if (activeFilter === 'mine') return;
    void load(activeFilter, { area: next, silent: true });
  };

  const openCluster = (c: ViewportCluster) => {
    const tiny = c.bounds.maxLat - c.bounds.minLat < 0.0005 && c.bounds.maxLng - c.bounds.minLng < 0.0005;
    if (c.members && (tiny || c.members.length <= 4)) { setClusterList(c); return; }
    const fit = bboxFitting([{ lat: c.bounds.minLat, lng: c.bounds.minLng }, { lat: c.bounds.maxLat, lng: c.bounds.maxLng }]);
    if (fit) void load(activeFilter, { area: fit });
  };

  const toggleOpen = async (next: boolean) => {
    setOpenBusy(true);
    const r = await setOpenToHellos(next);
    setOpenBusy(false);
    if (!r.error && r.data) { setOpenState(r.data); setKnownOpen(r.data.open); }
  };

  const openArea = () => {
    if (!bbox) return;
    router.push({ pathname: '/map/place', params: { label: t('map.browsing.thisArea'), ...bboxToParams(bbox) } });
  };

  const banner = useMemo(() => (locationBanner && !bannerDismissed ? locationBanner : null), [locationBanner, bannerDismissed]);

  // Search overlay (SN-32)
  if (isSearching) {
    return (
      <View style={styles.container}>
        <StatusBarSpacer height={44} />
        <View style={styles.searchHeader}>
          <View style={styles.searchInputActive}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInputText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('map.search.placeholder')}
              placeholderTextColor={Colors.Muted}
              autoFocus
              accessibilityLabel={t('map.search.placeholder')}
              testID="map-search-input"
            />
          </View>
          <TouchableOpacity onPress={() => setIsSearching(false)} accessibilityRole="button">
            <Text style={styles.cancelButton}>{t('map.search.cancel')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
          <View style={styles.searchSection}>
            <Text style={styles.searchSectionHeader}>{t('map.search.sectionsPlaces')}</Text>
            {results?.places.configured ? (
              results.places.error ? <Text style={styles.searchNote}>{t('map.search.placesError')}</Text>
                : results.places.results.length === 0 ? <Text style={styles.searchNote}>{t('map.search.noPlaces')}</Text>
                : results.places.results.map((pl, i) => (
                  <TouchableOpacity key={`pl-${i}`} style={styles.searchNoteRow} onPress={() => goTo(pl.lat, pl.lng)} accessibilityRole="button">
                    <Text style={styles.searchSectionHeader}>{pl.name}</Text>
                    <Text style={styles.searchNote}>{pl.address}</Text>
                  </TouchableOpacity>
                ))
            ) : <Text style={styles.searchNote}>{t('map.search.placesUnavailable')}</Text>}
          </View>

          <View style={styles.searchSection}>
            <Text style={styles.searchSectionHeader}>{t('map.search.sectionsHangouts')}</Text>
            {searchState === 'idle' && searchQuery.trim().length > 0 ? <Text style={styles.searchNote}>{t('map.search.typeMore')}</Text> : null}
            {searchState === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
            {searchState === 'error' ? (
              <TouchableOpacity onPress={() => setSearchNonce(n => n + 1)} accessibilityRole="button">
                <Text accessibilityRole="alert" style={styles.searchNote}>{searchError} {t('map.common.retry')}</Text>
              </TouchableOpacity>
            ) : null}
            {searchState === 'done' && results && results.hangouts.length === 0 && results.hootzas.length === 0 ? <Text style={styles.searchNote}>{t('map.search.noResults')}</Text> : null}
            {(results?.hangouts ?? []).map(h => (
              <HangoutRow key={h.id} hangout={h} onPress={() => openHangoutArea(h)} />
            ))}
          </View>

          {results && results.hootzas.length > 0 ? (
            <View style={styles.searchSection}>
              <Text style={styles.searchSectionHeader}>{t('map.search.sectionsHootzas')}</Text>
              {results.hootzas.map(h => (
                <TouchableOpacity key={h.id} style={styles.searchNoteRow} onPress={() => { setIsSearching(false); router.push({ pathname: '/(hootzas)/[id]', params: { id: h.id } }); }} accessibilityRole="button">
                  <Text style={styles.searchSectionHeader}>{h.title}</Text>
                  {h.locationName ? <Text style={styles.searchNote}>{h.locationName}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {recent.length > 0 ? (
            <View style={[styles.searchSection, styles.recentSection]}>
              <Text style={styles.searchSectionHeader}>{t('map.search.sectionsRecent')}</Text>
              {recent.map(h => (
                <HangoutRow key={`r-${h.id}`} hangout={h} onPress={() => openHangoutArea(h)} />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, wide && { flexDirection: 'row' }]}>
      <View style={styles.mapContainer}>
        <MapView
          bbox={bbox}
          pins={[]}
          hangouts={[]}
          items={items}
          clusters={clusters}
          selectedPinId={selectedPinId}
          onItemPress={openItem}
          onClusterPress={openCluster}
          basemapNote={basemapNote}
          basemapConfigured={basemapConfigured}
          onViewportChange={moveViewport}
        />
        {items.length > 0 ? <CoachMark id="map-neighborhood" title={t('s2c.coach.title')} body={t('s2c.coach.body')} bottom={96} /> : null}

        <StatusBarSpacer height={44} />

        {/* Search bar and filters (SN-31) */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => { setSearchQuery(''); setResults(null); setSearchState('idle'); setIsSearching(true); }}
            accessibilityRole="button"
            accessibilityLabel={t('map.search.placeholder')}
            testID="search-bar"
          >
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchPlaceholder}>{t('map.search.placeholder')}</Text>
          </TouchableOpacity>

          <ScrollView horizontal style={styles.filtersScroll} contentContainerStyle={styles.filtersContent} showsHorizontalScrollIndicator={false}>
            {FILTERS.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => void load(filter, { ask: filter === 'nearMe' })}
                accessibilityRole="button"
                accessibilityState={{ selected: activeFilter === filter }}
              >
                <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                  {t(`map.filters.${filter}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {banner ? (
            <View style={styles.banner} testID="location-banner">
              <Text style={styles.bannerText}>{t('map.browsing.locationOff')}</Text>
              <View style={styles.bannerActions}>
                <TouchableOpacity
                  onPress={() => (banner === 'blocked' ? void Linking.openSettings().catch(() => undefined) : void load('nearMe', { ask: true }))}
                  accessibilityRole="button"
                >
                  <Text style={styles.bannerAction}>
                    {t(banner === 'blocked' ? 'map.browsing.openSettings' : 'map.browsing.allowLocation')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBannerDismissed(true)} accessibilityRole="button">
                  <Text style={styles.bannerDismiss}>{t('map.browsing.dismiss')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {viewState === 'loading' ? (
          <View style={styles.centerOverlay}>
            <ActivityIndicator size="large" color={Colors.Ink} testID="loading-indicator" />
          </View>
        ) : null}
      </View>

      {/* Bottom sheet on a phone; a fixed side panel from tablet, so the map is never covered and the tapped pin
          stays visible beside its own detail ("Map and Pins": Pin sheet · tablet 356 / desktop 420). */}
      <View style={wide ? { width: panelWidth, backgroundColor: Colors.Chalk, borderLeftWidth: 1, borderLeftColor: Colors.Line } : undefined} testID={wide ? 'map-side-panel' : undefined}>
      {selectedPinId ? (
        <PinSheet pinId={selectedPinId} onClose={() => { ++pinRequestGeneration.current; setSelectedPinId(null); }} panel={wide} />
      ) : (
        <View style={wide ? styles.sidePanelBody : styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          {viewState === 'error' ? (
            <View style={styles.sheetBlock}>
              <Text style={styles.errorMessage} accessibilityRole="alert">{errorMessage || t('map.common.failed')}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void load(activeFilter)} accessibilityRole="button" testID="retry-button">
                <Text style={styles.retryButtonText}>{t('map.common.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : viewState === 'needArea' ? (
            <Text style={styles.sheetBody}>{t('map.browsing.needArea')}</Text>
          ) : viewState === 'mineEmpty' ? (
            <View style={styles.sheetBlock} testID="mine-empty">
              <Waverly size={56} color={Colors.Faint} />
              <Text style={styles.emptyTitle}>{t('map.browsing.mineEmptyTitle')}</Text>
              <Text style={styles.sheetBody}>{t('map.browsing.mineEmptyBody')}</Text>
            </View>
          ) : viewState === 'data' ? (
            <>
              {truncated ? <Text style={styles.sheetBody}>{t('map.browsing.truncated')}</Text> : null}
              {bbox ? (
                <TouchableOpacity style={styles.areaButton} onPress={openArea} accessibilityRole="button" testID="see-area">
                  <Text style={styles.areaButtonText}>{t('map.browsing.seeArea')}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
          {clusterList?.members ? (
            <View style={styles.sheetBlock} testID="cluster-list">
              {clusterList.members.map((m) => (
                <TouchableOpacity key={`${m.kind}-${m.id}`} style={styles.searchNoteRow} onPress={() => openItem(m)} accessibilityRole="button">
                  <Text style={styles.searchSectionHeader}>{m.title ?? t(`map.kinds.${m.kind}`)}</Text>
                  <Text style={styles.searchNote}>{t(`map.kinds.${m.kind}`)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setClusterList(null)} accessibilityRole="button">
                <Text style={styles.bannerDismiss}>{t('map.search.cancel')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.openRow} testID="open-to-hellos">
            <Text style={styles.sheetBody}>{t('map.open.label')}</Text>
            <Switch
              value={openState?.open ?? false}
              disabled={!openState || openBusy}
              onValueChange={(v) => void toggleOpen(v)}
              accessibilityLabel={t('map.open.label')}
              testID="open-to-hellos-switch"
            />
          </View>
          {openState?.open && !openState.discoveryActive ? <Text style={styles.sheetBody}>{t('map.open.notSwitchedOn')}</Text> : null}
          <Text style={styles.coachMark}>{t('map.browsing.coachMark')}</Text>
        </View>
      )}
      </View>
    </View>
  );
}

function HangoutRow({ hangout, onPress }: { hangout: MapHangout; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.placeResultRow} onPress={onPress} accessibilityRole="button" testID={`hangout-result-${hangout.id}`}>
      <View style={styles.hangoutThumbnail}>
        {hangout.founding ? <View style={styles.foundingDot} accessibilityLabel={t('map.search.founding')} /> : null}
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{hangout.name}</Text>
        <Text style={styles.placeSubtitle}>{hangout.address}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Canvas },
  mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  centerOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  searchBar: {
    backgroundColor: Colors.Chalk,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { fontSize: 18, color: Colors.Muted },
  searchPlaceholder: { fontSize: 15.5, color: Colors.Muted },
  filtersScroll: { flexGrow: 0 },
  filtersContent: { gap: 8 },
  filterChip: { backgroundColor: Colors.Chalk, borderRadius: 22, paddingHorizontal: 15, minHeight: 44, justifyContent: 'center' },
  filterChipActive: { backgroundColor: Colors.Ink },
  filterChipText: { fontSize: 13.5, fontWeight: '600', color: Colors.Ink },
  filterChipTextActive: { color: Colors.Chalk },
  banner: { backgroundColor: Colors.Chalk, borderRadius: 14, padding: 14, gap: 10 },
  bannerText: { fontSize: 14, lineHeight: 20, color: Colors.Ink },
  bannerActions: { flexDirection: 'row', gap: 18 },
  bannerAction: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  bannerDismiss: { fontSize: 14, color: Colors.Muted },
  bottomSheet: {
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  sidePanelBody: { flex: 1, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 24, gap: 14 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.Line, alignSelf: 'center' },
  sheetBlock: { alignItems: 'center', gap: 10 },
  sheetBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  errorMessage: { fontSize: 15, lineHeight: 22, color: Colors.Ink, textAlign: 'center' },
  retryButton: { borderWidth: 1, borderColor: Colors.Ink, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 12 },
  retryButtonText: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  areaButton: { backgroundColor: Colors.Ink, borderRadius: 26, height: 50, alignItems: 'center', justifyContent: 'center' },
  areaButtonText: { fontSize: 16, fontWeight: '700', color: Colors.Chalk },
  coachMark: { fontSize: 13, lineHeight: 19, color: Colors.Muted, textAlign: 'center' },
  // Search overlay
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, backgroundColor: Colors.Chalk },
  searchInputActive: { flex: 1, backgroundColor: '#F2EFEB', borderRadius: 12, height: 46, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  searchInputText: { flex: 1, fontSize: 16, color: Colors.Ink },
  cancelButton: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  searchResults: { flex: 1, backgroundColor: Colors.Chalk, paddingHorizontal: 16 },
  searchSection: { paddingBottom: 18, gap: 2 },
  recentSection: {},
  searchSectionHeader: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700', paddingBottom: 6 },
  searchNoteRow: { paddingVertical: 4 },
  openRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  searchNote: { fontSize: 14, lineHeight: 20, color: Colors.Muted, paddingVertical: 6 },
  placeResultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderColor: '#F0EDE9' },
  hangoutThumbnail: {
    width: 24,
    height: 24,
    borderWidth: 2.5,
    borderColor: Colors.Fern,
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  foundingDot: { position: 'absolute', top: -7, right: -7, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.Amber, borderWidth: 2, borderColor: Colors.Chalk },
  placeInfo: { flex: 1, gap: 2 },
  placeName: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  placeSubtitle: { fontSize: 13.5, color: Colors.Muted },
});
