/**
 * The native radio for BLE confirmation (W8-A): munim-bluetooth (BLE central AND peripheral, Expo config plugin).
 * react-native-ble-plx is central-only and cannot advertise, so it cannot do the phone-to-phone token exchange.
 * Required lazily so tests and web never load the native module. Foreground only; nothing here runs in the background.
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { getBleToken, postBleLost, postBleProof } from '../api/discovery';
import type { BleDeps, BleDevice } from './ble-confirm';

type Munim = typeof import('munim-bluetooth');
let mod: Munim | null = null;
function ble(): Munim {
  if (!mod) mod = require('munim-bluetooth') as Munim;
  return mod;
}

export const realBleDeps: BleDeps = {
  supported: Platform.OS === 'ios' || Platform.OS === 'android',
  async getToken(helloId) {
    const r = await getBleToken(helloId);
    if (!r.error && r.data) return { status: 'ok', token: r.data };
    if (r.error?.code === 'discovery_off') return { status: 'off' };
    if (r.error?.status === 409) return { status: 'closed' };
    return { status: 'error' };
  },
  async ensurePermissions() {
    try {
      const m = ble();
      if (!(await m.requestBluetoothPermission(['scan', 'advertise', 'connect']))) return false;
      return await m.isBluetoothEnabled();
    } catch {
      return false;
    }
  },
  startAdvertising: (uuid) => ble().startAdvertising({ serviceUUIDs: [uuid] }),
  stopAdvertising: () => { try { ble().stopAdvertising(); } catch { /* ignore */ } },
  startScan: () => ble().startScan({ allowDuplicates: true, scanMode: 'lowLatency' }),
  stopScan: () => { try { ble().stopScan(); } catch { /* ignore */ } },
  onDevice: (cb) => ble().addDeviceFoundListener((d: BleDevice) => cb({ serviceUUIDs: d.serviceUUIDs, rssi: d.rssi })),
  async postProof(helloId, heard, pin) {
    const r = await postBleProof(helloId, heard, pin);
    if (!r.error && r.data) return { status: r.data.confirmed ? 'confirmed' : 'miss' };
    if (r.error?.code === 'discovery_off') return { status: 'off' };
    if (r.error?.status === 409) return { status: 'closed' };
    return { status: 'error' };
  },
  async postLost(helloId, samples) {
    const r = await postBleLost(helloId, samples);
    if (!r.error && r.data) return r.data.closed ? { status: 'closed', waverly: r.data.waverly } : { status: 'open' };
    if (r.error?.code === 'discovery_off') return { status: 'off' };
    if (r.error?.status === 409) return { status: 'ended' };
    return { status: 'error' };
  },
  /** The device position at the meeting, for the Hello pin only (RULES 8.3, 10.8). Only if permission is already granted. */
  async readPin() {
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) return undefined;
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      if (!pos || !Number.isFinite(pos.coords.latitude) || !Number.isFinite(pos.coords.longitude)) return undefined;
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return undefined;
    }
  },
  now: () => Date.now(),
  setTimer: (fn, ms) => setTimeout(fn, ms),
  clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};
