/**
 * Encounter-review repair: session-scoped client state must not cross accounts.
 * A sign-out (clearToken) or a different sign-in (setToken) clears the open
 * hello, its preview, awards and failed scans, and the map's recent searches.
 */

import { api } from '../../api/client';
import {
  getActiveHelloId,
  getAward,
  getFailedScans,
  getSelfiePreview,
  recordAward,
  recordFailedScan,
  setActiveHelloId,
  setSelfiePreview,
} from '../active-hello';
import { getRecentHangouts, rememberHangout } from '../map-recent';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.get(k) ?? null)),
    setItem: jest.fn((k: string, v: string) => { mockStore.set(k, v); return Promise.resolve(); }),
    removeItem: jest.fn((k: string) => { mockStore.delete(k); return Promise.resolve(); }),
  },
}));

function seed() {
  setActiveHelloId('h1');
  setSelfiePreview('h1', 'file:///a.jpg');
  recordAward('h1', 'selfie', 25);
  recordFailedScan('h1');
}

it('clears the open encounter and map recents on sign-out', async () => {
  await api.setToken('account-a');
  seed();
  await rememberHangout({ id: 'hh1', name: 'Ridge Tavern', address: '12 Bell St', lat: 1, lng: 2, founding: false });
  expect(await getRecentHangouts()).toHaveLength(1);

  await api.clearToken();

  expect(getActiveHelloId()).toBeNull();
  expect(getSelfiePreview('h1')).toBeNull();
  expect(getAward('h1', 'selfie')).toBeNull();
  expect(getFailedScans('h1')).toBe(0);
  await Promise.resolve();
  expect(await getRecentHangouts()).toHaveLength(0);
});

it('clears it when a different account signs in, but not when the same session is re-set', async () => {
  await api.setToken('account-a');
  seed();
  await api.setToken('account-a');
  expect(getActiveHelloId()).toBe('h1');

  await api.setToken('account-b');
  expect(getActiveHelloId()).toBeNull();
  expect(getSelfiePreview('h1')).toBeNull();
});
