/**
 * Notifications denied banner (ledger row 15). When the OS push permission is denied, ONE dismissible banner
 * says nothing is blocked and links to the phone's settings. It reads the real permission state, never shows
 * while the choice is undecided or granted, and does not come back in the same session once dismissed.
 * `denied` lets a screen that has just seen the denial show it without waiting for a second read.
 */
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../theme';
import { t } from '../../i18n';

let dismissedThisSession = false;

/** Test hook: a new session starts with the banner available again. */
export function resetNotificationsDeniedBanner(): void {
  dismissedThisSession = false;
}

export function NotificationsDeniedBanner({ denied }: { denied?: boolean } = {}) {
  const [osDenied, setOsDenied] = useState(false);
  const [dismissed, setDismissed] = useState(dismissedThisSession);

  useFocusEffect(useCallback(() => {
    let live = true;
    void (async () => {
      try {
        const perm = await Notifications.getPermissionsAsync();
        if (live) setOsDenied(perm.status === 'denied');
      } catch {
        if (live) setOsDenied(false);
      }
    })();
    return () => { live = false; };
  }, []));

  if (dismissed || dismissedThisSession || !(denied || osDenied)) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert" testID="notifications-denied-banner">
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('s2c.notifDenied.title')}</Text>
        <Text style={styles.body}>{t('s2c.notifDenied.body')}</Text>
        <TouchableOpacity onPress={() => void Linking.openSettings().catch(() => undefined)} accessibilityRole="button" testID="notifications-denied-settings">
          <Text style={styles.link}>{t('s2c.notifDenied.settings')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => { dismissedThisSession = true; setDismissed(true); }}
        accessibilityRole="button"
        accessibilityLabel={t('s2c.notifDenied.dismiss')}
        testID="notifications-denied-dismiss"
      >
        <Text style={styles.x}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 12, backgroundColor: Colors.Bone, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.Line },
  title: { fontSize: 15, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginTop: 2 },
  link: { fontSize: 14, fontWeight: '700', color: Colors.HelloBlue, marginTop: 8 },
  x: { fontSize: 16, color: Colors.Muted, paddingHorizontal: 4 },
});
