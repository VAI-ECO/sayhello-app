/**
 * Push end to end, mounted once from the root layout:
 *  - foreground handler: a notification that arrives while the app is open is shown (banner + list + sound)
 *  - tap (warm or cold start) -> pathForNotification() -> router (new prefixes /admin /ambassador /influencer /store /org /home)
 *  - token re-registration on sign-in, app start with a session, and token rotation
 *  - token removal on sign-out (client pre-sign-out hook); local copy forgotten when the session ends otherwise
 * Content rules (RULES §21): payloads carry places and counts, never names or photos; the app only reads `kind`,
 * ids and an optional `path`.
 */
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { addSessionChangeListener, api, setPreSignOutHook } from '../api/client';
import { pathForNotification } from './deep-links';
import { forgetPushToken, registerPushToken, removePushTokenForSignOut } from './push-registration';

let handlerInstalled = false;

export function installForegroundNotificationHandler(): void {
  if (handlerInstalled) return;
  handlerInstalled = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function usePushHandling(ready: boolean): void {
  const router = useRouter();

  useEffect(() => {
    installForegroundNotificationHandler();
    setPreSignOutHook(removePushTokenForSignOut);
    return () => setPreSignOutHook(null);
  }, []);

  // Registration: on sign-in (session change with a token), once at start with a saved session, on token rotation.
  useEffect(() => {
    if (!ready) return;
    if (api.hasSession()) void registerPushToken();
    const off = addSessionChangeListener(() => {
      // The listener fires before the new token is stored; re-check on the next tick.
      setTimeout(() => {
        if (api.hasSession()) void registerPushToken();
        else forgetPushToken();
      }, 0);
    });
    const rotation = Notifications.addPushTokenListener(() => { if (api.hasSession()) void registerPushToken(); });
    return () => { off(); rotation.remove(); };
  }, [ready]);

  // Tap -> screen. A tap opened a signed-out app: the auth entry takes over, nothing is routed.
  useEffect(() => {
    if (!ready) return;
    const open = (response: Notifications.NotificationResponse | null | undefined) => {
      if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      if (!api.hasSession()) return;
      const path = pathForNotification(response.notification.request.content.data);
      router.push(path as never);
    };
    const handled = new Set<string>();
    const once = (response: Notifications.NotificationResponse | null | undefined) => {
      const id = response?.notification.request.identifier;
      if (id) { if (handled.has(id)) return; handled.add(id); }
      open(response);
    };
    void Notifications.getLastNotificationResponseAsync().then(once).catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(once);
    return () => sub.remove();
  }, [ready, router]);
}
