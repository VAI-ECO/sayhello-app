# Say Hello — final design-account export request

19 September 2026. This supersedes the legacy 144-screen handoff. Paste into the existing Say Hello Claude Design project. Attach `current-screen-accounting.json`, `design-log-reconciliation.json`, and the existing `Screen log.csv` if needed. The reports contain source evidence, not approved unique-screen totals.

## Request to Claude Design

We are closing this design account and need a complete, independently usable final handoff for the existing Say Hello product. Preserve the approved design; do not redesign or redraw already-delivered frames. Reconcile the actual latest canvases and exports, not stale totals in older registers.

The owner explicitly confirmed **name → photo → color → location**, including skipped photo → color. Update final flow ordering to this requirement; the older Onboarding Individual canvas numbers color before photo and is not authoritative for this sequence. Preserve the artwork while correcting the flow metadata.

We have preserved the September ZIP: 941 files, including 57 root HTML documents and 208 HTML documents overall with nested packs. The root canvases have 429 literal labeled frame occurrences; that is NOT a count of unique approved screens. The September 3 screen register claims 218 delivered and 176 owed frames but explicitly admits stale counts. Its CSV has 247 records, including aggregate canvas rows. Do not quote those totals as reconciled truth.

### First priority: eight outstanding iPad variants

The following are drawn in `App Store Blockers.dc.html` at P 375, and the canvas explicitly says their T 834 variants are owed. We have not found the tablet variants in the preserved root canvases. First locate any later delivery; if absent, supply the tablet reflows. D 1440 is not owed for these eight under the existing brief.

| Stable address from source | Screen | Needed |
| --- | --- | --- |
| CANON-RL-01-SN-94 | 24-market phone picker | T 834 |
| CANON-RL-01-SN-95 | Limited mode — everything denied | T 834 |
| CANON-RL-01-SN-96 | Limited mode — Hello Map | T 834 |
| CANON-RL-01-SN-97 | Hello without Bluetooth | T 834 |
| CANON-SH-01-SN-21 | Safety guidance in meet flow | T 834 |
| CANON-SH-01-SN-22 | Selfie consent at capture | T 834 |
| CANON-00-SN-13 | EULA on terms acceptance | T 834 |
| CANON-00-SN-14 | Contact in-app | T 834 |

Most of these IDs are marked proposed in the source. Confirm them against the final canonical manifest; do not silently renumber. App Store Screenshots also reuses CANON-00-SN-13/14 for different screenshot content: use a distinct screenshot namespace or an explicit alias map.

### Reconcile size debt before producing more artwork

Recount the remaining 14 aggregate rows against newer `Desktop Surfaces at P 375`, `Reserved Screens`, `Reserved Screens Delivered at T 834`, `Admin`, `Hello Admin Settings All Sizes`, and other latest canvases. The old list is a search checklist, not an order for its stale frame totals:

- Ambassadors and Hello Hangouts: T, D.
- Missing Mobile Screens: T, D.
- Icebreakers: T, D.
- Admin Panel: P, T; resolve its replacement by newer Admin canvases first.
- Hangout Directory: P, T; P frames already exist (6e, 7a–7l). Do not recreate them.
- Ambassador and Influencer Panels: P, T.
- Hello Map: T, D.
- Splash and Front Door: T, D; compare Front Door and Navigation.
- Work Tools: P, T; compare Work Surfaces All Sizes.
- Signup Flows: P, T.
- Web Surfaces: P, T, only where required by the approved product brief.
- Ambassador Field Flow: T.
- Landing and Stores: P, T; compare Website Landing Page and Store and Ambassador Shop.
- Organizations: resolve the existing 834-versus-desktop breakpoint hold before labeling variants owed.

The six rows labeled IN PROGRESS already have artwork in `Admin Rulings.dc.html`: active overrides, override log, split arrangement, zero-candidate ring, report queue, and admin selfie removal. Confirm approval and export; do not order these as never drawn. There is a real collision: CANON-MN-01-SN-19 labels both active overrides and Settings in `Hello Admin Settings All Sizes`. Resolve it explicitly. Preserve the retired CANON-RL-03-SN-33 My Team hole; do not draw it.

