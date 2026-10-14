function resolveApiUrl(env = process.env) {
  const value = env.API_URL || env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  const release = env.APP_ENV === 'production' || env.EAS_BUILD_PROFILE === 'production';
  if (!release) return value;
  let url;
  try { url = new URL(value); } catch { throw new Error('Production API_URL must be a valid HTTPS URL'); }
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
    host === '[::1]' || host === '0.0.0.0' || /^127\./.test(host) || /^10\./.test(host) ||
    /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (url.protocol !== 'https:' || local || url.username || url.password) {
    throw new Error('Production API_URL must use public HTTPS without embedded credentials');
  }
  return value.replace(/\/$/, '');
}

/**
 * Android permissions the Expo prebuild template adds under "OPTIONAL PERMISSIONS, REMOVE WHATEVER YOU DO NOT NEED"
 * that this app never uses: no overlay windows (SYSTEM_ALERT_WINDOW is only for dev overlays) and nothing writes to
 * shared storage (no media-library save / file-system writes in app code). Blocked for preview and production builds
 * only; development builds keep them for the dev client. READ_EXTERNAL_STORAGE (image picker) and VIBRATE (also
 * declared by expo-notifications) are deliberately left alone.
 */
const UNUSED_ANDROID_PERMISSIONS = [
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

function releaseBlockedPermissions(env = process.env) {
  const profile = env.APP_ENV || env.EAS_BUILD_PROFILE;
  return profile === 'preview' || profile === 'production' ? [...UNUSED_ANDROID_PERMISSIONS] : [];
}

module.exports = { resolveApiUrl, releaseBlockedPermissions, UNUSED_ANDROID_PERMISSIONS };
