/* eslint-disable @typescript-eslint/no-var-requires */
const { releaseBlockedPermissions } = require('../../scripts/release-config.cjs');

function loadConfig(env: Record<string, string | undefined>) {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const k of Object.keys(env)) if (env[k] === undefined) delete process.env[k];
  try { return require('../../app.config.js').default({ config: {} }); } finally { process.env = saved; }
}

describe('releaseBlockedPermissions', () => {
  it.each(['preview', 'production'])('blocks the unused template permissions for %s', (APP_ENV) => {
    expect(releaseBlockedPermissions({ APP_ENV })).toEqual([
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ]);
  });
  it('also follows the EAS build profile', () => {
    expect(releaseBlockedPermissions({ EAS_BUILD_PROFILE: 'production' })).toHaveLength(2);
  });
  it.each([{}, { APP_ENV: 'development' }])('blocks nothing for development builds (%j)', (env) => {
    expect(releaseBlockedPermissions(env)).toEqual([]);
  });
  it('never blocks permissions the app or its libraries need', () => {
    const blocked = releaseBlockedPermissions({ APP_ENV: 'production' });
    for (const needed of ['READ_EXTERNAL_STORAGE', 'VIBRATE', 'CAMERA', 'INTERNET', 'POST_NOTIFICATIONS', 'BLUETOOTH_SCAN']) {
      expect(blocked).not.toContain(`android.permission.${needed}`);
    }
  });
});

describe('app.config.js blockedPermissions', () => {
  it('is absent in development and present in production', () => {
    expect(loadConfig({ APP_ENV: undefined, EAS_BUILD_PROFILE: undefined }).android.blockedPermissions).toBeUndefined();
    expect(
      loadConfig({ APP_ENV: 'production', API_URL: 'https://api.example.com' }).android.blockedPermissions,
    ).toEqual(['android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.WRITE_EXTERNAL_STORAGE']);
  });
});
