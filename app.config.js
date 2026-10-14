const fs = require('node:fs');

module.exports = ({ config }) => {
  const iosServices = process.env.GOOGLE_SERVICES_IOS || config.ios?.googleServicesFile;
  const androidServices = process.env.GOOGLE_SERVICES_ANDROID || config.android?.googleServicesFile;
  const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  const urlSchemes = [...new Set(['sayhello', ...(config.ios?.infoPlist?.CFBundleURLTypes || []).flatMap(type => type.CFBundleURLSchemes || [])])];
  return {
    ...config,
    scheme: 'sayhello',
    ios: {
      ...config.ios,
      infoPlist: { ...config.ios?.infoPlist, CFBundleURLTypes: [{ CFBundleURLSchemes: urlSchemes }] },
      googleServicesFile: iosServices && fs.existsSync(iosServices) ? iosServices : undefined,
      config: { ...config.ios?.config, googleMapsApiKey: mapsKey || undefined },
    },
    android: {
      ...config.android,
      googleServicesFile: androidServices && fs.existsSync(androidServices) ? androidServices : undefined,
      config: { ...config.android?.config, googleMaps: { apiKey: mapsKey || undefined } },
    },
  };
};
