#!/usr/bin/env node
/**
 * Writes <out>/.well-known/assetlinks.json for Android App Links.
 *
 *   ANDROID_SHA256_CERT_FINGERPRINTS="AA:BB:..,CC:DD:.." node scripts/generate-assetlinks.cjs [outDir]
 *
 * Refuses to write anything when no fingerprint is supplied (nothing is invented). The fingerprint comes from the
 * Play App Signing / EAS upload certificate and is owner/account data. Hosting the file on the link domain is an
 * infrastructure step (APP-STORE-BUILD-PLAN C-2); this script does not publish anything.
 */
const fs = require('fs');
const path = require('path');
const { buildAssetLinks } = require('./universal-links.cjs');

function main(env = process.env, argv = process.argv) {
  const outDir = argv[2] || 'dist';
  let doc;
  try {
    doc = buildAssetLinks(env.ANDROID_SHA256_CERT_FINGERPRINTS);
  } catch (e) {
    console.error(`generate-assetlinks: ${e.message}`);
    return 1;
  }
  const dir = path.join(outDir, '.well-known');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'assetlinks.json');
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
  console.log(`generate-assetlinks: wrote ${file}`);
  return 0;
}

if (require.main === module) process.exit(main());
module.exports = { main };
