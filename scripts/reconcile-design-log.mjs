import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const preservation = '/Users/bmac/Documents/SayHello-Design-Preservation-2026-09-19';
const designRoot = path.join(preservation, 'design');
const report = JSON.parse(fs.readFileSync(path.join(root, 'docs/current-screen-accounting.json'), 'utf8'));

// RFC 4180 fields, including quoted commas and newlines; do not split CSV on commas.
export function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Unclosed CSV field');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const [headers, ...rawRows] = parseCSV(fs.readFileSync(path.join(designRoot, 'Screen log.csv'), 'utf8'));
const widthBySize = { P: 375, T: 834, D: 1440 };
const rootFrames = report.frames.filter(f => f.collection === 'September archive' && !f.canvas.includes('/') && !f.superseded && f.canvas !== 'App Store Screenshots.dc.html');
const logRows = rawRows.map((cells, index) => {
  const source = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  // Preserve malformed-source overflow rather than silently dropping unquoted commas.
  if (cells.length > headers.length) source.Notes = cells.slice(headers.length - 1).join(',');
  const sn = source.SN.replace(/-[PTDL]$/, '');
  const sameAddress = rootFrames.filter(f => f.sn === sn);
  const candidates = sameAddress.filter(f => f.width === widthBySize[source.Size]);
  return {
    csvRecord: index + 2, ...source, sourceFieldCount:cells.length,
    matchStatus: !sn ? 'Aggregate canvas row — expand to individual frames before counting' : candidates.length ? 'Address and width found; label/state parity requires review' : sameAddress.length ? 'Address found, requested width not found in root canvases' : 'Address not found in root canvases; inspect nested packs and aliases',
    candidates: candidates.map(f => ({canvas:f.canvas,line:f.line,label:f.label,width:f.width})),
    otherWidths: [...new Set(sameAddress.map(f => f.width))],
  };
});
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile()) {
      const data = fs.readFileSync(absolute);
      files.push({file:path.relative(preservation,absolute),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
    }
  }
}
walk(designRoot);
const receipt = {
  generated:new Date().toISOString(), originalArchive:report.archive, archiveSHA256:report.archiveSHA256,
  extractedFiles:files.length, files,
};
fs.writeFileSync(path.join(root,'docs/design-preservation-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
const result = {
  generated:receipt.generated,
  warning:'The source CSV is known to contain stale totals and conflicting SNs. Matches are evidence, not automatic approval or proof of unique screen delivery. Unmatched rows are not automatically missing artwork.',
  source:path.join(designRoot,'Screen log.csv'),
  sourceStatusCounts:Object.fromEntries([...Map.groupBy(logRows,r=>r.Status)].map(([k,v])=>[k,v.length])),
  rows:logRows,
};
fs.writeFileSync(path.join(root,'docs/design-log-reconciliation.json'),JSON.stringify(result,null,2)+'\n');
const escape = v => String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rows = logRows.map(r=>`<tr><td>${r.csvRecord}</td><td>${escape(r.Status)}</td><td>${escape(r.SN)}<br>${escape(r.Size)}</td><td>${escape(r['Screen label'])}<br><small>${escape(r['Canvas file'])}</small></td><td>${escape(r.matchStatus)}<br>${r.candidates.map(f=>`${escape(f.canvas)}:${f.line} — ${escape(f.label)}`).join('<br>')}<br><small>Other observed widths: ${escape(r.otherWidths.join(', '))}</small></td><td>${escape(r.Notes)}</td></tr>`).join('');
fs.writeFileSync(path.join(root,'docs/design-log-reconciliation.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Say Hello — design log reconciliation</title><style>body{font:15px/1.5 system-ui;padding:24px;background:#f7f6f4;color:#1f1e1c}table{border-collapse:collapse;background:white}td,th{padding:12px;border:1px solid #ddd;text-align:left;vertical-align:top}aside{padding:16px;background:#fff0cb}input{padding:12px;width:80%;margin:20px 0}</style><h1>Original design log — evidence reconciliation</h1><aside>${escape(result.warning)}</aside><p>${logRows.length} CSV records; ${files.length} extracted files checksummed. The CSV is not a certified current count.</p><p><a href="current-screen-accounting.html">All current routes and source frame occurrences</a> · <a href="design-preservation-receipt.json">Preservation checksums</a></p><label>Search <input id="q" type="search"></label><div style="overflow:auto"><table><thead><tr><th>CSV record</th><th>Source status</th><th>SN / size</th><th>Source label / canvas</th><th>Observed evidence</th><th>Source note</th></tr></thead><tbody>${rows}</tbody></table></div><script>document.getElementById('q').oninput=e=>document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()))</script></html>`);
console.log(JSON.stringify({csvRecords:logRows.length,sourceStatusCounts:result.sourceStatusCounts,extractedFiles:files.length,notMatched:logRows.filter(r=>!r.candidates.length).length},null,2));
