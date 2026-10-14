/**
 * The push IS the handoff (RULES 8.11, FLOW-14 step 2-3): tapping Waverly's "someone is nearby" brings the app forward
 * on Home, where the pending Hello shows as the nudge (use-live-hellos re-reads on foreground). Nothing else happens
 * here: no distance, no name, no explanation. Inert unless a push of kind hello_nudge arrives.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export function nudgeTapTarget(data: unknown): '/home' | null {
  const kind = (data as { kind?: unknown } | null | undefined)?.kind;
  return kind === 'hello_nudge' ? '/home' : null;
}

export function useNudgeHandoff(): void {
  const router = useRouter();
  useEffect(() => {
    let sub: { remove(): void } | null = null;
    try {
      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const target = nudgeTapTarget(response.notification.request.content.data);
        if (target) router.navigate(target);
      });
    } catch { /* push unavailable on this platform: nothing to hand off */ }
    return () => { try { sub?.remove(); } catch { /* ignore */ } };
  }, [router]);
}
