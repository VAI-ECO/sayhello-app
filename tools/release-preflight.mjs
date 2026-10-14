import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
require('@expo/env').load(root);
const { exp } = require('@expo/config').getConfig(root, { skipSDKVersionRequirement: true });
const failures = [];
for (const name of ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_SOCKET_URL']) {
  try {
    const url = new URL(process.env[name]);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) throw new Error();
  } catch { failures.push(`${name}: configure a production HTTPS endpoint.`); }
}
if (!process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY?.startsWith('pk_live_')) failures.push('EXPO_PUBLIC_STRIPE_PUBLIC_KEY: production key missing. Separately resolve iOS in-app purchase requirements before paid publishing.');
if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY || /your_|placeholder/.test(process.env.EXPO_PUBLIC_GOOGLE_API_KEY)) failures.push('EXPO_PUBLIC_GOOGLE_API_KEY: geocoding key missing.');
const icon = path.resolve(root, exp.icon);
if (fs.existsSync(icon)) {
  const png = fs.readFileSync(icon);
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  if (width !== 1024 || height !== 1024) failures.push(`PNG icon is ${width} × ${height}; provide the approved 1024 × 1024 opaque square master.`);
} else failures.push('Configured icon file missing.');
const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
if (JSON.stringify(eas).includes('sntrys_')) failures.push('Remove and rotate the committed Sentry credential.');
console.log(failures.length ? `RELEASE BLOCKED (${failures.length} configuration issues)\n${failures.map(x => '- ' + x).join('\n')}` : 'Configuration checks passed. Native archive, device QA, metadata, payments and moderation still require sign-off.');
process.exitCode = failures.length ? 1 : 0;
