/* eslint-disable @typescript-eslint/no-var-requires */
function loadConfig() {
  jest.resetModules();
  return require('../../app.config.js').default({ config: {} });
}

type PluginEntry = string | [string, Record<string, unknown>];
const options = (plugins: PluginEntry[], name: string) => {
  const entry = plugins.find((p) => Array.isArray(p) && p[0] === name) as [string, Record<string, unknown>] | undefined;
  return entry?.[1] ?? {};
};

describe('iOS purpose strings stay consistent across the plist and every plugin that writes them', () => {
  const c = loadConfig();
  const plist = c.ios.infoPlist;

  it('camera: the plist, expo-camera and expo-image-picker all use the same text, which mentions scanning', () => {
    expect(options(c.plugins, 'expo-camera').cameraPermission).toBe(plist.NSCameraUsageDescription);
    expect(options(c.plugins, 'expo-image-picker').cameraPermission).toBe(plist.NSCameraUsageDescription);
    expect(plist.NSCameraUsageDescription).toMatch(/scan check-in codes/);
  });

  it('photos: the plist and expo-image-picker use the same text', () => {
    expect(options(c.plugins, 'expo-image-picker').photosPermission).toBe(plist.NSPhotoLibraryUsageDescription);
  });

  it('location and Bluetooth strings in the plist match their plugins', () => {
    expect(options(c.plugins, 'expo-location').locationWhenInUsePermission).toBe(plist.NSLocationWhenInUseUsageDescription);
    const ble = options(c.plugins, 'munim-bluetooth');
    expect(ble.bluetoothAlwaysUsageDescription).toBe(plist.NSBluetoothAlwaysUsageDescription);
    expect(ble.bluetoothPeripheralUsageDescription).toBe(plist.NSBluetoothPeripheralUsageDescription);
  });

  it('declares no microphone, Face ID, background location or Always-location strings', () => {
    for (const key of [
      'NSMicrophoneUsageDescription',
      'NSFaceIDUsageDescription',
      'NSLocationAlwaysUsageDescription',
      'NSLocationAlwaysAndWhenInUseUsageDescription',
      'NSMotionUsageDescription',
    ]) {
      expect(plist[key]).toBeUndefined();
    }
  });
});
