/**
 * Tells the person, plainly, when they are at today's nudge cap and opens the check-in (RULES §11.9).
 * Reads GET /hellos/nudge-cap (a boolean); renders nothing when not at the cap or when the read fails.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getNudgeCap } from '../../api/hellos';
import { Colors } from '../../theme';
import { t } from '../../i18n';

export function NudgeCapNotice() {
  const router = useRouter();
  const [atCap, setAtCap] = useState(false);
  useFocusEffect(useCallback(() => {
    let live = true;
    void getNudgeCap().then(res => { if (live) setAtCap(res.data?.atCap === true); }).catch(() => { if (live) setAtCap(false); });
    return () => { live = false; };
  }, []));
  if (!atCap) return null;
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push('/(encounter)/at-cap')} accessibilityRole="button" testID="nudge-cap-notice">
      <Text style={styles.title}>{t('s2c.cap.notice')}</Text>
      <Text style={styles.cta}>{t('s2c.cap.noticeCta')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.Bone, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.Line },
  title: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  cta: { fontSize: 14, fontWeight: '700', color: Colors.HelloBlue, marginTop: 4 },
});
