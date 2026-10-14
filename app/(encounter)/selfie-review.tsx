/**
 * ENCOUNTER SCREEN 1e: THE SELFIE REVIEW
 *
 * Shown AFTER the first capture. The photo is already persisted (RULES 10.29).
 *
 * ⚠️ NO delete, NO discard, NO cancel, NO X (RULES 10.31)
 * ⚠️ Retake replaces the photo, backing out keeps it (RULES 10.30, 10.32)
 * ⚠️ 25 points awarded at FIRST capture, never on retake (RULES 10.35)
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { getActiveHelloId, getAward, getSelfiePreview } from '../../src/state/active-hello';
import { EncounterStage } from '../../src/components/ScreenContainer';

export default function SelfieReviewScreen() {
  const router = useRouter();
  const helloId = getActiveHelloId();
  // This phone's own capture, reached only after the server stored it (10.29).
  const previewUri = helloId ? getSelfiePreview(helloId) : null;
  // Only the first capture pays, and only the server's figure is shown (10.35).
  const award = helloId ? getAward(helloId, 'selfie') : null;

  const handleLooksGood = () => {
    // Photo is already saved per RULES 10.29
    router.push('/(encounter)/pin-drop');
  };

  const handleRetake = () => {
    // RULES 10.30: Retake OVERWRITES the stored photo
    // RULES 10.35: No points on retake
    // Back to the camera step, which uploads the new capture over this one.
    router.back();
  };

  return (
    <EncounterStage style={styles.container}>
      {/* Status bar spacer */}
      <StatusBarSpacer height={44} />

      {/* Header with Waverly badge */}
      <View style={styles.header}>
        <View style={[styles.waverlyBadge, { backgroundColor: Colors.Fern }]}>
          <Waverly size={19} color={Colors.Chalk} />
        </View>
        <Text style={styles.headerText}>{t('encounter.selfieReview.saved')}</Text>
        {award != null && award > 0 ? (
          <Text style={[styles.headerText, { color: Colors.Fern }]} testID="selfie-points">
            {t('encounter.common.pointsValue', { points: award })} {t('encounter.common.pointsLabel')}
          </Text>
        ) : null}
      </View>

      {/* Selfie preview — place and time stay behind the reveal gate (10.41) */}
      <View style={styles.photoContainer}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={StyleSheet.absoluteFill}
            accessibilityLabel={t('encounter.selfieReview.previewLabel')}
            testID="selfie-preview"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Waverly size={58} color={Colors.Faint} />
          </View>
        )}
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
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
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
