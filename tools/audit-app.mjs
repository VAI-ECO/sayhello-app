import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
export const root = path.resolve(import.meta.dirname, '..');
const globals = new Set('console Promise JSON Math Date Array Object String Number Boolean Set Map Error RegExp Infinity NaN undefined parseInt parseFloat isNaN isFinite setTimeout clearTimeout setInterval clearInterval fetch alert FormData URL require module exports process __DEV__ window global navigator Intl arguments'.split(' '));
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
export function resolveSource(file, target) {
  const base = path.resolve(root, path.dirname(file), target);
  return [base, base + '.jsx', base + '.js', base + '.json', path.join(base, 'index.jsx'), path.join(base, 'index.js')]
    .find(p => fs.existsSync(p) && fs.statSync(p).isFile());
}
export function analyzeFile(file, code) {
  const result = { file, errors: [], routes: [], destinations: [], dynamicNavigation: [], imports: [], missingImports: [], translations: [], noOpButtons: [], endpoints: [] };
  let ast;
  try { ast = parse(code, { sourceType: 'module', plugins: ['jsx'] }); }
  catch (error) { result.errors.push({ kind: 'syntax', line: error.loc?.line, message: error.message }); return result; }
  const imports = new Map();
  for (const node of ast.program.body) if (node.type === 'ImportDeclaration') {
    for (const specifier of node.specifiers) imports.set(specifier.local.name, node.source.value);
    result.imports.push(node.source.value);
    if (node.source.value.startsWith('.') && !resolveSource(file, node.source.value)) result.missingImports.push({ line: node.loc.start.line, target: node.source.value });
  }
  traverse(ast, {
    ReferencedIdentifier(p) {
      if (!p.scope.hasBinding(p.node.name) && !globals.has(p.node.name)) result.errors.push({ kind: 'undefined', line: p.node.loc.start.line, message: p.node.name });
    },
    JSXOpeningElement(p) {
      const n = p.node;
      if (n.name.type === 'JSXMemberExpression' && n.name.property.name === 'Screen') {
        const name = n.attributes.find(a => a.name?.name === 'name')?.value?.value;
        const component = n.attributes.find(a => a.name?.name === 'component')?.value?.expression?.name;
        if (name) {
          const target = imports.get(component);
          const resolved = target ? resolveSource(file, target) : undefined;
          result.routes.push({ name, component, line: n.loc.start.line, source: resolved ? path.relative(root, resolved) : null });
        }
      }
      for (const a of n.attributes) {
        const expression = a.value?.expression;
        if (a.name?.name === 'onPress' && expression?.body?.type === 'BlockStatement' && expression.body.body.length === 0) result.noOpButtons.push(n.loc.start.line);
      }
    },
    CallExpression(p) {
      const n = p.node;
      if (n.callee.type === 'Identifier' && n.callee.name === 'require' && n.arguments[0]?.type === 'StringLiteral') {
        const target = n.arguments[0].value;
        if (target.startsWith('.') && !resolveSource(file, target)) result.missingImports.push({ line: n.loc.start.line, target });
      }
      if (n.callee.type !== 'MemberExpression') return;
      const method = n.callee.property.name;
      if (['navigate', 'replace', 'push'].includes(method) && ['navigation', 'navigator'].includes(n.callee.object.name)) {
        if (n.arguments[0]?.type === 'StringLiteral') result.destinations.push({ name: n.arguments[0].value, line: n.loc.start.line });
        else result.dynamicNavigation.push({ expression: code.slice(n.arguments[0]?.start, n.arguments[0]?.end), line: n.loc.start.line });
      }
      if (method === 't' && n.callee.object.name === 'i18n' && n.arguments[0]?.type === 'StringLiteral') result.translations.push(n.arguments[0].value);
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method) && ['requests', 'axios', 'instance'].includes(n.callee.object.name)) {
        const arg = n.arguments[0];
        if (arg) result.endpoints.push({ method: method.toUpperCase(), expression: code.slice(arg.start, arg.end), line: n.loc.start.line });
      }
    },
  });
  return result;
}
export function audit() {
  const files = ['App.js', 'AppConfig.js', ...['Screens', 'Component', 'Context', 'navigation', 'Services', 'features'].flatMap(d => walk(path.join(root, d)).map(p => path.relative(root, p)))].filter(f => /\.(js|jsx)$/.test(f));
  const analyzed = files.map(file => analyzeFile(file, fs.readFileSync(path.join(root, file), 'utf8')));
  const routes = analyzed.flatMap(r => r.routes.map(route => ({ ...route, navigator: r.file })));
  const routeNames = new Set(routes.map(r => r.name));
  const screenSources = new Set(routes.map(r => r.source).filter(f => f?.startsWith('Screens/')));
  const english = JSON.parse(fs.readFileSync(path.join(root, 'locales/en/translation.json'), 'utf8'));
  for (const row of analyzed) {
    row.unresolvedDestinations = row.destinations.filter(d => !routeNames.has(d.name));
    row.missingEnglish = [...new Set(row.translations)].filter(key => key.split('.').reduce((v, k) => v?.[k], english) === undefined);
    row.registeredAs = routes.filter(r => r.source === row.file).map(r => `${r.navigator}: ${r.name}`);
    try {
      const before = analyzeFile(row.file, execFileSync('git', ['show', `HEAD:${row.file}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
      row.baselineErrors = before.errors;
    } catch { row.baselineErrors = []; }
    row.status = row.errors.length || row.missingImports.length || row.unresolvedDestinations.length ? 'Source issue remains' : 'Source checks pass; device/backend not verified';
  }
  const report = {
    generated: new Date().toISOString(),
    commit: execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    scope: 'Static review of all application JS/JSX. A passing source check is not a rendering, behavior, design-fidelity, or App Store approval test.',
    counts: { sourceFiles: analyzed.length, screenDirectoryFiles: analyzed.filter(r => r.file.startsWith('Screens/')).length, routeRegistrations: routes.length, uniqueRouteNames: routeNames.size, uniqueRegisteredScreenSources: screenSources.size, sourceErrors: analyzed.reduce((n, r) => n + r.errors.length, 0), baselineSourceErrors: analyzed.reduce((n, r) => n + r.baselineErrors.length, 0), missingImports: analyzed.reduce((n, r) => n + r.missingImports.length, 0), unresolvedDestinations: analyzed.reduce((n, r) => n + r.unresolvedDestinations.length, 0) },
    routes, files: analyzed,
  };
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/say-hello-audit.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = audit();
  console.log(JSON.stringify(result.counts, null, 2));
  for (const file of result.files.filter(f => f.errors.length || f.missingImports.length || f.unresolvedDestinations.length)) console.log(file.file, JSON.stringify({ errors: file.errors, imports: file.missingImports, destinations: file.unresolvedDestinations }));
  process.exitCode = result.counts.sourceErrors + result.counts.missingImports + result.counts.unresolvedDestinations ? 1 : 0;
}
