/**
 * STACKED COUNTDOWNS — the home view while any Hello is counting down (RULES §10.13 "Countdown
 * replaces What's Happening as the default view while live"; §10.14 "hours + minutes, no seconds.
 * Push at zero. Multiple countdowns stack"). One page per live hello, soonest first, in a swipeable
 * carousel with dots (the drawn countdown frame's carousel). Identity, photo and place stay with
 * Waverly until reveal (§10.6, §10.41): a page shows only the hello's own code and its clock.
 *
 * The clock is the server's reveal time; a due reveal is handed over by the server's job, so "Open it"
 * asks the server instead of assuming it has run. Tapping a page opens that hello's current step.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Waverly } from '../Waverly';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import { formatHoursMinutes } from '../../lib/encounter';
import type { LiveCountdown } from '../../lib/use-live-hellos';

interface Props {
  countdowns: LiveCountdown[];
  ground: string;
  onOpen: (helloId: string) => void;
  onAskServer: () => void;
}

export function CountdownCarousel({ countdowns, ground, onOpen, onAskServer }: Props) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const active = Math.min(page, Math.max(0, countdowns.length - 1));

  return (
    <View style={[styles.container, { backgroundColor: ground }]} testID="countdown-carousel">
      <View style={styles.statusBar} />
      <View style={styles.header}>
        <View style={styles.badge}><Waverly size={18} color={Colors.Chalk} /></View>
        <Text style={styles.headerText}>{t('encounter.countdown.header')}</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width)))}
        testID="countdown-pages"
        style={styles.pager}
      >
        {countdowns.map(({ hello, msRemaining }) => {
          const due = msRemaining <= 0;
          return (
            <View key={hello.id} style={[styles.page, { width }]} testID={`countdown-page-${hello.id}`}>
              <TouchableOpacity
                style={styles.photo}
                onPress={() => onOpen(hello.id)}
                accessibilityRole="button"
                accessibilityLabel={hello.helloCode ? t('encounter.countdown.helloLabel', { code: hello.helloCode }) : t('encounter.countdown.header')}
                testID={`countdown-open-${hello.id}`}
              >
                <View style={styles.placeholder}><Waverly size={72} color="rgba(255,255,255,0.5)" /></View>
                {hello.helloCode ? (
                  <View style={styles.overlay}>
                    <Text style={styles.name}>{t('encounter.countdown.helloLabel', { code: hello.helloCode })}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              <View style={styles.clockSection}>
                {due ? (
                  <>
                    <Text style={styles.clockLabel}>{t('encounter.countdown.ready')}</Text>
                    <TouchableOpacity style={styles.openButton} onPress={onAskServer} accessibilityRole="button" accessibilityLabel={t('encounter.countdown.open')} testID={`countdown-ask-${hello.id}`}>
                      <Text style={styles.openText}>{t('encounter.countdown.open')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.clock} testID={`countdown-clock-${hello.id}`}>{formatHoursMinutes(msRemaining)}</Text>
                    <Text style={styles.clockLabel}>{t('encounter.countdown.until')}</Text>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {countdowns.length > 1 ? (
        <View style={styles.dots} accessibilityRole="tablist" testID="countdown-dots">
          {countdowns.map((c, i) => (
            <View key={c.hello.id} style={[styles.dot, i === active && styles.dotActive]} accessibilityState={{ selected: i === active }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { height: 44 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 16 },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  headerText: { fontSize: 17, color: 'rgba(255,255,255,0.86)' },
  pager: { flex: 1 },
  page: { flex: 1 },
  photo: { flex: 1, marginHorizontal: 22, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 58, paddingBottom: 18, backgroundColor: 'rgba(10,10,10,0.82)' },
  name: { fontSize: 30, fontWeight: '700', color: Colors.Chalk, letterSpacing: -0.78 },
  clockSection: { alignItems: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, gap: 4 },
  clock: { fontSize: 68, lineHeight: 68, fontWeight: '700', color: Colors.Chalk, letterSpacing: -2.9 },
  clockLabel: { fontSize: 16, color: 'rgba(255,255,255,0.66)' },
  openButton: { marginTop: 12, alignSelf: 'stretch', backgroundColor: Colors.Chalk, borderRadius: 28, height: 56, alignItems: 'center', justifyContent: 'center' },
  openText: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 6, paddingBottom: 28 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.34)' },
  dotActive: { width: 22, backgroundColor: Colors.Chalk },
});
