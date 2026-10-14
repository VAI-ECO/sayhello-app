/**
 * NOTIFICATIONS (Settings → The app → Notifications)
 * GET/PUT /users/me/notification-preferences. A switch changes only after the server saved it;
 * a failed save puts the switch back and says so. Delivery is a separate, dark-launched concern
 * (RULES §21.6): this screen only stores the person's choices.
 */
import { useCallback, useState } from 'react';
import { Linking, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../../src/theme';
import { registerPushToken } from '../../../src/lib/push-registration';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import {
  getNotificationPreferences,
  NOTIFICATION_KEYS,
  saveNotificationPreferences,
  type NotificationKey,
  type NotificationPreferences,
} from '../../../src/api/account';

/**
 * What the PHONE currently allows, read from the OS (never assumed). 'unknown' = could not be read (e.g. web):
 * the section is then left out rather than guessed. Denied is not blocked (§26.5): nothing here gates the app.
 */
type DevicePermission = 'unknown' | 'granted' | 'canAsk' | 'denied';

async function readDevicePermission(): Promise<DevicePermission> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status === 'granted') return 'granted';
    if (perm.status === 'undetermined' || perm.canAskAgain) return 'canAsk';
    return 'denied';
  } catch {
    return 'unknown';
  }
}

export default function NotificationsScreen() {
  const loader = useLoader<{ preferences: NotificationPreferences }>(getNotificationPreferences);
  const [device, setDevice] = useState<DevicePermission>('unknown');
  const [asking, setAsking] = useState(false);

  // Re-read on every focus: the person may have changed it in the phone's Settings and come back.
  useFocusEffect(useCallback(() => {
    let live = true;
    void readDevicePermission().then(state => { if (live) setDevice(state); });
    return () => { live = false; };
  }, []));

  async function turnOnForThisPhone() {
    if (asking) return;
    setAsking(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      // Best effort: needs a session and the server's push switch; the permission answer is what this screen reports.
      if (status === 'granted') void registerPushToken();
    } catch {
      // Same as not granted; the re-read below shows what the phone says.
    }
    setDevice(await readDevicePermission());
    setAsking(false);
  }

  const [overrides, setOverrides] = useState<Partial<NotificationPreferences>>({});
  const [pending, setPending] = useState<NotificationKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saved = loader.data?.preferences;
  const value = (key: NotificationKey) => overrides[key] ?? saved?.[key] ?? true;

  async function toggle(key: NotificationKey, next: boolean) {
    if (pending) return;
    setPending(key);
    setError(null);
    setOverrides(prev => ({ ...prev, [key]: next }));
    const res = await saveNotificationPreferences({ [key]: next });
    setPending(null);
    if (res.error || !res.data) {
      setOverrides(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setError(t('account.notifications.saveFailed'));
      return;
    }
    setOverrides({});
    loader.reload();
  }

  return (
    <SubScreen title={t('account.notifications.title')} state={loader.state} onRetry={loader.retry}>
      <Text style={subStyles.intro}>{t('account.notifications.intro')}</Text>
      {device !== 'unknown' ? (
        <View style={subStyles.card} testID="notif-device">
          <Text style={[subStyles.rowLabel, { paddingTop: 14 }]}>{t('account.notifications.device.title')}</Text>
          <Text style={[subStyles.rowHint, { paddingBottom: device === 'granted' ? 14 : 8 }]} testID="notif-device-state">
            {device === 'granted' ? t('account.notifications.device.on')
              : device === 'canAsk' ? t('account.notifications.device.offAsk')
              : t('account.notifications.device.offSettings')}
          </Text>
          {device === 'canAsk' ? (
            <TouchableOpacity
              style={[subStyles.secondary, { marginBottom: 14 }, asking && subStyles.disabled]}
              disabled={asking}
              onPress={() => void turnOnForThisPhone()}
              accessibilityRole="button"
              testID="notif-device-turn-on"
            >
              <Text style={subStyles.secondaryText}>{t('account.notifications.device.turnOn')}</Text>
            </TouchableOpacity>
          ) : null}
          {device === 'denied' ? (
            <TouchableOpacity
              style={[subStyles.secondary, { marginBottom: 14 }]}
              onPress={() => void Linking.openSettings().catch(() => undefined)}
              accessibilityRole="button"
              testID="notif-device-open-settings"
            >
              <Text style={subStyles.secondaryText}>{t('account.openSettings')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      <View style={subStyles.card}>
        {NOTIFICATION_KEYS.map((key, index) => (
          <View
            key={key}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14,
              borderTopWidth: index === 0 ? 0 : 1, borderTopColor: Colors.Faint + '55',
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={subStyles.rowLabel}>{t(`account.notifications.${key}`)}</Text>
              <Text style={subStyles.rowHint}>{t(`account.notifications.${key}Hint`)}</Text>
            </View>
            <Switch
              value={value(key)}
              disabled={pending !== null}
              onValueChange={next => void toggle(key, next)}
              accessibilityLabel={t(`account.notifications.${key}`)}
              testID={`notif-${key}`}
            />
          </View>
        ))}
      </View>
      {error ? <Text style={subStyles.error} accessibilityRole="alert">{error}</Text> : null}
      <Text style={subStyles.note}>{t('account.notifications.deliveryNote')}</Text>
    </SubScreen>
  );
}
