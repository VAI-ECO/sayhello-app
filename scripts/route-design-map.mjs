import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Curated source candidates, not inferred canonical IDs or visual approvals.
// Each ordinal is scoped to its exact root canvas, because IDs collide across canvases.
const root = path.resolve(import.meta.dirname, '..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/current-screen-accounting.json')));
const bindings = [];
function bind(group, name, canvas, ordinals, note = '') {
  bindings.push({ file: `app/${group ? `(${group})/` : ''}${name}.tsx`, canvas, ordinals, note });
}
const onboarding = 'Onboarding Individual.dc.html';
bind('onboarding', 'value-cards', onboarding, [2,3,4], 'Three design states share one route; app presents cards together. Layout parity not established.');
bind('onboarding', 'phone', onboarding, [8,9], 'Terms/EULA interaction also needs App Store Blockers frame 7; current DOB is fabricated.');
bind('onboarding', 'otp', onboarding, [10,11,12], 'Session-token contract repaired. Device/SMS flow unverified.');
bind('onboarding', 'name', onboarding, [13], 'Name saves; birthday persistence/server age enforcement remains open.');
bind('onboarding', 'photo', onboarding, [18,19], 'User explicitly requires photo BEFORE color, overriding this older canvas numbering. Actual upload is missing.');
bind('onboarding', 'color', onboarding, [15,16,17], 'User-confirmed order: name → photo → color → location. Ten-color persistence and restoration tested locally.');
bind('onboarding', 'under-18', onboarding, [14], 'Client hard-stop tests pass; not proof of server enforcement.');
bind('onboarding', 'location', onboarding, [20,21,22], 'Include permission-denied/limited-mode states, not only primer.');
bind('onboarding', 'notifications', onboarding, [23], 'Permission and delivery must be device-verified.');
bind('onboarding', 'welcome', onboarding, [26], 'Onboarding icebreaker framing/question (frames 24/25) are separate designed steps, not proven by this welcome route.');
bind('auth', 'entry', null, [], 'Infrastructure: saved-session/loading/retry gate, not a separately identified design frame.');
bind('auth', 'sign-in-phone', 'Missing Mobile Screens.dc.html', [1], 'Backend OTP request still receives placeholder DOB.');
bind('auth', 'sign-in-code', 'Missing Mobile Screens.dc.html', [2], 'OTP session contract and saved-color restoration tests pass; live SMS unverified.');
bind('auth', 'sign-in-locked', 'Missing Mobile Screens.dc.html', [3], 'Rate-limit UI exists; help/why actions need inspection.');
const encounter = 'The Encounter.dc.html';
for (const [name, frames] of [['nudge',[1]],['accepted',[2]],['pin-drop',[3]],['scan',[4,5,6]],['selfie-prompt',[7]],['selfie-review',[8]],['countdown',[9]],['reveal',[10]],['missed-connection',[11]]]) {
  bind('encounter', name, encounter, frames, 'Encounter has placeholder data and incomplete API/camera/scanner wiring; source match does not certify function.');
}
bind('encounter', 'arrow', 'Waverlys Journey Locked.dc.html', [2], 'ONLY located candidate is in a superseded canvas. Resolve whether this route is obsolete; do not order replacement artwork automatically.');
bind('tabs', 'home', 'Feed and Prizes All Sizes.dc.html', [1,2,3,4], 'Feed and active-Hello takeover are states of one route. API feed exists; takeover still needs wiring.');
bind('tabs', 'points', 'Points and Drawings All Sizes.dc.html', [11,12], 'Route is labeled Prizes but implements points/ledger. Full Prizes/Drawings designs are not accounted for by this route alone.');
bind('tabs', 'profile', 'Missing Mobile Screens.dc.html', [4], 'Several settings entry actions are disabled, including delivered legal/deletion/blocked-list designs.');
bind('tabs', 'profile/blocked', 'Missing Mobile Screens.dc.html', [9], 'Block-list route exists, but its settings entry is disabled.');
bind('tabs', 'profile/icebreakers', 'Icebreakers.dc.html', [2,3,4,5], 'Library/answer/filled/empty states share one route; after-reveal and exit states require separate review.');
bind('tabs', 'hellos/index', 'Reserved Screens.dc.html', [1], 'Connections list candidate. ID collides with the Yellow color specimen; scope source by canvas.');
bind('tabs', 'hellos/[id]', null, [], 'Private connection-note editor exists in code. No exact standalone drawing positively identified; may be embedded in another canvas. Needs source confirmation, not automatic redraw.');
bind('tabs', 'map/index', 'Hello Map.dc.html', [1,2,3], 'Map browsing/search/pin sheet exist in designs. Native map is a placeholder and search uses mock data.');
bind('tabs', 'map/empty', 'Hello Map.dc.html', [5], 'Empty-area design exists; navigation/data parity unverified.');
bind('tabs', 'map/place', 'Hello Map.dc.html', [4], 'Candidate is a place surface; exact city-statistics versus Hangout-page interpretation needs visual comparison.');
bind('', 'block', 'Missing Mobile Screens.dc.html', [7], 'API action exists; not device-verified.');
bind('', 'report', 'Missing Mobile Screens.dc.html', [6], 'API action exists; report context/state parity unverified.');
const hootzas = 'Hootzas.dc.html';
for (const [name, frames] of [
  ['[id]/index',[1,2,3,16]], ['create/index',[4]], ['create/how-it-runs',[5]],
  ['[id]/host-controls',[6]], ['[id]/check-in-code',[7]], ['[id]/check-in',[8]],
  ['[id]/host-mode-prompt',[8]], ['[id]/host-mode-window',[9]],
  ['discount/compose',[10]], ['discount/out-of-posts',[11]], ['[id]/edit',[13]],
  ['[id]/cancel-confirm',[14]], ['[id]/end-vs-cancel',[15]], ['[id]/comments',[17]],
  ['[id]/whos-here',[18]], ['empty',[20]], ['create/post-error',[21]],
]) bind('hootzas', name, hootzas, frames, 'Route/source candidate; role permissions, API outcomes and every state still require end-to-end verification.');
const field = 'Ambassador Field Flow.dc.html';
for (const [name, frames] of [['find-business',[1]],['confirm-details',[2]],['photo',[3]],['visit-check-in',[4,5]],['payouts',[6,7]]]) {
  bind('ambassador', name, field, frames, ['find-business','confirm-details','photo'].includes(name) ? 'Current screen contains unavailable/disabled functionality. Drawing exists; this is implementation debt.' : 'API paths exist; payment/visit journey and visual parity unverified.');
}
bind('ambassador', 'earned-building', 'Ambassador Panel.dc.html', [1,2], 'Candidate overview; Earned and Building must remain distinct and side by side.');
bind('ambassador', 'hangouts', 'Ambassador Panel.dc.html', [3,4,5], 'Portfolio/list/empty candidate states.');
bind('ambassador', 'queue-offer', 'Ambassadors and Hello Hangouts.dc.html', [1], 'Older 340px frame; exact final P/T source needs approval.');
bind('ambassador', 'signup', 'Ambassadors and Hello Hangouts.dc.html', [4], 'Drawing exists; tax/payout onboarding needs provider-backed completion, not a local checkbox.');
bind('ambassador', 'store', 'Store and Ambassador Shop.dc.html', [3,4,5], 'Locked/open drawings exist; current store is unavailable.');
bind('ambassador', 'commissions', 'Desktop Surfaces at P 375.dc.html', [18], 'Current screen marks commissions unavailable. P artwork exists; do not reorder it.');
bind('ambassador', 'visit-history', 'Desktop Surfaces at P 375.dc.html', [19], 'P artwork exists; ledger/backend response and visual parity require review.');
bind('hangout', 'signup', 'Desktop Surfaces at P 375.dc.html', [11,23], 'Two signup candidates: tier and business signup. Confirm whether both are implemented by this route.');
bind('hangout', 'dashboard', 'Work Surfaces All Sizes.dc.html', [4,5,6], 'Business dashboard P/T/D drawings exist; not equivalent to role journey verification.');
bind('hangout', 'create-post', 'Hello Hangout Operator Surfaces.dc.html', [3], 'Discount composer overlaps Hootza discount route; shared design is not a missing screen.');
bind('hangout', 'redeem', 'Hello Hangout Operator Surfaces.dc.html', [4], 'At-the-till drawing exists; real redemption journey unverified.');
bind('hangout', 'directory/index', 'Hangout Directory.dc.html', [1,2,3,4,9,10,11,12,13], 'Listing/map/filter/no-results frames exist. Do not infer all states implemented from the route.');
bind('hangout', 'directory/[id]', 'Hangout Directory.dc.html', [5,6,7,8,14], 'Place page and Hello wall have delivered P/T sources.');
bind('influencer', 'pick-code', 'Desktop Surfaces at P 375.dc.html', [15], 'P drawing exists.');
bind('influencer', 'code-taken', 'Desktop Surfaces at P 375.dc.html', [16], 'P drawing exists; reserved/blocked-code cases also appear in Open Items and Gates.');
bind('influencer', 'earnings', 'Desktop Surfaces at P 375.dc.html', [14], 'Candidate two-stream earnings; finance/legal MA-05 gates remain distinct from artwork availability.');
bind('refer', 'hangout', 'Ambassadors and Hello Hangouts.dc.html', [9], 'Referral submission is disabled. Source drawing exists at 340px; final-size confirmation needed.');

