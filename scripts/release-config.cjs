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
module.exports = { resolveApiUrl };
