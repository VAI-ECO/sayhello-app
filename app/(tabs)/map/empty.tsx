/**
 * HELLO MAP — EMPTY STATE SCREEN
 *
 * Shows encouraging empty state for a location with zero Hellos.
 * Reached by searching and tapping a place with hellosCount === null or 0.
 *
 * Design: Separate navigated screen with back arrow.
 * Copy framing: positive (being first is fun), never apologetic.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Waverly } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';

export default function EmptyStateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ locationName: string }>();

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
        <Text style={styles.headerTitle}>{params.locationName}</Text>
      </View>

      {/* Empty state content */}
      <View style={styles.emptyContent}>
        {/* Waverly at 13% opacity */}
        <View style={styles.waverlyContainer}>
          <Waverly size={82} color={Colors.Ink} />
        </View>

        {/* Title */}
        <Text style={styles.emptyTitle}>{t('map.empty.title')}</Text>

        {/* Body copy with location interpolation */}
        <Text style={styles.emptyBody}>
          {t('map.empty.body', { city: params.locationName })}
        </Text>

        {/* Turn on Hello mode button */}
        <TouchableOpacity
          style={styles.helloButton}
          accessibilityRole="button"
          testID="turn-on-hello-button"
        >
          <Text style={styles.helloButtonText}>
            Turn on{' '}
            <Text style={styles.helloButtonHello}>Hello</Text>
            {' '}mode
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
