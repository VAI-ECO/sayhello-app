# PAUSED — exact Say Hello restart checkpoint

Saved 2026-09-19, immediately after Brian requested: “pause here exactly … detailed … pick up from right here.”
**Do not resume implementation until Brian asks.** Goal is unfinished, not completed or globally blocked. No goal-status change was made. No active test/build process remains from the current work. Preview servers may still be running; revalidate them before using.

## Start here
Authoritative working repositories:
- App: /Users/bmac/sayhello-app — HEAD 287020d.
- API: /Users/bmac/sayhello-api — HEAD cf49889.
- Ambient /Users/bmac/.codex/worktrees/00da/sayhello-app is a legacy detached checkout. Do not implement there.
Read AGENTS.md, CLAUDE.md, and applicable skills before resuming. API docs/RULES.md is authoritative for business behavior. Preserve user-owned untracked .cursor/, canon-2026-08-24.zip, canon-export-2026-08-22/, contracts/.
Manual edits use apply_patch. Commit discrete tasks only after required whole-repo tests and TypeScript pass. Do not weaken/delete/skip existing assertions.

## Exact stopping point — current failing test
New API integration test in src/routes/__tests__/feed-http.test.ts, line 33:
“persists only the authenticated attendee Host Mode choice and prevents invalid reactivation.”
It sends { accepted: false, userId: id, user_id: id } and expects 200; actual 400.
Read-only inspection at pause found src/middleware/json-keys.ts normalizes snake_case to camelCase and deliberately rejects duplicate normalized keys with ambiguous_key / invalid_json_keys. Thus this fixture sends an intentionally ambiguous body and is rejected before the endpoint. This is evidence for the likely cause, not a completed fix.
Next safe action when resumed: separate userId and user_id spoof attempts into distinct requests, preserve/assert the existing 400 duplicate-key security behavior, and assert each valid non-ambiguous request can affect only the authenticated attendee. Do not disable normalization to satisfy this new test.
The rest of this new test (after line 33) has NOT run successfully: persisted false, per-user GET state, host cannot modify attendee, reacceptance, ended rejection/opt-out, missing event.
No implementation or test changes were made after the pause request; only inspection and this checkpoint.

## Uncommitted backend work
1. src/lib/host-mode-state.ts (new):
   derives not-checked-in / ended / unavailable / off / waiting / open from event status, active config, own check-in request and acceptance; returns available, accepted, serverTime, windowClosesAt.
   Uses configured window duration, never fixed countdown; malformed/future/expired window does not show open.
2. src/routes/hootzas.ts:
   POST /:id/host-mode-participation validates UUID and explicit boolean, uses req.userId (not body identity), invokes service-only RPC; maps permission/not-found/conflict errors.
   GET /:id fetches only authenticated attendee's consent flags and adds myHostMode.
3. supabase/migrations/053_host_mode_participation.sql (new):
   service_role-only SECURITY DEFINER function, fixed search_path, locks event and own check-in; refuses activation unless live/requested/active config; permits own opt-out after end; no user data deletion.
   **Applied to LOCAL database only** using DATABASE_URL hostname guard (localhost/127.0.0.1). Not production, not registered in migration ledger. Do not claim deployment.
4. src/jobs/host-mode-windows.ts:
   selects event start_time; skips future starts. Removes erroneous null-end-date expiration (null became epoch). Event end/cancel owns deactivation.
   Push delivery remains TODO, concurrent scheduler opening is not yet atomic.
5. src/lib/__tests__/host-mode-state.test.ts (new): 7 passing boundary/consent/state tests.
6. src/jobs/__tests__/host-mode-windows.test.ts (new): 5 passing no-end/start/interval/ended/write-failure tests.
7. src/routes/__tests__/feed-http.test.ts: added integration test described above; existing assertions preserved.

All of this is UNCOMMITTED. No frontend Host Mode changes yet.

## Verification — latest evidence supersedes earlier green checkpoint
- API TypeScript npx tsc --noEmit: passed with current changes.
- Latest complete API run: **497 passed, 1 failed, 40 suites (39 passed, 1 failed)**.
  /tmp/sayhello-host-mode-verified-tests.log
- Target HTTP run: 8 passed, 1 failed.
  /tmp/sayhello-host-mode-http-tests.log
- Before adding failing integration test: API 497/497 passed, 40 suites:
  /tmp/sayhello-host-mode-backend-tests.log
- Current helper/job tests: 12/12 passed. An unsupported Vitest matcher in a newly added test was replaced by equivalent count + argument assertions, not weakened.
- Last verified app: 516 tests / 39 suites + TypeScript:
  /tmp/sayhello-camera-flow-verified-tests.log
- Latest iOS JS bundle export: /tmp/sayhello-camera-ios; log /tmp/sayhello-camera-ios-export.log.
  This is JS bundle proof, NOT signed native build, device verification, or App Store approval. API URL was example.invalid for export.
- Native config introspection /tmp/sayhello-camera-native-config.json: camera description present, no iOS mic description, Android mic permission removed. Native rebuild still required.
- No Xcode full installation/simulator available; CLT only. No paid cloud build or real SMS/push/payment/App Store submission performed.

## Next implementation work after integration test
- Finish backend permission tests (including inactive config, denied direct RPC roles, real own-state persistence), run whole suite + TypeScript.
- App screen: /Users/bmac/sayhello-app/app/(hootzas)/[id]/host-mode-window.tsx still has fixed 10-minute fallback, 88% progress, and local-only opt-out. Do not call it operational.
- Add API type for myHostMode and save helper. Replace fake state with server-backed loading/error/retry/off/waiting/open/ended states; preserve state on save failure. Expiry must update honestly, not remain open forever.
- Add attendee entry from event page. Consent currently returns to event page rather than pretending a window opened.
- Test both choices, persistence across reload, failure/retry, own identity, timer boundaries, disabled/unavailable state.
- Preserve existing designs; request extra state designs only where truly missing.
- Complete full tests before commits. Update docs/OPERATIONAL-STATUS.md with actual evidence.

