/**
 * HELLO MAP — PLACE DETAIL SCREEN
 *
 * Shows stats and details for a city/location.
 * Reached by searching and tapping a place with Hellos count > 0.
 *
 * Design: Separate navigated screen with back arrow.
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';

export default function PlaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    totalHellos: string;
    thisMonth: string;
    hangoutsCount: string;
    yoursCount: string;
  }>();

  const totalHellos = parseInt(params.totalHellos || '0', 10);
  const thisMonth = parseInt(params.thisMonth || '0', 10);
  const hangoutsCount = parseInt(params.hangoutsCount || '0', 10);
  const yoursCount = parseInt(params.yoursCount || '0', 10);

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{params.name}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Big count */}
        <View style={styles.bigCount}>
          <Text style={styles.bigCountNumber} testID="place-total-count">{totalHellos.toLocaleString()}</Text>
          <Text style={styles.bigCountLabel} testID="place-hellos-label">Hellos</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{thisMonth}</Text>
            <Text style={styles.statLabel}>{t('map.place.statsThisMonth')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{hangoutsCount}</Text>
            <Text style={styles.statLabel}>{t('map.place.statsHangouts')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{yoursCount}</Text>
            <Text style={styles.statLabel}>{t('map.place.statsYours')}</Text>
          </View>
        </View>

        {/* Mini map */}
        <View style={styles.miniMap}>
          <View style={styles.miniMapGrid} />
          {/* Mock cluster pins */}
          <View style={[styles.miniCluster, { top: 40, left: 70, width: 30, height: 30 }]}>
            <Text style={[styles.miniClusterText, { fontSize: 12 }]}>47</Text>
          </View>
          <View style={[styles.miniCluster, { top: 88, left: 190, width: 26, height: 26 }]}>
            <Text style={[styles.miniClusterText, { fontSize: 11 }]}>22</Text>
          </View>
          <View style={[styles.miniCluster, { top: 30, left: 250, width: 22, height: 22 }]}>
            <Text style={[styles.miniClusterText, { fontSize: 10 }]}>9</Text>
          </View>
        </View>

        {/* Recent selfies */}
        <View style={styles.recentSection}>
          <Text style={styles.recentHeader}>{t('map.place.sectionRecent')}</Text>
          <View style={styles.recentGrid}>
            <View style={styles.recentSelfie} />
            <View style={styles.recentSelfie} />
            <View style={styles.recentSelfie} />
            <View style={styles.recentSelfie} />
            <View style={styles.recentSelfie} />
            <View style={styles.recentSelfie} />
          </View>
        </View>
      </ScrollView>

      {/* Open on map button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.openMapButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.openMapButtonText}>
            {t('map.place.openOnMap')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  statusBar: {
    height: 44,
  },
  header: {
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
  headerTitle: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 22,
    gap: 18,
  },
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
  miniCluster: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: Colors.HelloBlue,
    borderWidth: 2,
    borderColor: Colors.Chalk,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniClusterText: {
    fontFamily: 'Assistant',
    fontWeight: '700',
    color: Colors.Chalk,
  },
  recentSection: {
    gap: 10,
  },
  recentHeader: {
    fontFamily: 'Assistant',
    fontSize: 12,
    letterSpacing: 0.14 * 12,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '600',
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentSelfie: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: Colors.Hairline,
  },
  footer: {
    padding: 18,
    paddingTop: 18,
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
});
