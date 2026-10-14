/**
 * ENCOUNTER SCREEN 1e: THE SELFIE REVIEW
 *
 * Shown AFTER the first capture. The photo is already persisted (RULES 10.29).
 *
 * ⚠️ NO delete, NO discard, NO cancel, NO X (RULES 10.31)
 * ⚠️ Retake replaces the photo, backing out keeps it (RULES 10.30, 10.32)
 * ⚠️ 25 points awarded at FIRST capture, never on retake (RULES 10.35)
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function SelfieReviewScreen() {
  const router = useRouter();

  const handleLooksGood = () => {
    // Photo is already saved per RULES 10.29
    router.push('/(encounter)/pin-drop');
  };

  const handleRetake = () => {
    // RULES 10.30: Retake OVERWRITES the stored photo
    // RULES 10.35: No points on retake
    // For now, just go back to prompt
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Header with Waverly badge */}
      <View style={styles.header}>
        <View style={[styles.waverlyBadge, { backgroundColor: Colors.Fern }]}>
          <Waverly size={19} color={Colors.Chalk} />
        </View>
        <Text style={styles.headerText}>{t('encounter.selfieReview.saved')}</Text>
      </View>

      {/* Selfie preview */}
      <View style={styles.photoContainer}>
        {/* Placeholder for the actual selfie */}
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderText}>Selfie captured</Text>
        </View>

        {/* Location overlay at bottom */}
        <View style={styles.locationOverlay}>
          <Text style={styles.locationText}>Otero Coffee · Tuesday, 4:12pm</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={[styles.looksGoodButton, { backgroundColor: Colors.Fern }]}
          onPress={handleLooksGood}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.selfieReview.looksGood')}
        >
          <Text style={[styles.looksGoodText, { color: Colors.Chalk }]}>
            {t('encounter.selfieReview.looksGood')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.selfieReview.retake')}
        >
          <Text style={[styles.retakeText, { color: Colors.Ink }]}>
            {t('encounter.selfieReview.retake')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t('encounter.selfieReview.disclaimer')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 26,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  waverlyBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.Ink,
  },
  photoContainer: {
    flex: 1,
    marginHorizontal: 26,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.Canvas,
    position: 'relative',
    minHeight: 0,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.Muted,
  },
  locationOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: 'rgba(10,10,10,0.78)',
  },
  locationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  bottomContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 34,
    gap: 11,
  },
  looksGoodButton: {
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  looksGoodText: {
    fontSize: 18,
    fontWeight: '700',
  },
  retakeButton: {
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.Line,
  },
  retakeText: {
    fontSize: 17,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Faint,
    textAlign: 'center',
  },
});
