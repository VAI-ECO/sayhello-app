/**
 * Push registration (stage 11). After the person allows notifications, hand this device's Expo push token to
 * PUT /users/me/push-devices. Registering does not mean anything is sent: push ships dark on the server (admin
 * flag + provider). Honest failure: no EAS project id, no permission, or no session -> returns a reason, never throws.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { api } from '../api/client';

export type PushRegistration = { registered: true; token: string } | { registered: false; reason: 'no_permission' | 'no_project_id' | 'no_token' | 'server_refused' };

export async function registerPushToken(): Promise<PushRegistration> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== 'granted') return { registered: false, reason: 'no_permission' };
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId
      ?? (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    if (!projectId) return { registered: false, reason: 'no_project_id' };
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return { registered: false, reason: 'no_token' };
    const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
    const res = await api.put('/users/me/push-devices', { token, platform });
    return !res.error ? { registered: true, token } : { registered: false, reason: 'server_refused' };
  } catch {
    return { registered: false, reason: 'no_token' };
  }
}

export async function unregisterPushToken(token: string): Promise<void> {
  try { await api.delete(`/users/me/push-devices?token=${encodeURIComponent(token)}`); } catch { /* best effort */ }
}
