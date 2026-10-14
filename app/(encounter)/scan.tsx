/**
 * ENCOUNTER SCREEN 1d: SCAN AND SAY HELLO
 *
 * QR scanner screen. Waverly shrinks to a small mark — the design's way
 * of saying look at the person, not the phone.
 *
 * ⚠️ QR is per-encounter, generated at mutual accept, live camera only (RULES 10.7)
 */

import { View, Text, StyleSheet } from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Header with small Waverly */}
      <View style={styles.header}>
        <View style={styles.waverlyBadge}>
          <Waverly size={21} color={Colors.Chalk} />
        </View>
        <Text style={styles.headline}>
          Scan the QR code and{' '}
          <Text style={styles.dreamingText}>Say Hello</Text>.
        </Text>
      </View>

      {/* Camera viewfinder */}
      <View style={styles.cameraContainer}>
        <View style={styles.viewfinder}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Placeholder Waverly in center */}
          <View style={styles.placeholderCircle}>
            <Waverly size={58} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
      </View>

      {/* Bottom instruction */}
      <View style={styles.footer}>
        <Text style={styles.instruction}>{t('encounter.scan.body')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Ink,
  },
  statusBar: {
    height: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingVertical: 16,
    paddingBottom: 22,
    gap: 13,
  },
  waverlyBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  headline: {
    flex: 1,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.8,
  },
  dreamingText: {
    fontFamily: 'Dreaming',
    fontSize: 43, // 1.42em of 30px
    lineHeight: 26, // 0.85 of 30px
    fontWeight: '400',
  },
  cameraContainer: {
    flex: 1,
    paddingHorizontal: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#2A2926',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: Colors.Chalk,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  placeholderCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 26,
    paddingBottom: 38,
  },
  instruction: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'left',
  },
});
