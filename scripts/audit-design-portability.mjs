import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Read-only against preserved originals. Reports are derived evidence, not a
// canonical manifest or proof of rendered/offline parity.
const appRoot = path.resolve(import.meta.dirname, '..');
const receipt = JSON.parse(fs.readFileSync(path.join(appRoot, 'docs/design-preservation-receipt.json'), 'utf8'));
const preservationRoot = path.dirname(receipt.originalArchive);
const designRoot = path.join(preservationRoot, 'design');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const verified = receipt.files.map(record => {
  const absolute = path.resolve(preservationRoot, record.file);
  if (!absolute.startsWith(preservationRoot + path.sep)) throw new Error('Receipt path outside preservation directory');
  const bytes = fs.readFileSync(absolute);
  if (sha(bytes) !== record.sha256 || bytes.length !== record.bytes) throw new Error(`Preserved source changed: ${record.file}`);
  return { ...record, absolute };
});
if (sha(fs.readFileSync(receipt.originalArchive)) !== receipt.archiveSHA256) throw new Error('Preserved archive changed');

function references(source) {
  // This deliberately records static navigation as well as asset references.
  // JavaScript expressions, srcset, embedded archives and fetched CSS require
  // a browser/network audit; never interpret zero missing refs as full closure.
  return [...new Set([...source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^)'"\s]+)/g)]
    .map(match => decode(match[1] || match[2])))];
}
function resolveReference(file, ref) {
  if (/^(?:https?:)?\/\//i.test(ref)) return { kind: 'external', ref };
  if (/^(?:data:|blob:|mailto:|tel:|javascript:|#)/i.test(ref)) return null;
  if (/[{}]/.test(ref) || ref === '\\') return { kind: 'dynamic', ref };
  let clean = ref.split(/[?#]/)[0];
  if (!clean) return null;
  try { clean = decodeURIComponent(clean); } catch { return { kind: 'unresolved', ref }; }
  const target = clean.startsWith('/') ? path.resolve(designRoot, '.' + clean) : path.resolve(path.dirname(file), clean);
  if (!target.startsWith(designRoot + path.sep)) return { kind: 'outside-root', ref };
  return { kind: fs.existsSync(target) ? 'local-present' : 'local-missing', ref, target: path.relative(designRoot, target) };
}
const html = verified.filter(row => row.file.endsWith('.html')).map(row => {
  const source = fs.readFileSync(row.absolute, 'utf8');
  return {
    file: path.relative(designRoot, row.absolute), sha256: row.sha256,
    rootCanvas: path.dirname(row.absolute) === designRoot,
    templateLoops: /v-for\s*=/.test(source),
    refs: references(source).map(ref => resolveReference(row.absolute, ref)).filter(Boolean),
  };
});
const runtimes = verified.filter(row => /(?:^|\/)support\.js$/.test(row.file)).map(row => {
  const source = fs.readFileSync(row.absolute, 'utf8');
  const urls = [...source.matchAll(/var (REACT_URL|REACT_DOM_URL|BABEL_URL) = "([^"]+)"/g)].map(match => ({
    name: match[1], url: match[2], line: source.slice(0, match.index).split('\n').length,
    condition: match[1] === 'BABEL_URL' ? 'JSX x-import only, unless Babel is already present or __resources redirects it' : 'Boot, unless React and ReactDOM already exist or __resources redirects it',
  }));
  return { file: path.relative(designRoot, row.absolute), sha256: row.sha256, urls,
    hidesRawTemplate: source.includes('x-dc{display:none!important}'),
    waitsForReactBeforeInit: source.includes('loadReactUmd().then(init)'),
  };
});
const rootHtml = html.filter(row => row.rootCanvas);
const missing = html.flatMap(row => row.refs.filter(ref => ref.kind === 'local-missing').map(ref => ({ file: row.file, ...ref })));
const remote = [...new Set(rootHtml.flatMap(row => row.refs.filter(ref => ref.kind === 'external').map(ref => ref.ref)))].sort();
const summary = {
  preservedFilesVerified: verified.length, htmlDocuments: html.length, rootHtmlDocuments: rootHtml.length,
  rootMissingStaticReferences: missing.filter(row => !row.file.includes('/')).length,
  nestedMissingStaticReferences: missing.filter(row => row.file.includes('/')).length,
  rootHtmlWithTemplateLoops: rootHtml.filter(row => row.templateLoops).length,
  rootHtmlReferencingSupportRuntime: rootHtml.filter(row => row.refs.some(ref => ref.target === 'support.js')).length,
  supportRuntimeCopies: runtimes.length, distinctSupportRuntimeHashes: new Set(runtimes.map(row => row.sha256)).size,
};
const result = {
  generated: new Date().toISOString(), preservationRoot, archiveSHA256: receipt.archiveSHA256, summary,
  verdict: 'Original bytes verified; offline rendering NOT verified. Root templates rely on a runtime that loads CDN scripts, and root HTML references remote font stylesheets.',
  limitations: ['Static quoted src/href and CSS url scan only; navigation links included.', 'No dynamic execution, srcset enumeration, fetched CSS traversal, embedded archive decoding, visual or device verification.', 'Nested export failures are not proof that the matching root artwork is missing.', 'No originals modified and no third-party resources downloaded by this audit.'],
  rootExternalReferences: remote, missingStaticReferences: missing, runtimes, html,
};
fs.writeFileSync(path.join(appRoot, 'docs/design-portability-audit.json'), JSON.stringify(result, null, 2) + '\n');
const rows = missing.map(row => `| ${row.file.replaceAll('|', '\\|')} | ${row.ref.replaceAll('|', '\\|')} |`).join('\n');
const md = `# Say Hello — preserved design portability audit

Generated ${result.generated}. Originals: ${preservationRoot}.

## Verdict

${result.verdict}

All **${summary.preservedFilesVerified} preserved files** and the original ZIP still match the preservation receipt. This checks integrity, not completeness of the design delivery.

The ${summary.rootHtmlDocuments} root HTML documents have **${summary.rootMissingStaticReferences} missing static local references**. However, ${summary.rootHtmlReferencingSupportRuntime} reference support.js; its boot path hides the raw x-dc template and waits for React. That runtime loads React 18.3.1 and ReactDOM 18.3.1 from unpkg unless already supplied. Babel 7.29.0 is an additional conditional JSX-import dependency. Copying support.js alone is therefore not an offline handoff. Existing embedded standalone exports need a separate runtime check; this finding must not be generalized to those wrappers.

There are ${summary.rootHtmlWithTemplateLoops} root documents with v-for templates. Literal frame-marker counts are not a verified count of rendered screens.

## Required final-export acceptance checks

1. Bundle the exact compatible runtime dependencies and their licenses, and local font files/stylesheets. Preserve font weights/styles and glyph coverage; do not substitute system fonts.
2. Resolve every asset URL relative to the final package, including runtime imports, nested CSS, images, and font URLs. Keep originals unchanged; identify any portable derivative separately.
3. Serve the final package locally in a fresh browser context with remote network requests blocked and no cached fonts/scripts. Open every final canvas, wait for fonts and rendering, record console/network failures, and enumerate rendered frame labels, IDs and dimensions.
4. Compare rendered previews to the approved originals and canonical manifest. Prove required states and sizes; do not silently drop loop-generated frames, variants or aliases.
5. Retain checksums, licenses, editable HTML, rendered previews and a linked manifest/index. Only then mark offline delivery verified.

## Root external references

${remote.map(url => '- ' + url).join('\n')}

## Nested missing static references

These ${summary.nestedMissingStaticReferences} reference occurrences are packaging gaps, not unique missing-screen counts. Static href scans also include navigation links. See JSON for per-file hashes, runtime URLs and all references.

| Source | Reference not found at its relative path |
| --- | --- |
${rows}

## Scope limits

${result.limitations.map(item => '- ' + item).join('\n')}
`;
fs.writeFileSync(path.join(appRoot, 'docs/design-portability-audit.md'), md);
console.log(JSON.stringify(summary, null, 2));
