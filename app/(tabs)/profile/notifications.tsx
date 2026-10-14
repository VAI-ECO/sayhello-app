/**
 * NOTIFICATIONS (Settings → The app → Notifications)
 * GET/PUT /users/me/notification-preferences. A switch changes only after the server saved it;
 * a failed save puts the switch back and says so. Delivery is a separate, dark-launched concern
 * (RULES §21.6): this screen only stores the person's choices.
 */
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Colors } from '../../../src/theme';
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

export default function NotificationsScreen() {
  const loader = useLoader<{ preferences: NotificationPreferences }>(getNotificationPreferences);
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
