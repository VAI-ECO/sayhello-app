import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const apiRoot = '/Users/bmac/sayhello-api';
const archive = '/Users/bmac/Documents/SayHello-Design-Preservation-2026-09-19/Say hello 1.zip';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const decode = value => String(value ?? '').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const zipNames = execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
if(zipNames.some(n=>n.startsWith('/')||n.split('/').includes('..'))) throw new Error('Unsafe archive path');
const zipSet = new Set(zipNames);
const docs = [];
for(const name of zipNames.filter(n=>n.endsWith('.html'))){
  const content = execFileSync('unzip',['-p',archive,name],{encoding:'utf8',maxBuffer:20*1024*1024});
  docs.push({collection:'September archive',file:name,content,exists:ref=>zipSet.has(path.posix.normalize(path.posix.join(path.posix.dirname(name),ref)))});
}
const designRoot=path.join(apiRoot,'docs/design');
for(const absolute of walk(designRoot).filter(f=>f.endsWith('.html')&&!path.relative(designRoot,f).includes('/'))){
  docs.push({collection:'API design repository',file:path.basename(absolute),content:fs.readFileSync(absolute,'utf8'),exists:ref=>fs.existsSync(path.join(designRoot,ref))});
}
const attrs = tag => Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(m=>[m[1],decode(m[3])]));
const frames=[], files=[];
for(const doc of docs){
  const tags=[...doc.content.matchAll(/<[\w-]+\b[^>]*\bdata-screen-label\s*=\s*(?:"[^"]*"|'[^']*')[^>]*>/g)];
  const docHash=hash(doc.content);
  const dependencies=[...new Set([...doc.content.matchAll(/(?:\b(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^)'"\s]+))/g)].map(m=>decode(m[1]||m[2])))];
  const refs=dependencies.filter(r=>!r.startsWith('#')&&!/^(data:|https?:|mailto:|tel:|blob:|\{|\/)/.test(r)).map(r=>{const clean=r.replace(/^\.\//,'').split(/[?#]/)[0];try{return decodeURIComponent(clean);}catch{return clean;}});
  const missingAssets=refs.filter(r=>r!=='\\'&&!doc.exists(r));
  const externalAssets=dependencies.filter(r=>/^https?:/.test(r));
  files.push({collection:doc.collection,file:doc.file,sha256:docHash,bytes:Buffer.byteLength(doc.content),frameMarkers:tags.length,missingAssets,externalAssets,templateLoops:/v-for=/.test(doc.content)});
  for(let i=0;i<tags.length;i++){
    const tag=tags[i], a=attrs(tag[0]);
    const next=tags[i+1]?.index??doc.content.length;
    const after=doc.content.slice(tag.index+tag[0].length,Math.min(next,tag.index+1400));
    const ownWidth=a.style?.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px\b/);
    const childWidth=[...after.matchAll(/<[\w-]+\b[^>]*>/g)].map(m=>attrs(m[0]).style?.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px\b/)).find(Boolean);
    const width=ownWidth?Number(ownWidth[1]):childWidth?Number(childWidth[1]):null;
    const sn=a['data-sn']||null;
    frames.push({collection:doc.collection,canvas:doc.file,ordinal:i+1,line:doc.content.slice(0,tag.index).split('\n').length,label:a['data-screen-label'],sn,width,widthEvidence:ownWidth?'marker style':childWidth?'first styled descendant (verify rendered frame)':'not resolved',size:({375:'P',834:'T',1440:'D'})[width]||'nonstandard/unknown',docHash,duplicateDocument:false,superseded:['Waverlys Journey Locked.dc.html','Admin Panel.dc.html'].includes(doc.file),implementation:'Unmapped — not presumed missing',visualQA:'Not verified'});
  }
}
// Identical repository/archive documents count once in the unique-source subtotal.
const seen=new Set();
for(const f of frames){const key=f.docHash+':'+f.ordinal;f.duplicateDocument=seen.has(key);seen.add(key);}
const addressGroups=Map.groupBy(frames.filter(f=>f.sn&&!f.duplicateDocument&&!f.superseded),f=>f.sn);
const addressConflicts=[...addressGroups].filter(([,group])=>new Set(group.map(f=>f.label)).size>1).map(([sn,group])=>({sn,labels:[...new Set(group.map(f=>f.label))],records:group.map(f=>({canvas:f.canvas,label:f.label,width:f.width,collection:f.collection}))}));
const appFiles=walk(path.join(root,'app')).filter(f=>/\.tsx$/.test(f)&&!f.includes('/__tests__/')&&!path.basename(f).startsWith('_layout'));
const routes=appFiles.map(absolute=>{
  const source=fs.readFileSync(absolute,'utf8');
  const file=path.relative(root,absolute);
  return {file,route:'/'+file.slice(4,-4).replace(/\/index$/,''),placeholderComponent:/<Placeholder\b/.test(source),mockImports:[...source.matchAll(/from\s+['"]([^'"]*mock[^'"]*)/gi)].map(m=>m[1]),todos:source.split('\n').flatMap((line,i)=>/TODO|not implemented|REPLACE WITH|For demo|For now/i.test(line)?[{line:i+1,text:line.trim()}]:[]),designSN:[...new Set(source.match(/CANON-(?:00|[A-Z]{2}-\d{2})-SN-\d+/g)||[])],runtime:'Not device-verified'};
});
const register=fs.readFileSync(path.join(apiRoot,'docs/SCREEN-REGISTER.md'),'utf8');
const registerRows=register.split('\n').flatMap((text,i)=>/^\|/.test(text)&&/CANON-.*-SN-/.test(text)?[{line:i+1,text}]:[]);
const result={generated:new Date().toISOString(),appRoot:root,apiRoot,appCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),archive,archiveSHA256:hash(fs.readFileSync(archive)),method:'Literal data-screen-label markers, static widths, exact document hashes. Templates and unlabelled frames may need rendered enumeration. Counts do not certify unique approved screens or all required variants.',counts:{archiveEntries:zipNames.length,archiveCanvases:docs.filter(d=>d.collection==='September archive').length,repoCanvases:docs.filter(d=>d.collection==='API design repository').length,frameOccurrences:frames.length,uniqueDocumentFrameMarkers:frames.filter(f=>!f.duplicateDocument).length,unaddressedUniqueMarkers:frames.filter(f=>!f.duplicateDocument&&!f.sn).length,addressLabelConflictGroups:addressConflicts.length,appRouteFiles:routes.length,placeholderRoutes:routes.filter(r=>r.placeholderComponent).length},files,frames,addressConflicts,routes,registerRows};
const out=path.join(root,'docs/current-screen-accounting.json');fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
const table=(head,rows)=>`<div class="scroll"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Say Hello — current app and original design accounting</title><style>body{font:16px/1.5 system-ui;max-width:1500px;margin:auto;padding:28px;color:#252421;background:#f5f3ef}h2{margin-top:40px}table{border-collapse:collapse;background:white;width:100%;font-size:13px}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e7e5df}.scroll{overflow:auto}.notice{background:#fff1d4;padding:18px;border-left:5px solid #b67300}input{padding:12px;width:min(90%,650px)}summary{cursor:pointer;font-weight:bold;margin:18px 0}</style><h1>Say Hello — current screen accounting</h1><p>${esc(result.generated)} · Current app ${esc(result.appCommit.slice(0,8))} · Expo 57</p><div class="notice"><strong>Correction:</strong> the earlier 144-screen inventory described an older legacy checkout. This report inventories the current application and original design files. It does not yet certify every approved screen or size as complete. Keep Claude Design access until reconciliation is signed off.</div><p>Preserved archive: ${esc(archive)}<br>SHA-256: ${result.archiveSHA256}</p><p>${result.counts.appRouteFiles} current app route files; ${result.counts.placeholderRoutes} render the Placeholder component. ${result.counts.archiveCanvases} archived root HTML documents; ${result.counts.repoCanvases} repository HTML documents. ${result.counts.uniqueDocumentFrameMarkers} literal frame markers after exact duplicate-document removal. These are not unique approved-screen totals.</p><p>Runtime and visual parity remain unverified. Missing SNs and conflicting labels need reconciliation against the canonical register, not automatic renumbering.</p><label for="filter">Search tables</label><br><input id="filter" type="search" placeholder="Screen, CANON address, canvas, or route"><h2>Current implementation routes</h2>${table(['Route/source','Placeholder','Mock imports','Static implementation flags','Explicit design address'],routes.map(r=>[r.file,r.placeholderComponent?'YES':'No Placeholder component detected',r.mockImports.join('\n'),r.todos.map(t=>`${t.line}: ${t.text}`).join('\n'),r.designSN.join(', ')||'Not tagged']))}<h2>Original design frames (all source occurrences)</h2><p>Same SN with different labels may be a harmless size/state label variation or a real collision. No automatic merger is performed. Nonstandard widths are reported rather than rounded into P/T/D.</p>${table(['Collection / canvas','Frame / address','Label','Width / evidence','Record status'],frames.map(f=>[f.collection+' / '+f.canvas,`${f.ordinal} · line ${f.line}\n${f.sn||'NO STABLE ADDRESS'}`,f.label,`${f.width??'?'}px · ${f.size}\n${f.widthEvidence}`,f.duplicateDocument?'Exact duplicate source':f.superseded?'Superseded per register':'Needs canonical/visual reconciliation']))}<h2>Address/label disagreements</h2>${table(['SN','Labels','Sources'],addressConflicts.map(c=>[c.sn,c.labels.join('\n'),c.records.map(r=>`${r.collection}: ${r.canvas} (${r.width}px)`).join('\n')]))}<details><summary>File integrity and external asset dependencies</summary>${table(['Collection/file','SHA-256','Markers','Missing relative references','External references'],files.map(f=>[f.collection+'/'+f.file,f.sha256,f.frameMarkers,f.missingAssets.join('\n'),f.externalAssets.join('\n')]))}</details><p>Machine-readable evidence: current-screen-accounting.json. Static relative references may include navigation links as well as assets; dynamic asset expressions require visual checks.</p><script>document.getElementById('filter').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q));});</script></html>`;
fs.writeFileSync(path.join(root,'docs/current-screen-accounting.html'),html.replace('archived root HTML documents','archived HTML documents (root and nested packages)').replace('<label for="filter">','<p><a href="design-log-reconciliation.html">Original log reconciliation</a> · <a href="CLAUDE-DESIGN-FINAL-EXPORT-REQUEST.md">Final Claude Design request</a> · <a href="OPERATIONAL-STATUS.md">Operational status and remaining blockers</a></p><label for="filter">'));
console.log(JSON.stringify(result.counts,null,2));