## Recently completed and committed
App 287020d: actual attendee QR camera scanning + manual fallback; permission on explicit action; foreground/focus and duplicate-callback guards; failed request retry; explicit Host Mode consent and failure handling.
API cf49889: cryptographically random event code, host-only/live-only code disclosure, validated QR/check-in input, explicit boolean Host Mode consent only for active config, relevant HTTP tests.
Earlier work: real local QR renderer with independent jsQR decode tests; configurable host points projection (provisional, no awards); host interval controls; session race protection; feed/schema fixes; identity-color persistence; private photo upload backend/client.
Owner requested and code verified: **Name → Photo → Color → Location**. Save AND skip photo go to color.
Photo screen still sends local URI rather than using real upload; narrow approval to replace obsolete existing assertion was previously requested and not answered. Do not silently weaken that assertion.

## Screen accounting and Claude Design preservation
Main docs under /Users/bmac/sayhello-app/docs/:
- OPERATIONAL-STATUS.md — historical work and remaining gaps; this checkpoint supersedes its current Host Mode status.
- current-screen-accounting.html/json
- route-design-crosswalk.html/json — all 75 implemented route files; 72 current source candidates, 1 superseded arrow, 2 infrastructure/unresolved auth/private-connection-note candidates; all visual/device verification still unproven.
- design-log-reconciliation.html/json
- design-preservation-receipt.json
- design-portability-audit.md/json
- CLAUDE-DESIGN-FINAL-EXPORT-REQUEST.md — final owner-ready export request.

Originals: /Users/bmac/Documents/SayHello-Design-Preservation-2026-09-19/
Original ZIP Say hello 1.zip SHA256:
c0fd7e2fb84ec6bb4009df6ccd4f9431bebbab80fb68df83b289c68dbd33d0f2
941 extracted files, 57 root HTML, 208 all nested HTML. Originals rehashed unchanged.
429 root literal frame occurrences are NOT unique approved screens.
Combined counts: 1703 occurrences, 802 exact-document deduplicated, 318 unaddressed, 70 address/label disagreements — NOT missing-screen counts.
CSV register: 247 rows, 218 delivery claims, 6 in progress (already drawn), 22 owed rows (14 aggregate), 1 retired. Old “218 delivered /176 owed” register is stale.
Eight supposedly owed T834 variants found in P375 AppStoreBlockers:
RL01SN94/95/96/97 phone picker, permissions denied, map limited, no Bluetooth;
SH01SN21 safety / SN22 selfie consent;
00SN13 EULA / SN14 contact.
Do not order redraws before locating existing art; D1440 not owed for these.
ID conflicts: MN01SN19 active overrides/settings, SH01SN21 manual code/safety, 00SN13/14 marketing/EULA/contact. Retired RL03SN33 My Team stays retired. Organizational834 vs desktop hold unresolved.
Crosswalk source hashes can become stale after implementation edits; preserve snapshot date and regenerate when appropriate.

Portability: 55 root canvases use support.js, which needs React/ReactDOM18.3.1 from unpkg; Babel7.29.0 conditional JSX; Google web fonts remote. 57 root files had no missing static references; 49 nested missing-reference occurrences include navigation, not 49 missing screens.
No full offline render closure yet; embedded archives not fully verified. Preserve original files; make portable derivatives separately.
Final Claude export must include canonical manifest/aliases, exact flow and states, all owed sizes, licensed font/assets, runtime files, rendered previews, conflict decisions and final missing states. Account closure safety is NOT proven yet.
Ambient preview: http://127.0.0.1:8766/route-design-crosswalk.html. Other prior servers 8765 legacy, 8767 originals. Revalidate before use.

## Major work still open — not all owner blockers
- Host Mode screen persistence, push delivery, server send-suppression integration. SQL should_suppress_nudge is unused and mishandles null scheduled end. Do not claim suppression works.
- Hootza end/award/check-in/cancel races and ledger correctness; ended-before-award failure recovery; live edit.
- Encounter mock people/location, selfie pseudo-save, native map/search placeholder and proximity/mutual timing.
- Profile disabled notification/Host Mode/blocked/legal/deletion actions; account deletion backend and retention policy.
- Report payload and authorization models; chat missing; privacy narrow exception alignment.
- Photo upload UI and onboarding age contract (fake DOB issue; minors MA-05).
- Ambassador/Hangout/Influencer/business/admin/store flows not end-to-end proven.
- Native fonts, real Waverly animation, device accessibility, native build/privacy/assets/screenshots.
- Dependency audit unresolved (24 previously reported issues); do not force bulk upgrade.
- Migration runner references absent scripts/migrate.ts. Local migrations manually applied, not production parity; never blindly run/reset whole migration history (older destructive migrations exist).
- Route count alone does not prove all designs implemented or working.

## Genuine owner/external needs
Final Claude authoritative manifest, resolved conflicts and held breakpoints before account closure.
Apple Developer/signing/App Store Connect and real devices/full Xcode.
Production HTTPS/SMS/push/payment credentials/configuration not verified.
MA-05 owner/counsel clearance: legal, minors, prizes, earnings/tax/retention.
Apple approval is external. These do not eliminate remaining safe engineering work.

## Resume instruction
Read THIS checkpoint first, then inspect actual git diff and logs. Do not restart discovery, redo completed QR work, claim green tests, or mark goal complete. Resume at the new HTTP test failure, then backend/frontend Host Mode integration.

