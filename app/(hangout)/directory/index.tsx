/**
 * HELLO HANGOUT DIRECTORY — CANON-RL-02-SN-07 (listing), SN-11 (filters),
 * SN-12 (no results). Hangout Directory.dc.html P 375 7a · T 834 7b · D 5a/5e/5f.
 *
 * GET /directory/hangouts: active (paid) Hello Hangouts, searched by name or
 * street — never people. Sorts: Most Hellos · Closest · Newest · A–Z. Filters
 * built: Open right now (published hours, the viewer's local time §17.17), Has a
 * discount today, Founding Hello Hangouts only.
 *
 * Stage 04: every filter (incl. Open right now) and the sort run on the server BEFORE
 * the page is cut; the screen shows "Showing N of TOTAL" and pages with a cursor; a
 * List/Map toggle draws the same results. City filters on the address text.
 * Not built, recorded: the Distance radius chips (no MONEY figure),
 * the city picker (no geocoding provider), distance on each card (§8.12 — the
 * Hello Hangout tests assert none is shown), photos (no business-photo field).
 * "Most Hellos" falls back to Newest while the server cannot link a hello to a
 * Hello Hangout, and the screen says so.
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
  Switch,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Waverly } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { listDirectory, type DirectoryRow, type DirectorySort } from '../../../src/api/directory';
import { MapCanvas } from '../../../src/components/map/MapCanvas';
import { bboxFitting } from '../../../src/lib/map-geo';
import { openState, clock } from '../../../src/lib/hangout-hours';
import { FoundingBadge } from '../../../src/components/hangout/FoundingBadge';
import { listCategories, type CategoryNode } from '../../../src/api/hangout-business';

const PINK = '#E848D0';
const SORTS: DirectorySort[] = ['hellos', 'closest', 'newest', 'az'];
const SORT_LABEL: Record<DirectorySort, string> = {
  hellos: 'hangout.directory.sortHellos',
  closest: 'hangout.directory.sortClosest',
  newest: 'hangout.directory.sortNewest',
  az: 'hangout.directory.sortAz',
};

interface Filters { openNow: boolean; discountToday: boolean; founding: boolean }
type ViewMode = 'list' | 'map';
const NO_FILTERS: Filters = { openNow: false, discountToday: false, founding: false };

export default function HangoutDirectoryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width >= 1024 ? 3 : width >= 600 ? 2 : 1;
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<DirectorySort | undefined>(undefined);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draftFilters, setDraftFilters] = useState<Filters>(NO_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [applied, setApplied] = useState<DirectorySort>('newest');
  const [hellosAvailable, setHellosAvailable] = useState(true);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [notice, setNotice] = useState<string | null>(null);
  // §18.1 stage 2: categories that at least one live Hello Hangout carries (§18.2: no empty categories).
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [city, setCity] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const gen = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const mine = ++gen.current;
    if (asRefresh) setRefreshing(true);
    const res = await listDirectory({
      q: query.trim() || undefined,
      sort,
      founding: filters.founding,
      discountToday: filters.discountToday,
      openNow: filters.openNow,
      city: city.trim() || undefined,
      category,
      ...(sort === 'closest' && coords ? coords : {}),
    });
    if (mine !== gen.current) return;
    setRefreshing(false);
    if (res.error || !res.data) {
      setState('error');
      return;
    }
    setRows(res.data.hangouts);
    setTotal(res.data.total);
    setNextCursor(res.data.nextCursor);
    setApplied(res.data.sort);
    setHellosAvailable(res.data.hellosAvailable);
    setState('ready');
  }, [query, sort, filters.founding, filters.discountToday, filters.openNow, city, coords, category]);

  // The next page of the same filters/sort; rows already shown stay (a cursor never repeats or skips a row).
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    const mine = gen.current;
    setLoadingMore(true);
    const res = await listDirectory({
      q: query.trim() || undefined, sort, founding: filters.founding, discountToday: filters.discountToday,
      openNow: filters.openNow, city: city.trim() || undefined, category, cursor: nextCursor,
      ...(sort === 'closest' && coords ? coords : {}),
    });
    setLoadingMore(false);
    if (mine !== gen.current || res.error || !res.data) return;
    setRows((prev) => [...prev, ...res.data!.hangouts.filter((h) => !prev.some((p) => p.id === h.id))]);
    setNextCursor(res.data.nextCursor);
    setTotal(res.data.total);
  }, [nextCursor, loadingMore, query, sort, filters, city, category, coords]);

  useEffect(() => {
    void listCategories(true).then((res) => { if (!res.error) setCategories(res.data?.categories ?? []); });
  }, []);

  // Search is debounced; everything else reloads at once.
  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);
  // Returning to the screen refreshes (a page may have been published meanwhile).
  // The first focus is the mount, which the effect above already loads.
  const loadRef = useRef(load);
  loadRef.current = load;
  const focusedOnce = useRef(false);
  useFocusEffect(useCallback(() => {
    if (!focusedOnce.current) { focusedOnce.current = true; return; }
    void loadRef.current();
  }, []));

  async function chooseSort(next: DirectorySort) {
    setNotice(null);
    if (next === 'closest' && !coords) {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted) { setNotice(t('hangout.directory.locationNeeded')); return; }
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setNotice(t('hangout.directory.locationNeeded'));
        return;
      }
    }
    setSort(next);
  }

  // Every filter, including Open right now, is applied by the server before the page is cut.
  const shown = rows;
  const mapItems = useMemo(() => shown.map((r) => ({
    kind: 'hangout' as const, id: r.id, lat: r.lat, lng: r.lng, title: r.name, founding: r.founding,
    destination: { type: 'directory' as const, id: r.id },
  })), [shown]);
  const mapBbox = useMemo(() => bboxFitting(shown.map((r) => ({ lat: r.lat, lng: r.lng }))), [shown]);
  const activeFilterCount = Object.values(filters).filter(Boolean).length + (city.trim() ? 1 : 0);
  const searching = Boolean(query.trim()) || activeFilterCount > 0;
  const currentSort = sort ?? applied;

  if (showFilters) {
    const unchanged = JSON.stringify(draftFilters) === JSON.stringify(filters) && draftCity.trim() === city.trim();
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <ScrollView contentContainerStyle={styles.filterSheet}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>{t('hangout.directory.filtersTitle')}</Text>
            <TouchableOpacity onPress={() => { setDraftFilters(NO_FILTERS); setDraftCity(''); }} accessibilityRole="button">
              <Text style={styles.clearAll}>{t('hangout.directory.clearAll')}</Text>
            </TouchableOpacity>
          </View>
          {([
            ['openNow', 'hangout.directory.openNow'],
            ['discountToday', 'hangout.directory.discountToday'],
            ['founding', 'hangout.directory.foundingOnly'],
          ] as const).map(([key, label]) => (
            <View key={key} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t(label)}</Text>
              <Switch
                value={draftFilters[key]}
                onValueChange={(v) => setDraftFilters((f) => ({ ...f, [key]: v }))}
                accessibilityLabel={t(label)}
                testID={`filter-${key}`}
              />
            </View>
          ))}
          <View style={styles.toggleRow}>
            <TextInput
              style={styles.cityInput}
              value={draftCity}
              onChangeText={setDraftCity}
              placeholder={t('hangout.directory.cityPlaceholder')}
              placeholderTextColor="#7A756C"
              accessibilityLabel={t('hangout.directory.cityPlaceholder')}
              testID="filter-city"
            />
          </View>
          <TouchableOpacity
            style={styles.pinkButton}
            onPress={() => { setFilters(draftFilters); setCity(draftCity); setShowFilters(false); }}
            accessibilityRole="button"
            testID="filters-apply"
          >
            <Text style={styles.pinkButtonText}>{unchanged ? t('hangout.directory.showN', { n: total }) : t('hangout.directory.showResults')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
            <Text style={styles.back}>{t('hangout.listing.back')}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => router.push('/(hangout)/directory/saved')} accessibilityRole="button" testID="directory-saved">
              <Text style={styles.mapLink}>{t('hangoutBiz.saved.title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode((m) => (m === 'list' ? 'map' : 'list'))} accessibilityRole="button" accessibilityState={{ selected: viewMode === 'map' }} testID="directory-map-toggle">
              <Text style={styles.mapLink}>{t(viewMode === 'list' ? 'hangout.directory.showOnMap' : 'hangout.directory.showList')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/map')} accessibilityRole="button" testID="directory-map">
              <Text style={styles.mapLink}>{t('hangout.directory.theMap')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.heading, width >= 600 && styles.headingWide]}>{t('hangout.directory.heading')}</Text>
        {state === 'ready' ? (
          <Text style={styles.subline} testID="directory-count">
            {t('hangout.directory.countLine', { n: shown.length })} {t('hangout.directory.sortedBy', { sort: t(SORT_LABEL[currentSort]) })}
          </Text>
        ) : null}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('hangout.directory.searchPlaceholder')}
          placeholderTextColor="#7A756C"
          style={styles.search}
          accessibilityLabel={t('hangout.directory.searchPlaceholder')}
          autoCorrect={false}
          testID="directory-search"
        />
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => { setDraftFilters(filters); setShowFilters(true); }}
            accessibilityRole="button"
            testID="directory-filters"
          >
            <Text style={styles.filterButtonText}>{t('hangout.directory.filters')}</Text>
            {activeFilterCount > 0 ? <Text style={styles.filterBadge}>{activeFilterCount}</Text> : null}
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SORTS.filter((s) => s !== 'hellos' || hellosAvailable).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, currentSort === s && styles.chipOn]}
              onPress={() => void chooseSort(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: currentSort === s }}
              testID={`sort-${s}`}
            >
              <Text style={[styles.chipText, currentSort === s && styles.chipTextOn]}>{t(SORT_LABEL[s])}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} testID="directory-categories">
            <TouchableOpacity style={[styles.chip, !category && styles.chipOn]} onPress={() => setCategory(undefined)} accessibilityRole="button" accessibilityState={{ selected: !category }}>
              <Text style={[styles.chipText, !category && styles.chipTextOn]}>{t('hangoutBiz.directory.allCategories')}</Text>
            </TouchableOpacity>
            {categories.flatMap((c) => [c, ...c.children]).map((c) => (
              <TouchableOpacity key={c.id} style={[styles.chip, category === c.id && styles.chipOn]} onPress={() => setCategory(c.id)} accessibilityRole="button" accessibilityState={{ selected: category === c.id }} testID={`category-chip-${c.id}`}>
                <Text style={[styles.chipText, category === c.id && styles.chipTextOn]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        {!hellosAvailable ? <Text style={styles.note} testID="directory-sort-fallback">{t('hangout.directory.sortFallback')}</Text> : null}
        {notice ? <Text accessibilityRole="alert" style={styles.note}>{notice}</Text> : null}

        {state === 'loading' && rows.length === 0 ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="directory-error">
            <Text accessibilityRole="alert" style={styles.note}>{t('hangout.directory.failed')} {t('hangout.dashboard.retry')}</Text>
          </TouchableOpacity>
        ) : null}

        {state === 'ready' && shown.length === 0 ? (
          searching ? (
            <View style={styles.empty} testID="directory-no-match">
              <Text style={styles.emptyTitle}>{t('hangout.directory.noMatchTitle')}</Text>
              <Text style={styles.emptyBody}>{t('hangout.directory.noMatchBody')}</Text>
              <TouchableOpacity style={styles.outlineButton} onPress={() => { setQuery(''); setFilters(NO_FILTERS); setCity(''); setDraftCity(''); }} accessibilityRole="button">
                <Text style={styles.outlineButtonText}>{t('hangout.directory.clearFilters')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.empty} testID="directory-empty">
              <Waverly size={96} color={PINK} />
              <Text style={styles.emptyTitle}>{t('hangout.directory.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('hangout.directory.emptyBody')}</Text>
              <Text style={styles.emptyCta}>{t('hangout.directory.emptyCta')}</Text>
              <View style={styles.emptyButtons}>
                <TouchableOpacity style={styles.pinkButton} onPress={() => router.push('/(ambassador)/signup')} accessibilityRole="button" testID="directory-become-ambassador">
                  <Text style={styles.pinkButtonText}>{t('hangout.directory.becomeAmbassador')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/(refer)/hangout')} accessibilityRole="button" testID="directory-refer">
                  <Text style={styles.outlineButtonText}>{t('refer.hangout.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/map')} accessibilityRole="button" testID="directory-search-another">
                  <Text style={styles.outlineButtonText}>{t('hangout.directory.searchAnother')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : null}

        {state === 'ready' && total > 0 ? (
          <Text style={styles.note} testID="directory-total">{t('hangout.directory.showing', { shown: shown.length, total })}</Text>
        ) : null}
        {viewMode === 'map' && mapBbox ? (
          <View style={styles.mapBox} testID="directory-map-view">
            <MapCanvas
              bbox={mapBbox}
              pins={[]}
              hangouts={[]}
              items={mapItems}
              clusters={[]}
              onItemPress={(it) => router.push({ pathname: '/(hangout)/directory/[id]', params: { id: it.destination.id } })}
            />
          </View>
        ) : null}
        <View style={styles.grid}>
          {shown.map((row) => (
            <DirectoryCard
              key={row.id}
              row={row}
              columns={columns}
              onPress={() => router.push({ pathname: '/(hangout)/directory/[id]', params: { id: row.id } })}
            />
          ))}
        </View>
        {nextCursor ? (
          <TouchableOpacity style={styles.outlineButton} onPress={() => void loadMore()} disabled={loadingMore} accessibilityRole="button" testID="directory-load-more">
            {loadingMore ? <ActivityIndicator color={Colors.Ink} /> : <Text style={styles.outlineButtonText}>{t('hangout.directory.loadMore')}</Text>}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

function DirectoryCard({ row, onPress, columns }: { row: DirectoryRow; onPress: () => void; columns: number }) {
  const open = openState(row.hours);
  const statusText = open ? (open.open ? (open.closesAt ? t('hangout.directory.openUntil', { time: clock(open.closesAt) }) : t('hangout.directory.openNowLabel')) : t('hangout.directory.closedNow')) : null;
  return (
    <TouchableOpacity
      style={[styles.card, columns > 1 && { width: columns === 3 ? '31.5%' : '48%' }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={row.name}
      testID={`directory-row-${row.id}`}
    >
      <View style={styles.cardHead}>
        {row.founding ? <FoundingBadge size={44} /> : null}
        <View style={styles.cardText}>
          <Text style={styles.cardName}>{row.name}</Text>
          <Text style={styles.cardMeta}>
            {row.address}
            {statusText ? ' · ' : ''}
            {statusText ? <Text style={open?.open ? styles.openText : undefined}>{statusText}</Text> : null}
          </Text>
        </View>
        <View style={styles.cardWaverly}>
          <Waverly size={48} color={Colors.HelloBlue} />
          {/* §19.1 — the number beside Waverly at one or more, Waverly alone at zero. */}
          {row.hellos != null && row.hellos > 0 ? <Text style={styles.cardHellos}>{row.hellos.toLocaleString()}</Text> : null}
        </View>
      </View>
      {row.todayDiscount ? (
        <Text style={styles.today}><Text style={styles.todayStrong}>{t('hangout.directory.today')}</Text> {row.todayDiscount}</Text>
      ) : (
        <Text style={styles.noToday}>{t('hangout.directory.noDiscountToday')}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapBox: { height: 260, borderRadius: 14, overflow: 'hidden', marginBottom: 12, backgroundColor: '#EFEDEA' },
  cityInput: { flex: 1, fontSize: 16, color: Colors.Ink, borderWidth: 1, borderColor: '#E2DFDB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  container: { flex: 1, backgroundColor: Colors.Chalk },
  statusBar: { height: 44 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { fontSize: 24, color: Colors.Ink },
  mapLink: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  heading: { fontSize: 26, lineHeight: 26, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.9 },
  headingWide: { fontSize: 34, lineHeight: 34 },
  subline: { fontSize: 14, color: '#56534D' },
  search: { borderWidth: 1.5, borderColor: '#0A0A0A', borderRadius: 4, paddingHorizontal: 14, minHeight: 46, fontSize: 15, color: '#0A0A0A' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 4, paddingHorizontal: 16, minHeight: 46 },
  filterButtonText: { fontSize: 15, fontWeight: '700', color: '#0A0A0A' },
  filterBadge: { backgroundColor: PINK, color: '#0A0A0A', fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  chips: { gap: 7 },
  chip: { borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13 },
  chipOn: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  chipText: { fontSize: 13, color: '#0A0A0A' },
  chipTextOn: { color: '#FFFFFF', fontWeight: '700' },
  note: { fontSize: 13, lineHeight: 19, color: '#56534D' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { width: '100%', borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 10, padding: 16, gap: 12, backgroundColor: '#FFFFFF' },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  cardText: { flex: 1, gap: 2 },
  cardName: { fontSize: 20, lineHeight: 21, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.4 },
  cardMeta: { fontSize: 13, color: '#7A756C' },
  openText: { color: '#2F7A3E', fontWeight: '700' },
  cardWaverly: { alignItems: 'center', minWidth: 56 },
  cardHellos: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  today: { backgroundColor: '#FDF2FA', borderWidth: 1, borderColor: '#F3C9E8', borderRadius: 4, paddingVertical: 9, paddingHorizontal: 11, fontSize: 13, lineHeight: 18, color: '#0A0A0A', overflow: 'hidden' },
  todayStrong: { fontWeight: '800' },
  noToday: { backgroundColor: '#F5F3F0', borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 4, paddingVertical: 9, paddingHorizontal: 11, fontSize: 13, color: '#56534D', overflow: 'hidden' },
  empty: { alignItems: 'center', gap: 14, paddingVertical: 32 },
  emptyTitle: { fontSize: 28, lineHeight: 28, fontWeight: '900', color: '#0A0A0A', textAlign: 'center', letterSpacing: -1 },
  emptyBody: { fontSize: 16, lineHeight: 24, color: '#56534D', textAlign: 'center', maxWidth: 480 },
  emptyCta: { fontSize: 16, lineHeight: 24, color: '#0A0A0A', fontWeight: '700', textAlign: 'center', maxWidth: 480 },
  emptyButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pinkButton: { backgroundColor: PINK, borderRadius: 4, minHeight: 48, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  pinkButtonText: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  outlineButton: { borderWidth: 1.5, borderColor: '#0A0A0A', borderRadius: 4, minHeight: 48, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  outlineButtonText: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  filterSheet: { padding: 26, gap: 22, maxWidth: 480, width: '100%', alignSelf: 'center' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterTitle: { fontSize: 22, fontWeight: '900', color: '#0A0A0A' },
  clearAll: { fontSize: 14, color: '#56534D', textDecorationLine: 'underline' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 15, color: '#0A0A0A', flex: 1 },
});
