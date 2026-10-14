/**
 * One dismissible coach mark that then never appears again (CANON-RL-01-SN-24: "One dismissible coach
 * mark, then it never appears again"). The dismissal is kept on this device (AsyncStorage); if storage
 * is unavailable it simply shows each time rather than failing. Cleared when the signed-in session
 * changes so one account's dismissal never hides it for another.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as client from '../../api/client';
import { Colors } from '../../theme';
import { t } from '../../i18n';

const PREFIX = 'sayhello.coach.v1.';

export function CoachMark(props: { id: string; title: string; body: string; bottom?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const seen = await AsyncStorage.getItem(PREFIX + props.id);
        if (live && !seen) setVisible(true);
      } catch {
        if (live) setVisible(true);
      }
    })();
    return () => { live = false; };
  }, [props.id]);
  if (!visible) return null;
  const dismiss = async () => {
    setVisible(false);
    try { await AsyncStorage.setItem(PREFIX + props.id, '1'); } catch { /* shows again next time */ }
  };
  return (
    <View style={[styles.card, { bottom: props.bottom ?? 24 }]} testID={`coach-${props.id}`}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.body}>{props.body}</Text>
      <TouchableOpacity onPress={() => void dismiss()} accessibilityRole="button" style={styles.btn} testID={`coach-${props.id}-dismiss`}>
        <Text style={styles.btnText}>{t('s2c.coach.gotIt')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export async function resetCoachMarks(ids: string[]): Promise<void> {
  try { await Promise.all(ids.map(id => AsyncStorage.removeItem(PREFIX + id))); } catch { /* nothing to clear */ }
}

client.addSessionChangeListener?.(() => { void resetCoachMarks(['map-neighborhood']); });

const styles = StyleSheet.create({
  card: { position: 'absolute', left: 16, right: 16, backgroundColor: Colors.Ink, borderRadius: 16, padding: 16, gap: 6, maxWidth: 480, alignSelf: 'center' },
  title: { color: Colors.Chalk, fontSize: 17, fontWeight: '800' },
  body: { color: Colors.Chalk, fontSize: 14, lineHeight: 20, opacity: 0.9 },
  btn: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: Colors.Chalk, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 18 },
  btnText: { color: Colors.Ink, fontSize: 14, fontWeight: '700' },
});
