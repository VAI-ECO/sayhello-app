/**
 * Places the Hello pin from this phone's position while an encounter screen is mounted, the app is in the foreground and the
 * Hello is mutually accepted and not yet revealed (RULES §8.3, §8.6, §10.8). Silent: see lib/meeting-pin.ts.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { refineMeetingPin } from './meeting-pin';

export function useMeetingPin(helloId: string | null, active: boolean): void {
  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!helloId || !active || !foreground) return;
    void refineMeetingPin(helloId);
  }, [helloId, active, foreground]);
}
