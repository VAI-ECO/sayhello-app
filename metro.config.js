const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const config = getSentryExpoConfig(__dirname);

// Add resolver to stub out native-only modules on web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // List of native-only modules to stub on web
    const nativeOnlyModules = [
      '@stripe/stripe-react-native',
      'react-native-maps',
      'expo-camera',
      'react-native-phone-number-input',
      'react-native-country-picker-modal',
    ];

    // If we're on web and the module is native-only, use our stub
    if (platform === 'web' && nativeOnlyModules.includes(moduleName)) {
      return {
        filePath: path.resolve(__dirname, 'web-stubs/native-stub.js'),
        type: 'sourceFile',
      };
    }

    // Otherwise, use the default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
