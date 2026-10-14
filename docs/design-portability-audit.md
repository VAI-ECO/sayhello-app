# Say Hello — preserved design portability audit

Generated 2026-09-19T07:06:45.837Z. Originals: /Users/bmac/Documents/SayHello-Design-Preservation-2026-09-19.

## Verdict

Original bytes verified; offline rendering NOT verified. Root templates rely on a runtime that loads CDN scripts, and root HTML references remote font stylesheets.

All **941 preserved files** and the original ZIP still match the preservation receipt. This checks integrity, not completeness of the design delivery.

The 57 root HTML documents have **0 missing static local references**. However, 55 reference support.js; its boot path hides the raw x-dc template and waits for React. That runtime loads React 18.3.1 and ReactDOM 18.3.1 from unpkg unless already supplied. Babel 7.29.0 is an additional conditional JSX-import dependency. Copying support.js alone is therefore not an offline handoff. Existing embedded standalone exports need a separate runtime check; this finding must not be generalized to those wrappers.

There are 0 root documents with v-for templates. Literal frame-marker counts are not a verified count of rendered screens.

## Required final-export acceptance checks

1. Bundle the exact compatible runtime dependencies and their licenses, and local font files/stylesheets. Preserve font weights/styles and glyph coverage; do not substitute system fonts.
2. Resolve every asset URL relative to the final package, including runtime imports, nested CSS, images, and font URLs. Keep originals unchanged; identify any portable derivative separately.
3. Serve the final package locally in a fresh browser context with remote network requests blocked and no cached fonts/scripts. Open every final canvas, wait for fonts and rendering, record console/network failures, and enumerate rendered frame labels, IDs and dimensions.
4. Compare rendered previews to the approved originals and canonical manifest. Prove required states and sizes; do not silently drop loop-generated frames, variants or aliases.
5. Retain checksums, licenses, editable HTML, rendered previews and a linked manifest/index. Only then mark offline delivery verified.

## Root external references

- https://fonts.googleapis.com
- https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=Archivo+Black&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=Archivo:wght@400;500;600;700;900&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=Archivo:wght@400;500;600;700;900&family=Instrument+Serif:ital@0;1&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&display=swap
- https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap
- https://fonts.gstatic.com

## Nested missing static references

These 49 reference occurrences are packaging gaps, not unique missing-screen counts. Static href scans also include navigation links. See JSON for per-file hashes, runtime URLs and all references.

| Source | Reference not found at its relative path |
| --- | --- |
| canon-1-product-encounter/Splash 00 Locked.dc.html | ./doc-page.js |
| canon-3-money/Agency Packet.dc.html | assets/Dreaming/StayDreaming.otf |
| canon-3-money/Agency Packet.dc.html | assets/marketing/01-nudge.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/02-accepted.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/03-scan.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/04-selfie.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/05-pin.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/06-reveal.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/11-front-door.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/12-colour-pick.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/13-colour-confirmed.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/07-home.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/08-hootza.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/09-map.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/10-pin-sheet.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/14-web-hero.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/15-web-game.png |
| canon-3-money/Agency Packet.dc.html | assets/marketing/16-web-close.png |
| canon-4-hello-hangout/Category Marks.dc.html | uploads/Group%201261154621.png |
| canon-4-hello-hangout/Category Marks.dc.html | uploads/Group%201261154626.png |
| canon-4-hello-hangout/Category Marks.dc.html | uploads/Group%201261154627.png |
| canon-4-hello-hangout/Category Marks.dc.html | uploads/Group%201261154628.png |
| canon-4-hello-hangout/Hangout Directory Print.html | assets/Dreaming/StayDreaming.otf |
| canon-4-hello-hangout/Hangout Directory Print.html | ./doc-page.js |
| canon-4-hello-hangout/Hangout Directory Print.html | uploads/Group%201261154628.png |
| canon-4-hello-hangout/Hangout Directory.dc.html | assets/Dreaming/StayDreaming.otf |
| canon-4-hello-hangout/Hangout Directory.dc.html | assets/brand/badge-founding-golden.png |
| canon-4-hello-hangout/Hangout Directory.dc.html | uploads/Group%201261154628.png |
| design_handoff_say_hello/Brand Directions.dc.html | assets/Dreaming/StayDreaming.otf |
| design_handoff_say_hello/Brand Directions.dc.html | uploads/Group%201261154627.png |
| design_handoff_say_hello/Brand Directions.dc.html | assets/logo.png |
| design_handoff_say_hello/Category Marks.dc.html | assets/brand/tag-outline.png |
| design_handoff_say_hello/Category Marks.dc.html | uploads/Group%201261154621.png |
| design_handoff_say_hello/Category Marks.dc.html | uploads/Group%201261154626.png |
| design_handoff_say_hello/Category Marks.dc.html | uploads/Group%201261154627.png |
| design_handoff_say_hello/Hangout Directory.dc.html | assets/Dreaming/StayDreaming.otf |
| pack-2-hello-hangout-operator/Category Marks.dc.html | uploads/Group%201261154621.png |
| pack-2-hello-hangout-operator/Category Marks.dc.html | uploads/Group%201261154626.png |
| pack-2-hello-hangout-operator/Category Marks.dc.html | uploads/Group%201261154627.png |
| pack-2-hello-hangout-operator/Category Marks.dc.html | uploads/Group%201261154628.png |
| pack-2-hello-hangout-operator/Hangout Directory.dc.html | assets/Dreaming/StayDreaming.otf |
| pack-2-hello-hangout-operator/Hangout Directory.dc.html | assets/brand/badge-founding-golden.png |
| pack-2-hello-hangout-operator/Hangout Directory.dc.html | uploads/Group%201261154628.png |
| pack-CANON-RL-04/Work Tools.dc.html | Work Surfaces All Sizes.dc.html |
| pack-CANON-RL-05/Organizations.dc.html | Open Items and Gates.dc.html |
| pack-CANON-SH-01/Waverlys Journey Locked.dc.html | ./image-slot.js |
| uploads/Hootzas.dc.html | ./support.js |
| uploads/Hootzas.dc.html | uploads/dreaming-font-2/Dreaming-BF67894f0f5bbf0.otf |
| uploads/Hootzas.dc.html | assets/brand/mark-black.png |

## Scope limits

- Static quoted src/href and CSS url scan only; navigation links included.
- No dynamic execution, srcset enumeration, fetched CSS traversal, embedded archive decoding, visual or device verification.
- Nested export failures are not proof that the matching root artwork is missing.
- No originals modified and no third-party resources downloaded by this audit.
