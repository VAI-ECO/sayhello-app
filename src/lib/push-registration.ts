/**
 * Push registration (stage 11). After the person allows notifications, hand this device's Expo push token to
 * PUT /users/me/push-devices. Registering does not mean anything is sent: push ships dark on the server (admin
 * flag + provider). Honest failure: no EAS project id, no permission, or no session -> returns a reason, never throws.
 *
 * Lifecycle (wired in src/lib/push-handling.ts from the app root):
 *   sign-in / app start with a session / token rotation -> registerPushToken()
 *   sign-out (before the session is cleared)            -> removePushTokenForSignOut() (server delete, then forget)
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { api } from '../api/client';

export type PushRegistration = { registered: true; token: string } | { registered: false; reason: 'no_permission' | 'no_project_id' | 'no_token' | 'no_session' | 'server_refused' };

/** The token this install last registered for the current session (memory only; re-derived on next sign-in). */
let registeredToken: string | null = null;

export function currentPushToken(): string | null {
  return registeredToken;
}

export async function registerPushToken(): Promise<PushRegistration> {
  try {
    if (!api.hasSession()) return { registered: false, reason: 'no_session' };
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== 'granted') return { registered: false, reason: 'no_permission' };
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId
      ?? (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    if (!projectId) return { registered: false, reason: 'no_project_id' };
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return { registered: false, reason: 'no_token' };
    const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
    const res = await api.put('/users/me/push-devices', { token, platform });
    if (res.error) return { registered: false, reason: 'server_refused' };
    registeredToken = token;
    return { registered: true, token };
  } catch {
    return { registered: false, reason: 'no_token' };
  }
}

export async function unregisterPushToken(token: string): Promise<void> {
  try { await api.delete(`/users/me/push-devices?token=${encodeURIComponent(token)}`); } catch { /* best effort */ }
}

/** Called while still signed in: tell the server this device no longer belongs to this account. */
export async function removePushTokenForSignOut(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (token) await unregisterPushToken(token);
}

/** A 401 / replaced session: nothing to call the server with, just forget the local copy. */
export function forgetPushToken(): void {
  registeredToken = null;
}
