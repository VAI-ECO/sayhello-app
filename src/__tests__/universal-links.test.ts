/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const links = require('../../scripts/universal-links.cjs');
const { main: generate } = require('../../scripts/generate-assetlinks.cjs');

const FP = Array.from({ length: 32 }, (_, i) => i.toString(16).padStart(2, '0').toUpperCase()).join(':');

function loadConfig(env: Record<string, string | undefined>) {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const k of Object.keys(env)) if (env[k] === undefined) delete process.env[k];
  try { return require('../../app.config.js').default({ config: {} }); } finally { process.env = saved; }
}

describe('resolveLinkDomain', () => {
  it('is undefined when unset or blank (no domain is ever invented)', () => {
    expect(links.resolveLinkDomain({})).toBeUndefined();
    expect(links.resolveLinkDomain({ UNIVERSAL_LINK_DOMAIN: '  ' })).toBeUndefined();
  });
  it('lower-cases a bare hostname', () => {
    expect(links.resolveLinkDomain({ UNIVERSAL_LINK_DOMAIN: 'Links.Example.com' })).toBe('links.example.com');
  });
  it.each(['https://example.com', 'example.com/path', 'example.com:8080', 'localhost', 'exa mple.com', '-bad.example.com'])(
    'rejects %s',
    (value) => {
      expect(() => links.resolveLinkDomain({ UNIVERSAL_LINK_DOMAIN: value })).toThrow(/bare hostname/);
    },
  );
});

describe('androidIntentFilters', () => {
  it('declares nothing without a domain', () => {
    expect(links.androidIntentFilters(undefined)).toEqual([]);
  });
  it('declares a verified https VIEW filter limited to the resolver path prefixes', () => {
    const [filter] = links.androidIntentFilters('links.example.com');
    expect(filter.autoVerify).toBe(true);
    expect(filter.action).toBe('VIEW');
    expect(filter.category).toEqual(['BROWSABLE', 'DEFAULT']);
    expect(filter.data).toEqual(
      links.LINK_PATH_PREFIXES.map((pathPrefix: string) => ({ scheme: 'https', host: 'links.example.com', pathPrefix })),
    );
  });
  it("'all' scope claims the whole host", () => {
    const [filter] = links.androidIntentFilters('links.example.com', 'all');
    expect(filter.data).toEqual([{ scheme: 'https', host: 'links.example.com' }]);
  });
  it('rejects an unknown scope', () => {
    expect(() => links.resolveLinkScope({ UNIVERSAL_LINK_SCOPE: 'everything' })).toThrow(/listed|all/);
  });
});

describe('buildAssetLinks', () => {
  it('builds the handle_all_urls document for the package', () => {
    expect(links.buildAssetLinks([FP])).toEqual([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: { namespace: 'android_app', package_name: 'com.sayhello.app', sha256_cert_fingerprints: [FP] },
      },
    ]);
  });
  it('accepts a comma separated string and normalises case', () => {
    const doc = links.buildAssetLinks(`${FP.toLowerCase()}, ${FP}`);
    expect(doc[0].target.sha256_cert_fingerprints).toEqual([FP, FP]);
  });
  it('refuses to invent a fingerprint', () => {
    expect(() => links.buildAssetLinks(undefined)).toThrow(/required/);
    expect(() => links.buildAssetLinks('')).toThrow(/required/);
  });
  it('rejects malformed fingerprints', () => {
    expect(() => links.buildAssetLinks('AA:BB:CC')).toThrow(/SHA-256/);
  });
});

describe('generate-assetlinks', () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'assetlinks-'));
  it('exits non-zero and writes nothing without a fingerprint', () => {
    const out = tmp();
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(generate({}, ['node', 'script', out])).toBe(1);
    expect(fs.existsSync(path.join(out, '.well-known'))).toBe(false);
    err.mockRestore();
  });
  it('writes .well-known/assetlinks.json when a fingerprint is supplied', () => {
    const out = tmp();
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(generate({ ANDROID_SHA256_CERT_FINGERPRINTS: FP }, ['node', 'script', out])).toBe(0);
    const written = JSON.parse(fs.readFileSync(path.join(out, '.well-known', 'assetlinks.json'), 'utf8'));
    expect(written[0].target.package_name).toBe('com.sayhello.app');
    log.mockRestore();
  });
});

describe('app.config.js link handling', () => {
  it('keeps the helper package name equal to android.package', () => {
    expect(loadConfig({ UNIVERSAL_LINK_DOMAIN: undefined }).android.package).toBe(links.ANDROID_PACKAGE);
  });
  it('declares no intent filters and no iOS associated domains while the domain is unset', () => {
    const c = loadConfig({ UNIVERSAL_LINK_DOMAIN: undefined });
    expect(c.android.intentFilters).toBeUndefined();
    expect(c.ios.associatedDomains).toBeUndefined();
    expect(c.scheme).toBe('sayhello');
  });
  it('adds the Android filter when a domain is configured', () => {
    const c = loadConfig({ UNIVERSAL_LINK_DOMAIN: 'links.example.com' });
    expect(c.android.intentFilters).toHaveLength(1);
    expect(c.android.intentFilters[0].data[0].host).toBe('links.example.com');
  });
});
