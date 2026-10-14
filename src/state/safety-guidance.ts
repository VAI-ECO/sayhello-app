/**
 * Safety guidance in the meet flow (RULES §24.18, §36.6; Guideline 1.4.5): shown once before the first
 * meet on this device, and any time from Settings. "Seen" is a per-device convenience (AsyncStorage);
 * if storage fails it just shows again. Cleared when the signed-in session changes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as client from '../api/client';

const KEY = 'sayhello.safety.seen.v1';

export async function hasSeenSafetyGuidance(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(KEY)) === '1'; } catch { return false; }
}
export async function markSafetyGuidanceSeen(): Promise<void> {
  try { await AsyncStorage.setItem(KEY, '1'); } catch { /* shows again next time */ }
}
client.addSessionChangeListener?.(() => { void AsyncStorage.removeItem(KEY).catch(() => undefined); });
