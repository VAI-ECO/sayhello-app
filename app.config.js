/**
 * Expo configuration (single source of truth). app.json only carries the identity fields (name/slug) that
 * tooling reads statically; everything else lives here and wins.
 *
 * Per-build values come from the environment (EAS profiles in eas.json set APP_ENV; secrets and project ids are
 * EAS environment variables):
 *   API_URL / EXPO_PUBLIC_API_URL        API base (validated by scripts/release-config.cjs; HTTPS required in production)
 *   EAS_PROJECT_ID                       EAS project id (never invented here; push registration reports no_project_id without it)
 *   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY   Stripe publishable key (read by the app from process.env; absent = payments not connected)
 *   STRIPE_MERCHANT_ID                   Apple Pay merchant id (optional)
 */
const { resolveApiUrl } = require('./scripts/release-config.cjs');
const pkg = require('./package.json');

const API_URL = resolveApiUrl(process.env);
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || undefined;
const STRIPE_MERCHANT_ID = process.env.STRIPE_MERCHANT_ID || undefined;

// Bluetooth usage strings are declared only when a BLE library is installed (Apple rejects unused purpose
// strings less often than missing ones, but we keep the manifest honest).
// TODO(BLE stream): when a BLE library (e.g. react-native-ble-plx) lands in package.json this picks it up
// automatically; also add its config plugin to `plugins` below.
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const usesBle = Object.keys(deps).some((name) => /(^|[-/])ble([-/]|$)|bluetooth/i.test(name));

const iosInfoPlist = {
  NSLocationWhenInUseUsageDescription:
    'Say Hello uses your location to show nearby Hello Hangouts and place pins when you meet someone.',
  // Camera / photo strings are also injected by the expo-camera and expo-image-picker plugins below; they are
  // repeated here so the plist is correct even if a plugin option changes.
  NSCameraUsageDescription:
    'Say Hello uses your camera to scan check-in codes and capture photos you choose to share.',
  NSPhotoLibraryUsageDescription:
    'Say Hello accesses only the photos you choose for your profile or to share.',
  // Standard encryption only (HTTPS/TLS): no export-compliance questionnaire at each upload.
  ITSAppUsesNonExemptEncryption: false,
  ...(usesBle
    ? {
        NSBluetoothAlwaysUsageDescription: 'Say Hello uses Bluetooth to help you meet people nearby.',
        NSBluetoothPeripheralUsageDescription:
          'Say Hello uses Bluetooth to confirm you are with the person you said hello to, while the app is open.',
      }
    : {}),
};

// Required-reason API declarations (App Store privacy manifest) for what React Native, Expo and our deps call.
const privacyManifests = {
  NSPrivacyTracking: false,
  NSPrivacyTrackingDomains: [],
  NSPrivacyAccessedAPITypes: [
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
    { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'] },
  ],
};

export default {
  expo: {
    name: 'Say Hello',
    slug: 'sayhello-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    // Deep-link scheme stays `sayhello` (sayhello://r/CODE, sayhello://org/ID, ...).
    scheme: 'sayhello',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sayhello.app',
      // EAS production profile auto-increments this (eas.json: appVersionSource remote + autoIncrement).
      buildNumber: '1',
      infoPlist: iosInfoPlist,
      privacyManifests,
    },
    android: {
      package: 'com.sayhello.app',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      ['expo-image-picker', {
        microphonePermission: false,
        photosPermission: 'Say Hello accesses only the photos you choose for your profile or to share.',
        cameraPermission: 'Say Hello uses your camera to capture photos you choose to share.',
      }],
      ['expo-camera', {
        cameraPermission: 'Say Hello uses your camera to scan check-in codes and capture photos you choose to share.',
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      }],
      ['expo-location', {
        locationWhenInUsePermission:
          'Say Hello uses your location to show nearby Hello Hangouts and place pins when you meet someone.',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      }],
      'expo-notifications',
      // W8-A BLE fine confirmation (built OFF): scan + advertise a per-Hello token, FOREGROUND ONLY.
      // bluetoothBackground:false keeps UIBackgroundModes off (RULES 8.6, 8.11: BLE only operates once Accept
      // brings the app forward). multipeerServiceTypes:false drops the Apple Multipeer / local-network entries.
      // 'neverForLocation' is not set: Android 12+ scan results then need location only if the OS demands it.
      ['munim-bluetooth', {
        bluetoothBackground: false,
        multipeerServiceTypes: false,
        androidBluetoothPermissions: ['scan', 'advertise', 'connect'],
        bluetoothAlwaysUsageDescription: 'Say Hello uses Bluetooth to help you meet people nearby.',
        bluetoothPeripheralUsageDescription: 'Say Hello uses Bluetooth to confirm you are with the person you said hello to, while the app is open.',
      }],
      ['@stripe/stripe-react-native', {
        ...(STRIPE_MERCHANT_ID ? { merchantIdentifier: STRIPE_MERCHANT_ID } : {}),
        enableGooglePay: false,
      }],
    ],
    extra: {
      // Environment variables exposed to the app at runtime
      apiUrl: API_URL,
      // Left undefined when EAS_PROJECT_ID is not set: nothing is invented.
      ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
    },
  },
};
