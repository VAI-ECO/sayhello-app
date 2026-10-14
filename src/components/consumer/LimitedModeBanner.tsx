/**
 * LIMITED MODE banner (CANON-RL-01-SN-95; RULES §26.5, §36.5; Guideline 5.1.2(i)).
 * Location AND notifications both denied: ONE dismissible banner, nothing blocking. Denied is not
 * blocked — the person keeps everything, including Hello points by scanning or typing a code. The
 * banner reads the real OS permission state; it never shows while either is still undecided or granted,
 * and it never reappears in the same session once dismissed. (Bluetooth is not read here: no Bluetooth
 * module is in the app, discovery being an open owner ruling.)
 */
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../theme';
import { t } from '../../i18n';

let dismissedThisSession = false;

export function LimitedModeBanner() {
  const [show, setShow] = useState(false);

  useFocusEffect(useCallback(() => {
    let live = true;
    void (async () => {
      try {
        const [loc, notif] = await Promise.all([Location.getForegroundPermissionsAsync(), Notifications.getPermissionsAsync()]);
        const locDenied = loc.status === 'denied';
        const notifDenied = notif.status === 'denied';
        if (live) setShow(locDenied && notifDenied && !dismissedThisSession);
      } catch {
        if (live) setShow(false);
      }
    })();
    return () => { live = false; };
  }, []));

  if (!show) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert" testID="limited-mode-banner">
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('s2c.limited.title')}</Text>
        <Text style={styles.body}>{t('s2c.limited.body')}</Text>
        <TouchableOpacity onPress={() => void Linking.openSettings().catch(() => undefined)} accessibilityRole="button" testID="limited-mode-settings">
          <Text style={styles.link}>{t('s2c.limited.settings')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => { dismissedThisSession = true; setShow(false); }}
        accessibilityRole="button"
        accessibilityLabel={t('s2c.limited.dismiss')}
        testID="limited-mode-dismiss"
      >
        <Text style={styles.x}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 12, backgroundColor: Colors.Bone, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.Line },
  title: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginTop: 2 },
  link: { fontSize: 14, fontWeight: '700', color: Colors.HelloBlue, marginTop: 8 },
  x: { fontSize: 16, color: Colors.Muted, paddingHorizontal: 4 },
});
