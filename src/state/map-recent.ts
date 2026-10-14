/**
 * "Recent" on map search: Hello Hangouts this person actually opened from
 * search, kept on this device (AsyncStorage). Nothing is invented; an empty
 * list shows nothing. Cleared whenever the signed-in session changes so one
 * account's searches never show for another.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as client from '../api/client';
import type { MapHangout } from '../api/map';

const KEY = 'sayhello.map.recent.v1';
/** How many recent items the search screen lists (layout bound). */
const KEEP = 5;

function isHangout(v: unknown): v is MapHangout {
  const h = v as MapHangout;
  return !!h && typeof h.id === 'string' && typeof h.name === 'string'
    && Number.isFinite(h.lat) && Number.isFinite(h.lng);
}

export async function getRecentHangouts(): Promise<MapHangout[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isHangout).slice(0, KEEP) : [];
  } catch {
    return [];
  }
}

export async function rememberHangout(h: MapHangout): Promise<void> {
  try {
    const list = (await getRecentHangouts()).filter(x => x.id !== h.id);
    await AsyncStorage.setItem(KEY, JSON.stringify([h, ...list].slice(0, KEEP)));
  } catch {
    // Recent is a convenience; a storage failure never blocks the journey.
  }
}

export async function clearRecentHangouts(): Promise<void> {
  try { await AsyncStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}

client.addSessionChangeListener?.(() => { void clearRecentHangouts(); });
