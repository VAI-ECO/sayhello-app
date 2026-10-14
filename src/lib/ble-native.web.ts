/**
 * Web: no Bluetooth confirmation. The confirmer reports 'unsupported' and the screen says so honestly; the QR and the
 * typed code (RULES 10.47) are the way to prove the meeting. The native module is never imported here.
 */
import type { BleDeps } from './ble-confirm';


export const realBleDeps: BleDeps = {
  supported: false,
  getToken: async () => ({ status: 'error' }),
  ensurePermissions: async () => false,
  startAdvertising: () => undefined,
  stopAdvertising: () => undefined,
  startScan: () => undefined,
  stopScan: () => undefined,
  onDevice: () => () => undefined,
  postProof: async () => ({ status: 'error' }),
  postLost: async () => ({ status: 'error' }),
  readPin: async () => undefined,
  now: () => Date.now(),
  setTimer: (fn, ms) => setTimeout(fn, ms),
  clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};
