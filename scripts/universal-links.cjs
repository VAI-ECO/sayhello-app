/**
 * Universal / App Link configuration helpers (pure, no I/O).
 *
 * The link domain is an OPEN OWNER DECISION (OPEN-DECISIONS W8-7): nothing here defaults to a domain.
 * UNIVERSAL_LINK_DOMAIN unset => no https link handling is declared and the app keeps the sayhello:// scheme only.
 *
 * Android shapes verified against developer.android.com/training/app-links/verify-android-applinks and Expo's
 * config types (android.intentFilters). The iOS side (associatedDomains + apple-app-site-association) is deliberately
 * NOT implemented: its file format could not be verified from an authoritative source in this lane (see
 * INTEGRATION-NOTES.md).
 */

/** Android package; app.config.js and a unit test keep this equal to android.package. */
const ANDROID_PACKAGE = 'com.sayhello.app';

/**
 * Path prefixes the app's link resolver (src/lib/deep-links.ts) opens: /r/:code, /join?code=, /claim?token=, /org/:id.
 * Bare creator codes (https://<domain>/<code>) and Hootza ids (https://<domain>/<uuid>) cannot be expressed as a prefix;
 * they need UNIVERSAL_LINK_SCOPE=all (claims every path on the host) - an owner/domain decision, not made here.
 */
const LINK_PATH_PREFIXES = ['/r/', '/join', '/claim', '/org/'];

const HOSTNAME = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const SHA256_FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

/** The configured link domain (lower-cased hostname) or undefined. Throws on anything that is not a bare hostname. */
function resolveLinkDomain(env = process.env) {
  const raw = (env.UNIVERSAL_LINK_DOMAIN || '').trim();
  if (!raw) return undefined;
  const host = raw.toLowerCase();
  if (!HOSTNAME.test(host)) {
    throw new Error('UNIVERSAL_LINK_DOMAIN must be a bare hostname such as links.example.com (no scheme, path or port)');
  }
  return host;
}

function resolveLinkScope(env = process.env) {
  const scope = (env.UNIVERSAL_LINK_SCOPE || 'listed').trim().toLowerCase();
  if (scope !== 'listed' && scope !== 'all') throw new Error("UNIVERSAL_LINK_SCOPE must be 'listed' or 'all'");
  return scope;
}

/** Expo android.intentFilters entries for the domain (empty when no domain is set). */
function androidIntentFilters(domain, scope = 'listed') {
  if (!domain) return [];
  const data =
    scope === 'all'
      ? [{ scheme: 'https', host: domain }]
      : LINK_PATH_PREFIXES.map((pathPrefix) => ({ scheme: 'https', host: domain, pathPrefix }));
  return [{ autoVerify: true, action: 'VIEW', data, category: ['BROWSABLE', 'DEFAULT'] }];
}

/** Digital Asset Links document for https://<domain>/.well-known/assetlinks.json. Never invents a fingerprint. */
function buildAssetLinks(fingerprints, packageName = ANDROID_PACKAGE) {
  const list = (Array.isArray(fingerprints) ? fingerprints : String(fingerprints || '').split(','))
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);
  if (list.length === 0) throw new Error('At least one SHA-256 signing certificate fingerprint is required');
  const bad = list.filter((f) => !SHA256_FINGERPRINT.test(f));
  if (bad.length) throw new Error(`Not a SHA-256 colon-separated fingerprint (32 bytes): ${bad.join(', ')}`);
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: list },
    },
  ];
}

module.exports = {
  ANDROID_PACKAGE,
  LINK_PATH_PREFIXES,
  resolveLinkDomain,
  resolveLinkScope,
  androidIntentFilters,
  buildAssetLinks,
};
