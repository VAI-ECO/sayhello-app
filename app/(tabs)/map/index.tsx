/**
 * HELLO MAP — BROWSING SCREEN
 *
 * The main map view with persistent bottom sheet.
 *
 * States:
 * - Search overlay (isSearching boolean)
 * - Bottom sheet content (selectedPin null = overview, not null = pin detail)
 *
 * Navigation:
 * - Place results → /map/place
 * - Empty places → /map/empty
 *
 * DESIGN NOTES:
 * - Bottom sheet is ALWAYS present, changes content when pin tapped
 * - Pin sheet is NOT a separate screen - it's the expanded bottom sheet
 * - Map stays visible behind sheet, selected pin keeps pulsing
 * - Search is modal overlay, dismissed by Cancel button
 *
 * ⚠️ NEVER state a distance (RULES 8.12)
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import {
  mockHelloPins,
  mockHelloClusters,
  mockPlaceResults,
  mockHangoutResults,
  mockRecentSearches,
  type HelloPin,
  type PlaceSearchResult,
} from '../../../src/data/mockMapData';

type FilterType = 'nearMe' | 'mine' | 'helloHangouts' | 'thisYear';

export default function MapBrowsingScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('nearMe');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPin, setSelectedPin] = useState<HelloPin | null>(null);

  // For demo: location and count for bottom sheet overview
  const currentLocationName = 'Nashville, Tennessee';
  const currentHellosCount = 1204;

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    setIsSearching(false);
    if (place.hellosCount === null || place.hellosCount === 0) {
      // Navigate to empty state
      router.push({
        pathname: '/map/empty',
        params: { locationName: place.name },
      });
    } else {
      // Navigate to place detail
      router.push({
        pathname: '/map/place',
        params: {
          name: place.name,
          totalHellos: place.hellosCount.toString(),
          thisMonth: '31',
          hangoutsCount: '18',
          yoursCount: '6',
        },
      });
    }
  };

  // Search overlay
  if (isSearching) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />

        {/* Search header */}
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
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsSearching(false)}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButton}>{t('map.search.cancel')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search results */}
        <ScrollView style={styles.searchResults}>
          {/* Places section */}
          <View style={styles.searchSection}>
            <Text style={styles.searchSectionHeader}>
              {t('map.search.sectionsPlaces')}
            </Text>
            {mockPlaceResults.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeResultRow}
                onPress={() => handlePlaceSelect(place)}
                accessibilityRole="button"
              >
                <Text style={styles.placeIcon}>◉</Text>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeSubtitle}>{place.subtitle}</Text>
                </View>
                <Text
                  style={[
                    styles.placeCount,
                    place.hellosCount === null && styles.placeCountNull,
                  ]}
                >
                  {place.hellosCount !== null
                    ? `${place.hellosCount} Hellos`
                    : '— Hellos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hello Hangouts section */}
          <View style={styles.searchSection}>
            <Text style={styles.searchSectionHeader}>
              {t('map.search.sectionsHangouts')}
            </Text>
            {mockHangoutResults.map((hangout) => (
              <TouchableOpacity
                key={hangout.id}
                style={styles.placeResultRow}
                accessibilityRole="button"
              >
                <View style={styles.hangoutThumbnail} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{hangout.name}</Text>
                  <Text style={styles.placeSubtitle}>{hangout.address}</Text>
                </View>
                {hangout.hasGoldenIcon && <Text style={styles.goldenIcon}>⭐</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent searches */}
          <View style={[styles.searchSection, styles.recentSection]}>
            <Text style={styles.searchSectionHeader}>
              {t('map.search.sectionsRecent')}
            </Text>
            <View style={styles.recentChips}>
              {mockRecentSearches.map((search, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.recentChip}
                  accessibilityRole="button"
                >
                  <Text style={styles.recentChipText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Browsing view with map and bottom sheet
  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Map area with placeholder */}
      <View style={styles.mapContainer}>
        {/* Placeholder basemap - REPLACE WITH ACTUAL MAP TILE LAYER */}
        <View style={styles.placeholderMap}>
          <View style={styles.gridOverlay} />
          <Text style={styles.placeholderText}>REPLACE WITH MAP TILE LAYER</Text>

          {/* Mock pins - in production these would be map markers */}
          <TouchableOpacity
            style={[
              styles.pinTeardrop,
              { top: 250, left: 96, backgroundColor: '#D81B60' },
            ]}
            onPress={() => setSelectedPin(mockHelloPins[0])}
            testID="pin-1"
            accessibilityRole="button"
            accessibilityLabel={`Pin for ${mockHelloPins[0].person1Name} and ${mockHelloPins[0].person2Name}`}
          />
          <TouchableOpacity
            style={[
              styles.pinTeardrop,
              { top: 592, left: 244, backgroundColor: '#D81B60' },
            ]}
            onPress={() => setSelectedPin(mockHelloPins[1])}
            testID="pin-2"
            accessibilityRole="button"
            accessibilityLabel={`Pin for ${mockHelloPins[1].person1Name} and ${mockHelloPins[1].person2Name}`}
          />
          <TouchableOpacity
            style={[
              styles.pinTeardrop,
              { top: 500, left: 288, backgroundColor: '#FB8C00' },
            ]}
            onPress={() => setSelectedPin(mockHelloPins[2])}
            testID="pin-3"
            accessibilityRole="button"
            accessibilityLabel={`Pin for ${mockHelloPins[2].person1Name} and ${mockHelloPins[2].person2Name}`}
          />

          {/* Mock clusters */}
          <View style={[styles.clusterBadge, { top: 250, left: 62 }]}>
            <Text style={styles.clusterCount}>12</Text>
          </View>
          <View style={[styles.clusterBadge, { top: 372, left: 218 }]}>
            <Text style={styles.clusterCount}>7</Text>
          </View>
        </View>

        {/* Search bar and filters */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => setIsSearching(true)}
            accessibilityRole="button"
            accessibilityLabel={t('map.search.placeholder')}
            testID="search-bar"
          >
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchPlaceholder}>
              {t('map.search.placeholder')}
            </Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
            showsHorizontalScrollIndicator={false}
          >
            {(['nearMe', 'mine', 'helloHangouts', 'thisYear'] as FilterType[]).map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeFilter === filter }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === filter && styles.filterChipTextActive,
                    ]}
                  >
                    {t(`map.filters.${filter}`)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
      </View>

      {/* Bottom sheet - ALWAYS PRESENT, content changes based on selectedPin */}
      <View
        style={[
          styles.bottomSheet,
          selectedPin !== null && styles.bottomSheetExpanded,
        ]}
      >
        <View style={styles.sheetHandle} />

        {selectedPin === null ? (
          // Overview mode - shows location summary
          <>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {currentHellosCount}{' '}
                <Text style={styles.sheetTitleHello}>Hellos</Text>
              </Text>
              <Text style={styles.sheetLocation}>{currentLocationName}</Text>
            </View>

            <ScrollView
              horizontal
              style={styles.selfieScroll}
              contentContainerStyle={styles.selfieScrollContent}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.selfiePlaceholder} />
              <View style={styles.selfiePlaceholder} />
              <View style={styles.selfiePlaceholder} />
              <View style={styles.selfieMore}>
                <Text style={styles.selfieMoreText}>+44</Text>
              </View>
            </ScrollView>

            <Text style={styles.coachMark}>{t('map.browsing.coachMark')}</Text>
          </>
        ) : (
          // Pin detail mode - shows selected pin's info
          <>
            {/* Selfie photo */}
            <View style={styles.pinSelfieContainer}>
              <View style={styles.pinSelfie} />
            </View>

            {/* Names with Waverly hand */}
            <View style={styles.pinNames}>
              <Text style={styles.pinName}>{selectedPin.person1Name}</Text>
              <Text style={styles.pinHand}>👋</Text>
              <Text style={styles.pinName}>{selectedPin.person2Name}</Text>
            </View>

            {/* Detail rows */}
            <View style={styles.pinDetails}>
              <View style={styles.pinDetailRow}>
                <Text style={styles.pinDetailLabel}>
                  {t('map.pinSheet.labelWhere')}
                </Text>
                <Text style={styles.pinDetailValue}>
                  {selectedPin.locationName}
                </Text>
              </View>
              <View style={styles.pinDetailRow}>
                <Text style={styles.pinDetailLabel}>
                  {t('map.pinSheet.labelWhen')}
                </Text>
                <Text style={styles.pinDetailValue}>
                  {new Date(selectedPin.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'UTC',
                  })}
                </Text>
              </View>
              <View style={styles.pinDetailRow}>
                <Text style={styles.pinDetailLabel}>
                  {t('map.pinSheet.labelPinNumber')}
                </Text>
                <Text style={styles.pinDetailValue}>
                  {selectedPin.pinNumber}
                </Text>
              </View>
            </View>

            {/* Permanence note */}
            <Text style={styles.permanenceNote}>
              {t('map.pinSheet.permanence')}
            </Text>

            {/* Share and Report buttons */}
            <View style={styles.pinActions}>
              <TouchableOpacity
                style={styles.pinActionButton}
                accessibilityRole="button"
              >
                <Text style={styles.pinActionButtonText}>
                  {t('map.pinSheet.share')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinActionButton}
                accessibilityRole="button"
              >
                <Text style={styles.pinActionButtonText}>
                  {t('map.pinSheet.report')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Canvas,
  },
  statusBar: {
    height: 44,
    backgroundColor: 'transparent',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  placeholderMap: {
    flex: 1,
    backgroundColor: Colors.Canvas,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.Line,
  },
  placeholderText: {
    fontFamily: 'Assistant',
    fontSize: 13,
    color: Colors.Muted,
    letterSpacing: 0.5,
  },
  pinTeardrop: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
    borderWidth: 2,
    borderColor: Colors.Chalk,
    shadowColor: Colors.Ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  clusterBadge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.HelloBlue,
    borderWidth: 3,
    borderColor: Colors.Chalk,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.Ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  clusterCount: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.Chalk,
  },
  searchContainer: {
    position: 'absolute',
    top: 44,
    left: 18,
    right: 18,
    gap: 8,
  },
  searchBar: {
    backgroundColor: Colors.Chalk,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 28,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
    shadowColor: Colors.Ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  searchIcon: {
    fontSize: 16,
    color: Colors.Faint,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Faint,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: 7,
  },
  filterChip: {
    backgroundColor: Colors.Chalk,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: Colors.Ink,
    borderColor: Colors.Ink,
  },
  filterChipText: {
    fontFamily: 'Assistant',
    fontSize: 13,
    color: Colors.Ink,
  },
  filterChipTextActive: {
    color: Colors.Chalk,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.Ink,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 30,
    gap: 12,
  },
  bottomSheetExpanded: {
    top: 250,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Line,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: 'Assistant',
    fontSize: 21,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.015,
  },
  sheetTitleHello: {
    fontFamily: 'Dreaming',
    fontSize: 27,
  },
  sheetLocation: {
    fontFamily: 'Assistant',
    fontSize: 15,
    color: Colors.Muted,
  },
  selfieScroll: {
    flexGrow: 0,
  },
  selfieScrollContent: {
    gap: 8,
  },
  selfiePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.Hairline,
  },
  selfieMore: {
    flex: 1,
    minWidth: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.Bone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieMoreText: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Muted,
  },
  coachMark: {
    fontFamily: 'Assistant',
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: Colors.Muted,
  },
  pinSelfieContainer: {
    marginTop: 8,
  },
  pinSelfie: {
    height: 250,
    borderRadius: 14,
    backgroundColor: Colors.Hairline,
  },
  pinNames: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pinName: {
    fontFamily: 'Assistant',
    fontSize: 19,
    fontWeight: '600',
    color: Colors.Ink,
  },
  pinHand: {
    fontSize: 21,
  },
  pinDetails: {
    backgroundColor: Colors.Hairline,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
    gap: 1,
  },
  pinDetailRow: {
    backgroundColor: Colors.Chalk,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pinDetailLabel: {
    fontFamily: 'Assistant',
    fontSize: 15,
    color: Colors.Muted,
  },
  pinDetailValue: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.Ink,
  },
  permanenceNote: {
    fontFamily: 'Assistant',
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: Colors.Faint,
  },
  pinActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pinActionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 28,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinActionButtonText: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.Ink,
  },
  // Search overlay styles
  searchHeader: {
    paddingHorizontal: 18,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputActive: {
    flex: 1,
    backgroundColor: Colors.Bone,
    borderWidth: 1,
    borderColor: Colors.Ink,
    borderRadius: 28,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  searchInputText: {
    flex: 1,
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Ink,
  },
  cancelButton: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.Muted,
  },
  searchResults: {
    flex: 1,
    paddingTop: 18,
  },
  searchSection: {
    gap: 2,
    marginBottom: 18,
  },
  searchSectionHeader: {
    paddingHorizontal: 22,
    paddingBottom: 8,
    fontFamily: 'Assistant',
    fontSize: 12,
    letterSpacing: 0.14 * 12,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '600',
  },
  placeResultRow: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  placeIcon: {
    fontSize: 19,
    color: Colors.Faint,
    width: 20,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.Ink,
  },
  placeSubtitle: {
    fontFamily: 'Assistant',
    fontSize: 13,
    color: Colors.Faint,
  },
  placeCount: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.HelloBlue,
  },
  placeCountNull: {
    color: Colors.Faint,
  },
  hangoutThumbnail: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.Hairline,
  },
  goldenIcon: {
    fontSize: 13,
  },
  recentSection: {
    paddingHorizontal: 22,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  recentChip: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  recentChipText: {
    fontFamily: 'Assistant',
    fontSize: 15,
    color: Colors.Ink,
  },
  // Modal overlay styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.Chalk,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  modalHeader: {
    paddingVertical: 4,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.Ink,
  },
  modalHeaderTitle: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 22,
    gap: 18,
  },
  // Place detail styles
  bigCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  bigCountNumber: {
    fontFamily: 'Assistant',
    fontSize: 54,
    lineHeight: 54 * 0.9,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.04 * 54,
  },
  bigCountLabel: {
    fontFamily: 'Dreaming',
    fontSize: 34,
    lineHeight: 34,
    color: Colors.Ink,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 1,
    backgroundColor: Colors.Hairline,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.Chalk,
    paddingVertical: 12,
    gap: 2,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Assistant',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.Ink,
  },
  statLabel: {
    fontFamily: 'Assistant',
    fontSize: 12,
    color: Colors.Muted,
  },
  miniMap: {
    height: 150,
    borderRadius: 14,
    backgroundColor: Colors.Canvas,
    position: 'relative',
    overflow: 'hidden',
  },
  miniMapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  placeRecentSection: {
    gap: 10,
  },
  placeRecentHeader: {
    fontFamily: 'Assistant',
    fontSize: 12,
    letterSpacing: 0.14 * 12,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '600',
  },
  placeRecentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  placeRecentSelfie: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: Colors.Hairline,
  },
  modalFooter: {
    padding: 18,
    paddingBottom: 30,
  },
  openMapButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapButtonText: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Chalk,
  },
  // Empty state styles
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 34,
    gap: 18,
  },
  waverlyContainer: {
    opacity: 0.13,
  },
  emptyTitle: {
    fontFamily: 'Assistant',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.015,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'Assistant',
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: Colors.Muted,
    textAlign: 'center',
  },
  helloButton: {
    backgroundColor: Colors.Magenta,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  helloButtonText: {
    fontFamily: 'Assistant',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Chalk,
  },
  helloButtonHello: {
    fontFamily: 'Dreaming',
    fontSize: 21,
  },
});
