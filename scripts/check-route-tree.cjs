const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { getRoutes } = require('expo-router/build/getRoutesCore');
const root = path.resolve(__dirname, '..');
const app = path.join(root, 'app');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files = walk(app).filter(f=>/\.[tj]sx?$/.test(f));
assert(!files.some(f=>/__tests__|\.(test|spec)\./.test(f)), 'Test modules must not enter the production route context');
const context = () => ({ default: () => null });
context.keys = () => files.map(f=>'./'+path.relative(app,f).split(path.sep).join('/'));
const tree = getRoutes(context,{ platform:'ios', importMode:'lazy', ignoreEntryPoints:true });
const tabs = tree.children.find(r=>r.route==='(tabs)');
assert(tabs, 'Missing tabs layout');
const hiddenProfileRoutes = ['profile/add-role','profile/blocked','profile/contact','profile/delete-account','profile/edit','profile/host-mode','profile/icebreakers','profile/legal','profile/notifications','profile/romance','profile/strikes'];
assert.deepEqual(tabs.children.map(r=>r.route).sort(), ['index','points','profile','hellos','map',...hiddenProfileRoutes].sort());
assert.deepEqual(tabs.children.find(r=>r.route==='map').children.map(r=>r.route).sort(),['empty','index','place']);
const tabSource = fs.readFileSync(path.join(app,'(tabs)/_layout.tsx'),'utf8');
for(const hidden of hiddenProfileRoutes) assert(tabSource.includes(`name="${hidden}" options={{ href: null }}`),`${hidden} must not become an extra main tab`);
const destinations=[];
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node){
    if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.expression.getText(parsed)==='router'&&['push','replace','navigate'].includes(node.expression.name.text)){
      let arg=node.arguments[0];
      if(arg&&ts.isObjectLiteralExpression(arg)) arg=arg.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(parsed)==='pathname')?.initializer;
      if(arg&&ts.isStringLiteralLike(arg)) destinations.push({source:path.relative(root,file),destination:arg.text});
    }
    ts.forEachChild(node,visit);
  }
  visit(parsed);
}
const normalize=p=>('/'+p).replace(/\/+/g,'/').replace(/\/\([^/]+\)/g,'').replace(/\/index$/,'').replace(/\/$/,'')||'/';
const patterns=files.filter(f=>!f.endsWith('/_layout.tsx')).map(f=>normalize(path.relative(app,f).replace(/\.[tj]sx?$/,''))).map(p=>new RegExp('^'+p.replace(/[.*+?^${}()|\\]/g,'\\$&').replace(/\[\.\.\.[^\]]+\]/g,'.+').replace(/\[[^\]]+\]/g,'[^/]+')+'$'));
const missing=destinations.filter(d=>d.destination.startsWith('/')&&!patterns.some(p=>p.test(normalize(d.destination))));
console.log(JSON.stringify({routeModules:files.length,tabRoutes:tabs.children.map(r=>r.route),literalNavigationCalls:destinations.length,unresolvedLiteralDestinations:missing},null,2));
assert.equal(missing.length,0,'Literal destinations do not resolve to a screen');