Additional collision: **CANON-SH-01-SN-21** is manual code entry in `The Encounter.dc.html` frame 5 and safety guidance in `App Store Blockers.dc.html` frame 5. Preserve both distinct states and return an explicit canonical/alias correction, not an ID-based merger.

### Route-to-design questions — do not redraw by default

Attach `route-design-crosswalk.json`. It accounts for all 75 current app routes, with 72 located current-source candidates, one superseded-only candidate, and two infrastructure/unresolved rows. These are source-association counts, not verified working-screen counts.

- `app/(encounter)/arrow.tsx`: the located arrow drawing is in superseded `Waverlys Journey Locked.dc.html`, frame 2. Confirm whether the final encounter flow retains this step, replaces it, or removes it. Do not recreate obsolete behavior.
- `app/(tabs)/hellos/[id].tsx`: this is a private connection-note editor. Locate its final drawing/state or identify that it still needs one. We have not positively located an exact standalone frame; absence is not yet proved.
- `app/(auth)/index.tsx`: this is a session/loading/retry gate, not evidence of a missing standalone screen. Confirm reusable loading/offline/error treatment rather than creating a new flow step without need.
- Delivered drawings for deletion/legal pages, role/admin/store surfaces, and onboarding icebreaker steps do not become "missing artwork" because the native app lacks an entry point or full implementation. Identify their final source and required state/size variants; implementation debt stays with engineering.

### Required manifest and delivery format

Return a single canonical CSV and JSON manifest with ONE ROW PER ACTUAL SCREEN/STATE/SIZE, not grouped counts. Include canonical ID, prior aliases, title, role, flow step/order, state, P/T/D applicability, actual width and height, canvas path, frame selector, approved/superseded/held status, asset references, and any genuine undelivered variant. Distinguish screen, reusable component, brand specimen, marketing screenshot, and alternate state. Explain every duplicate ID and withdrawn frame. Separate count of unique logical screens from count of delivered size/state variants.

Provide original editable HTML and a ZIP that works after the account closes: local fonts, images, SVG/PNG marks, scripts such as support.js/doc-page.js, and no account-gated URLs. Include rendered PNG previews named by canonical ID and size, plus an index.html linking every final frame. Do not deliver screenshots alone. Some nested old packs lack relative dependencies even though root canvases have them; make the FINAL package self-contained.

The preserved export's `support.js` is NOT self-contained: its boot path loads React 18.3.1 and ReactDOM 18.3.1 from unpkg, and JSX imports can also load Babel 7.29.0. It hides the raw template while waiting for React. Bundle compatible runtime dependencies and licenses, not just `support.js`. The root canvases also reference Google Fonts stylesheets for Assistant, Archivo, Archivo Black and Instrument Serif. Include the actual font files, styles/weights and glyph coverage. See `design-portability-audit.json`: 941 original files checksum-verified, 55 of 57 root HTML documents reference this runtime, and 49 missing static relative-reference occurrences exist in nested packages (not 49 missing screens). Validate every final canvas in a fresh browser with remote requests blocked, no cached fonts/scripts, and local HTTP serving; supply rendered-frame enumeration and console/network results. Existing embedded standalone exports must be checked separately rather than presumed broken or complete.

Preserve Assistant/Dreaming typography, approved Waverly assets/gestures, identity colors and the canonical five-tab order. Keep P 375, T 834 and D 1440 design classes distinct from App Store screenshot pixel requirements. Include safe-area behavior, keyboard/scroll behavior, Dynamic Type layouts, accessible names and reading order, contrast specifications, 44-point minimum control targets, permission-denied/retry/empty/offline/error states, and reduced-motion alternatives. Document required transitions and modal/back behavior.

Do not invent legal approval, prize schedules, earnings, prices, or retention policy. Keep business values as existing configuration tokens. Flag the source's disputed official-rules wording and selfie-retention/legal issues for owner/counsel approval. Designs and App Store approval are separate deliverables.

Finish with an evidence-backed checklist of anything still absent, held or requiring owner approval. We need an account-independent complete handoff, not a promise that all screens are done.
