# TO DO

**Everything outstanding that is not a build task. Added as it comes up, struck when done.**

---

## EXTERNAL — needs somebody else

| | Item | Blocks |
|---|---|---|
| ⬜ | ⚠️ **Onboard Trolley.** §14.12 names them as the payout provider — W-9/W-8, TIN validation, payout rails, 1099-NEC/1042-S. Nothing has been set up. | **Nobody gets paid.** Ambassadors and influencers both. |
| ⬜ | ⚠️ **The influencer contract.** Term, termination for cause, what happens to payments if you part ways. "$20/year for life" needs a document behind it. | Influencer signups |
| ⬜ | **An SMS provider.** The code calls Twilio's SDK and there is no Twilio account. | ⚠️ **Sign-in cannot send a code.** |
| ⬜ | **MA-05 — earnings figures** | Every signup page, the influencer toolkit, Jonathan's campaigns |
| ⬜ | **MA-05 — the two-tier commission** | Ambassador recruiting |
| ⬜ | **MA-05 — sweepstakes cadence and prizes** | The prizes page |
| ⬜ | **MA-05 — "pennies on the dollar" and the AI/layoffs line** | Marketing copy |
| ⬜ | **Privacy policy** — ⚠️ must now cover background location AND the selfie capture rule where the first frame is kept | App Store submission |
| ⬜ | **Terms of service**, carrying the 18+ clauses | App Store submission |
| ⬜ | **Official sweepstakes rules** | The first drawing |
| ⬜ | **Ambassador agreement**, including the opt-out release | Ambassador signups |
| ⬜ | **Age-signal API** and safe-harbour confirmation | §8.9 legal |

---

## DECISIONS ONLY BRIAN CAN MAKE

| | Item | Notes |
|---|---|---|
| ⬜ | ⚠️ **The first drawing date** | §1.19. **Four things depend on it:** the Founding window, deferred billing, live site copy, and the switch that turns the 30-day cycle on. |
| ⬜ | **The business category list** | §18.5. 12–20 top level. Must cover a tyre shop, a dry cleaner, a lawn service. |
| ⬜ | **Are Organizations a fifth role or a kind of Hangout?** | You said four roles and a core app. Determines whether ROLE-5 exists. |
| ⬜ | **Political and student groups** | Designed as allowed, unconfirmed. ⚠️ Much harder to reverse after launch. |
| ⬜ | **Recurring Hootzas** | §28.3 says none exist. Organizations were discussed as wanting them. ⚠️ Both cannot be true. |
| ⬜ | **§14.27** — does Away mode pause visit deadlines? |
| ⬜ | **§14.34** — does the sub-Ambassador $12 come from the Ambassador or Say Hello? |
| ⬜ | **§16.32** — renewal reminder start point. Recommend 4 weeks out. |
| ⬜ | **How an Influencer leaves** — ruled as never leaving, but the contract has to say what happens if they must. |

---

## CANON REPAIRS

| | Item |
|---|---|
| ✅ | ⚠️ **Write this week's rulings into `RULES.md`.** Done 2026-08-17. |
| ⬜ | ⚠️ **Decide where canon lives.** Two repos each holding `RULES.md` is what destroyed rules twice. One repo owns it, the other reads it. |
| ✅ | **§16.6 — 20 miles, admin-adjustable.** Was 20 km. Fixed in RULES.md and ROLE-3. |
| ✅ | **§4.9/§4.10 — points do not reset until the first drawing.** After it, 30-day cycles. Written into RULES.md and ROLE-1 / 01_PRODUCT. |
| ✅ | **Hosting a Hootza is 10 points** on completion, not if cancelled. §4.19 · §28.5. |
| ✅ | **Referring a Hangout is 100 points** on conversion. Referring the app is retention only, no points. §4.11 · §4.20. |
| ✅ | **Custom codes** — first come first served, reserved word list, admin-editable. Already §25.6–25.7. |
| ⬜ | **The `_QUARANTINE` and stale folders.** Eleven Say Hello directories exist; two are live. |

---

## ASSETS

| | Item |
|---|---|
| ⬜ | **The second wave / vanish gesture.** No artwork exists. Third of three. |
| ⬜ | **The base hand as true vector.** The thumbs-up is a PNG, so the gestures can only crossfade, not morph. |
| ⬜ | ⚠️ **`badge-hangout.png`** — carries bare "Hangouts" baked into the bitmap, which §7.17 forbids, and the wrong green. |
| ⬜ | **App Store screenshots** — eight, roughly six need real photographs. |

---

## MARKETING

| | Item |
|---|---|
| ⬜ | ⚠️ **Jonathan starts 23 August.** He needs the packet, the assets, and cleared figures. |
| ⬜ | **Recruiting schools** — 25,000 organizations, the density solution. Dropped and not picked up. |
| ⬜ | **The 50,000-business email campaign.** Infrastructure warming. |

---

## INFRASTRUCTURE

| | Item |
|---|---|
| ⬜ | **Hosted Supabase.** All 30 migrations have only ever run locally. |
| ⬜ | **Deploy the API to Coolify.** |
| ⬜ | ⚠️ **The scheduler must actually run in production.** Seven jobs, `/health/jobs` wired to an uptime monitor. |
| ⬜ | **Nightly `pg_dump` off-server.** |
| ⬜ | ⚠️ **Restore one and prove it.** A backup nobody has restored is a hope. |
| ⬜ | ⚠️ **Rotate the committed database password.** In git history across three commits. |
