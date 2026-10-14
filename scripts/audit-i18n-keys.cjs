const ts=require(''+__dirname+'/../node_modules/typescript');const fs=require('fs'),path=require('path');
const root=''+__dirname+'/..';
require('module');
// load en via ts-node-like transpile of all i18n files
const cache={};
function load(f){if(cache[f])return cache[f].exports;const src=fs.readFileSync(f,'utf8');const out=ts.transpileModule(src,{compilerOptions:{module:'commonjs',target:'es2020'}}).outputText;const m={exports:{}};cache[f]=m;
 const req=(p)=>{if(p.startsWith('.')){let q=path.resolve(path.dirname(f),p);for(const e of ['','.ts','.tsx','/index.ts'])if(fs.existsSync(q+e)&&fs.statSync(q+e).isFile())return load(q+e);}return require(p)};
 new Function('module','exports','require',out)(m,m.exports,req);return m.exports}
const en=load(root+'/src/i18n/en.ts').en;
const files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='dist'||e.name==='__tests__')continue;const p=path.join(d,e.name);if(e.isDirectory())w(p);else if(/\.(tsx?)$/.test(e.name)&&!p.includes('/i18n/'))files.push(p)}})(root+'/app');(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='__tests__')continue;const p=path.join(d,e.name);if(e.isDirectory())w(p);else if(/\.(tsx?)$/.test(e.name)&&!p.includes('/i18n/'))files.push(p)}})(root+'/src');
const miss={};
for(const f of files){const s=fs.readFileSync(f,'utf8');for(const m of s.matchAll(/\bt\(\s*'([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)'/g)){const k=m[1];let v=en;for(const p of k.split('.')){v=v?.[p]}
 if(typeof v!=='string'){(miss[k]=miss[k]||new Set()).add(path.relative(root,f))}}}
const ks=Object.keys(miss).sort();console.log(ks.length,'missing');for(const k of ks)console.log(k,'<-',[...miss[k]].join(','));
