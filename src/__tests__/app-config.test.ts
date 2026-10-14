/* eslint-disable @typescript-eslint/no-var-requires */
function load(env: Record<string, string | undefined>) {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const k of Object.keys(env)) if (env[k] === undefined) delete process.env[k];
  try { return require('../../app.config.js').default({ config: {} }); } finally { process.env = saved; }
}

describe('app.config.js', () => {
  it('keeps the sayhello scheme, store-required plist keys and privacy manifest', () => {
    const c = load({ EAS_PROJECT_ID: undefined });
    expect(c.scheme).toBe('sayhello');
    expect(c.ios.infoPlist.ITSAppUsesNonExemptEncryption).toBe(false);
    expect(c.ios.infoPlist.NSCameraUsageDescription).toBeTruthy();
    expect(c.ios.infoPlist.NSPhotoLibraryUsageDescription).toBeTruthy();
    expect(c.ios.infoPlist.NSLocationWhenInUseUsageDescription).toBeTruthy();
    expect(c.ios.buildNumber).toBe('1');
    expect(c.android.versionCode).toBe(1);
    expect(c.ios.privacyManifests.NSPrivacyAccessedAPITypes.length).toBeGreaterThanOrEqual(4);
  });
  it('does not invent an EAS project id', () => {
    expect(load({ EAS_PROJECT_ID: undefined }).extra.eas).toBeUndefined();
    expect(load({ EAS_PROJECT_ID: 'abc-123' }).extra.eas.projectId).toBe('abc-123');
  });
});
