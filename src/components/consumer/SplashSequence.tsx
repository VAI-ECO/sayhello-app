/**
 * SPLASH (CANON-SH-01-SN-11 playing / SN-12 final frame / SN-13 when it plays; locked timing table).
 * Strictly sequential, nothing but the sway repeats: rings at 0ms; selfie circles from 390ms, 50ms apart;
 * the wave at 750ms; the tagline at 930ms; still at 1300ms, then the sway at +/-7 degrees on a 3.4s cycle
 * pivoting near the wrist (origin 50% 88%). Reduce Motion cross-fades to the finished frame — no drop, no
 * wave, no sway. The wordmark is live text ("Say Hello" entire, never split across lines) in the Dreaming
 * face; the font file is not in this repository, so the system face shows until it is added. The selfie
 * circles are the identity colours, drawn — not real people's photos. The tagline uses curly quotes on purpose.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Waverly } from '../Waverly';
import { Colors } from '../../theme';

const SELFIE_COLORS = [Colors.Purple, Colors.Emerald, Colors.Orange, Colors.Cyan, Colors.Magenta, Colors.DeepNavy] as const;
export const SPLASH_SEQUENCE_MS = 1300;

export function SplashSequence() {
  const [reduce, setReduce] = useState<boolean | null>(null);
  const ring = useRef(new Animated.Value(0)).current;
  const selfies = useRef(SELFIE_COLORS.map(() => new Animated.Value(0))).current;
  const wave = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (live) setReduce(Boolean(v)); }).catch(() => { if (live) setReduce(false); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (reduce === null) return;
    if (reduce) {
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      return;
    }
    const spring = (v: Animated.Value, delay: number, duration = 260) =>
      Animated.timing(v, { toValue: 1, delay, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    Animated.parallel([
      spring(ring, 0, 700),
      ...selfies.map((v, i) => spring(v, 390 + i * 50)),
      spring(wave, 750, 400),
      spring(tagline, 930, 300),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sway, { toValue: -1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sway, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });
    return () => { [ring, wave, tagline, sway, ...selfies].forEach(v => v.stopAnimation()); };
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const still = reduce === true;
  const opacity = (v: Animated.Value) => (still ? fade : v);
  const rotate = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });
  const R = 130;
  return (
    <View style={styles.root} accessible accessibilityLabel="Say Hello" testID="splash-sequence">
      <View style={styles.stage}>
        <Animated.View style={[styles.ring, { width: 2 * R, height: 2 * R, borderRadius: R, opacity: still ? 0 : ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.12] }), transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] }) }] }]} />
        {SELFIE_COLORS.map((c, i) => {
          const a = (i / SELFIE_COLORS.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <Animated.View
              key={i}
              style={[styles.selfie, { backgroundColor: c, left: R + Math.cos(a) * 100 - 16, top: R + Math.sin(a) * 100 - 16, opacity: opacity(selfies[i]), transform: [{ scale: still ? 1 : selfies[i] }] }]}
            />
          );
        })}
        <Animated.View style={{ transform: [{ translateY: 20 }, { rotate: still ? '0deg' : rotate }, { translateY: -20 }], opacity: opacity(wave) }}>
          <Waverly size={92} wave={!still} />
        </Animated.View>
      </View>
      <Text style={styles.wordmark} numberOfLines={1} adjustsFontSizeToFit>Say Hello</Text>
      <Animated.Text style={[styles.tagline, { opacity: opacity(tagline) }]}>{'“We’re making the world a neighborhood.”'}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.Chalk, padding: 24 },
  stage: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  ring: { position: 'absolute', borderWidth: 2, borderColor: Colors.Purple },
  selfie: { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.Chalk },
  wordmark: { fontFamily: 'Dreaming', fontSize: 66, color: Colors.Ink, maxWidth: '100%' },
  tagline: { fontSize: 16, fontWeight: '600', color: Colors.Muted, marginTop: 8, textAlign: 'center' },
});
