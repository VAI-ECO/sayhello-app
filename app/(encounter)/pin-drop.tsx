/**
 * ENCOUNTER SCREEN 1f: THE PIN DROP
 *
 * Pin lands on the map. One-shot animation on arrival.
 * The pin is permanent and survives account deletion (RULES 10.8, 10.10).
 *
 * Pin color is the user's identity color, not a status color.
 */

import { View, Text, StyleSheet, Animated } from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors } from '../../src/theme';
import { useEffect, useRef } from 'react';

export default function PinDropScreen() {
  const { identityColor } = useTheme();

  // Animations
  const ringAnim = useRef(new Animated.Value(0)).current;
  const dropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // One-shot ring animation
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: true,
    }).start();

    // One-shot drop animation
    Animated.timing(dropAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [ringAnim, dropAnim]);

  // For production, this would come from encounter data
  const locationName = 'Otero Coffee';
  const timestamp = 'Tuesday, 4:12pm';

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={styles.statusBar} />

      {/* Map view with grid */}
      <View style={styles.mapContainer}>
        {/* Grid pattern */}
        <View style={styles.gridOverlay}>
          {/* Vertical grid lines */}
          <View style={[styles.gridLine, { left: 132, width: 24 }]} />
          <View style={[styles.gridLine, { left: 268, width: 16 }]} />
          {/* Horizontal grid lines */}
          <View style={[styles.gridLineHorizontal, { top: 150, height: 26, transform: [{ rotate: '-7deg' }] }]} />
          <View style={[styles.gridLineHorizontal, { top: 400, height: 20, transform: [{ rotate: '4deg' }] }]} />
        </View>

        {/* Pin with ring */}
        <View style={styles.pinContainer}>
          <Animated.View
            style={[
              styles.ring,
              { borderColor: identityColor },
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pin,
              { backgroundColor: identityColor },
              {
                transform: [
                  {
                    scale: dropAnim.interpolate({
                      inputRange: [0, 0.6, 1],
                      outputRange: [0.4, 1.1, 1],
                    }),
                  },
                  {
                    translateY: dropAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Waverly size={38} color={Colors.Chalk} />
          </Animated.View>
        </View>
      </View>

      {/* Bottom text */}
      <View style={styles.bottomContent}>
        <Text style={styles.title}>{t('encounter.pinDrop.title')}</Text>
        <Text style={styles.location}>{`${locationName} · ${timestamp}`}</Text>
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
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.Canvas,
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#E5E2DE',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: -30,
    right: -30,
    backgroundColor: '#E5E2DE',
  },
  pinContainer: {
    position: 'absolute',
    left: '50%',
    top: '46%',
    marginLeft: -36,
    marginTop: -36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  pin: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.Chalk,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(192,59,128,0.32)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 8,
  },
  bottomContent: {
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 36,
    gap: 9,
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.75,
  },
  location: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.Muted,
  },
});