const seen = new Set();
const rows = bindings.map(binding => {
  if (seen.has(binding.file)) throw new Error(`Duplicate route: ${binding.file}`);
  seen.add(binding.file);
  const absolute = path.join(root, binding.file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing implementation: ${binding.file}`);
  const source = fs.readFileSync(absolute, 'utf8');
  const frames = binding.ordinals.map(ordinal => {
    const frame = inventory.frames.find(f => f.collection === 'September archive' && f.canvas === binding.canvas && f.ordinal === ordinal);
    if (!frame) throw new Error(`Unresolved design reference: ${binding.canvas} frame ${ordinal}`);
    return { canvas: frame.canvas, ordinal, label: frame.label, sn: frame.sn, width: frame.width, line: frame.line, docHash: frame.docHash, superseded: frame.superseded };
  });
  return { ...binding, sourceSHA256: crypto.createHash('sha256').update(source).digest('hex'), frames,
    association: !frames.length ? 'Source unresolved / infrastructure' : frames.every(f => f.superseded) ? 'Superseded source only' : 'Located source candidate — visual parity unverified',
    staticEvidence: source.split('\n').flatMap((line,i) => /TODO|unavailable|disabled|mock|placeholder|not implemented/i.test(line) ? [{ line: i+1, text: line.trim() }] : []),
    deviceVerified: false,
  };
});
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const expected = new Set(walk(path.join(root,'app')).filter(file=>file.endsWith('.tsx')&&!file.includes('/__tests__/')&&!path.basename(file).startsWith('_layout')).map(file=>path.relative(root,file)));
const missing = [...expected].filter(file => !seen.has(file));
const extra = [...seen].filter(file => !expected.has(file));
if (missing.length || extra.length) throw new Error(JSON.stringify({missing,extra}));
const report = { generated: new Date().toISOString(), appCommit: execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  method: 'Human-selected source candidates anchored by canvas SHA256 and literal frame ordinal. Every route has one accounting row; this is not approval, complete state coverage, visual parity or a count of unique product screens. No screen is declared missing merely because it lacks a route.',
  counts: { routes: rows.length, locatedCurrentSourceCandidates: rows.filter(r=>r.frames.some(f=>!f.superseded)).length, supersededSourceOnly: rows.filter(r=>r.frames.length && r.frames.every(f=>f.superseded)).length, unresolvedOrInfrastructure: rows.filter(r=>!r.frames.length).length, deviceVerified: 0 }, rows };
fs.writeFileSync(path.join(root,'docs/route-design-crosswalk.json'), JSON.stringify(report,null,2)+'\n');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Say Hello route-to-design crosswalk</title><style>body{font:16px/1.5 system-ui;margin:24px;color:#222}table{border-collapse:collapse;width:100%}td,th{padding:12px;border:1px solid #ddd;text-align:left;vertical-align:top}th{background:#eee}.notice{padding:16px;background:#fff1d4}input{padding:12px;width:min(90%,650px)}small{display:block}details{max-width:500px}</style><h1>Say Hello — every route accounted for</h1><p>${esc(report.generated)} · ${esc(report.appCommit.slice(0,8))}</p><p class="notice">${esc(report.method)}</p><p>${report.counts.routes} route rows: ${report.counts.locatedCurrentSourceCandidates} with located current-source candidates, ${report.counts.supersededSourceOnly} with superseded-only source, ${report.counts.unresolvedOrInfrastructure} unresolved/infrastructure. ZERO device-verified screens. These categories are not operational pass/fail totals.</p><p>Confirmed onboarding order: name → photo → color → location. Old canvas numbering must not reverse this.</p><p><a href="current-screen-accounting.html">All source frames</a> · <a href="CLAUDE-DESIGN-FINAL-EXPORT-REQUEST.md">Final Claude request</a> · <a href="OPERATIONAL-STATUS.md">Operational status</a></p><label>Find route or source <input id="search" type="search"></label><table><thead><tr><th>Implementation route</th><th>Located design candidates</th><th>Assessment</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.file)}</td><td>${r.frames.map(f=>`<p><a href="http://127.0.0.1:8767/${encodeURIComponent(f.canvas)}">${esc(f.canvas)}</a> · frame ${f.ordinal}, line ${f.line}<small>${esc(f.sn??'No address')} · ${esc(f.label)} · ${f.width??'?'}px${f.superseded?' · SUPERSEDED':''}</small></p>`).join('')||'No exact drawing established'}</td><td><strong>${esc(r.association)}</strong><p>${esc(r.note)}</p><details><summary>Static code flags (not a runtime verdict)</summary>${r.staticEvidence.map(e=>`<p>${e.line}: ${esc(e.text)}</p>`).join('')||'No matching static flags'}</details></td></tr>`).join('')}</tbody></table><script>document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))})</script></html>`;
fs.writeFileSync(path.join(root,'docs/route-design-crosswalk.html'),html);
console.log(JSON.stringify(report.counts,null,2));
