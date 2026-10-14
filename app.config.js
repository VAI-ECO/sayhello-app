/**
 * Expo configuration with environment variable support
 *
 * Reads .env file and exposes variables via Constants.expoConfig.extra
 */

// Read .env file if it exists
// In production builds, use environment variables from the build server
const { resolveApiUrl } = require('./scripts/release-config.cjs');
const API_URL = resolveApiUrl(process.env);

export default {
  expo: {
    name: 'Say Hello',
    slug: 'sayhello-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'sayhello',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sayhello.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Say Hello uses your location to show nearby Hello Hangouts and place pins when you meet someone.',
        NSBluetoothAlwaysUsageDescription:
          'Say Hello uses Bluetooth to help you meet people nearby.',
      },
    },
    android: {
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
      }],
      ['expo-camera', {
        cameraPermission: 'Say Hello uses your camera to scan check-in codes and capture photos you choose to share.',
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      }],
      'expo-location',
      'expo-notifications',
    ],
    extra: {
      // Environment variables exposed to the app at runtime
      apiUrl: API_URL,
    },
  },
};
