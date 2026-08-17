# DESIGN — THE LAST BRIEF

**Date:** 2026-08-16
**Purpose:** everything still needed. When this is done, design is done.

Delivered: 28 canvases, ~205 frames. This covers what is missing and what tonight's rulings changed.

---

# PART 1 — NEVER DESIGNED

## 1.1 — Splash

⚠️ Specced frame by frame in `DESIGN-BRIEF-00-Launch-Animation.md` and never drawn. That document is authoritative — build to it.

Hello Blue `#2E6FD1` to Midnight `#1E2B63` gradient, animated pins, and after everything settles **the mark keeps a slow sway — 3.4s, ±7°, transform-origin 50% 88%.**

## 1.2 — Front door

Frame 02 in `Onboarding Individual` exists as "Who are you" but the **role fork** is the piece that matters and it is thin.

Five doors: **Individual · Hello Hangout · Ambassador · Creator · Organization.**

⚠️ Roles are additive on one account (§26.4). Somebody who already has an account and is adding a role sees a different screen from a first-time signup. Design both.

⚠️ **Individual must be the obvious default.** The other four are for people who arrived knowing what they wanted.

---

# PART 2 — RULED TONIGHT, NEEDS DESIGN

## 2.1 — Commissions tracker · Ambassador panel

Per Hangout, what is **owed, paid, and building.**

⚠️ **§2.1: $20 origination + $80 service = $100.** ~~$50/$50~~ is dead — remove on sight. Every number on this screen uses the new split.

| |
|---|
| Origination and service shown **separately**, because they are earned differently and one can transfer |
| ⚠️ **§14.17 — origination never transfers. Servicing does.** Two permanent fields. |
| What triggers each payment and when |
| ⚠️ **§2.14 — nobody is paid until the Hangout pays Say Hello.** A commission that exists but is not yet payable must look different from one that is. |
| ⚠️ **EARNED must never look as certain as BUILDING.** Legal, not decorative. |

## 2.2 — Visit history with location · Ambassador panel

Not "you owe two visits" — **the record of what they did and where they were.**

Every visit: when, which Hangout, and **the GPS mark.**

⚠️ **§14.7 — tell Ambassadors plainly why the check exists. No hidden enforcement.** This screen is their proof of work, not surveillance, and it should read that way.

§14.5 — a visit needs **both GPS and a scan of that Hangout's QR**, live camera only.
§14.6 — **GPS is monitored, not tight. The scan is the real proof.**
§14.10 — installing a stand **is** a verified visit.

Also on this screen: which visits are due, which window is open. §14.3 — visit 1 in the first six months, visit 2 in the second.

## 2.3 — Influencer tracking · two streams

The existing `Dashboards` frames cover the influencer's own links. **The Ambassador stream is missing entirely.**

**Stream A — businesses they signed directly.** $20/year each.

**Stream B — Ambassadors who signed up on their code, and every business those Ambassadors bring in.** ⚠️ $20/year on each of those too.

⚠️ **Ruled tonight: the influencer is paid for life**, as long as the Hangout renews. Stream B is potentially thousands of businesses under hundreds of Ambassadors. **Design for that scale** — a summary that stays readable at 15,000 rows, not a list.

⚠️ **§2.12 — the rate is $20 FLAT. NEVER a percentage, anywhere, including labels.**

## 2.4 — Custom codes and QR · Influencer panel

They set their own code text — their name, whatever they want. And a matching QR.

| |
|---|
| ⚠️ **First come, first served.** A taken code is gone. |
| **Blocked words**, admin-editable: SAYHELLO, WAVERLY, ADMIN, obscenities |
| ⚠️ **Confusables normalised** — O/0, I/1. MIKE0 and MIKEO must not be two influencers. |
| ⚠️ **§2.10 — codes carry credit, never price.** No audience, creator or promo discount. Nothing on this screen may suggest a code is a coupon. |

⚠️ The "taken" state matters. Somebody losing a code they wanted is a reason to move fast — design it to feel that way, not like an error.

## 2.5 — Admin panel

**Three frames exist. `DOC-Admin-Controls-Register.md` specs far more.**

⚠️ **You cannot run the business without this.** No way to release a payment, moderate a report, or fix a mistake.

Beyond the three delivered — payout release queue, price override, report review — this needs at minimum:

| |
|---|
| **Roles and permissions** — who can do what |
| **The admin-adjustable settings**, all in one place: ⚠️ the Ambassador radius (**20 miles default, ruled tonight**), the 30-day cycle length, the activity count, visit windows, blocked code words |
| **Ambassador management** — status, eligibility, away mode, reassignment |
| **Hangout management** — tier, renewal, hardship approval (§1.8 — **never advertised**) |
| **The moderation queue** |
| **⚠️ The drawing runner** — snapshot, draw, publish. §5. |
| **Audit log** — every admin action, reviewable |

⚠️ **The price override shows margin.** §1.12 — $249 is both a price and a margin, and every document must say which.

---

# PART 3 — TONIGHT'S RULINGS THAT CHANGE EXISTING SCREENS

## 3.1 — The feed ration

⚠️ **Two posts per calendar month. Founding gets three. $10 for each one after.**

**This now applies to Organizations too, not just Hangouts.** Same numbers, same $10.

⚠️ **A Hootza posted to What's Happening consumes a slot.** Discounts, Hollas and Hootzas all draw from the same two.

⚠️ **A Hootza NOT posted to the feed is free and unlimited.** It lives on their page and the map. A bar with a band every Thursday costs them nothing — the feed slot is for the thing they want everyone to see.

**Screens affected:** `Hootzas` discount composer and out-of-free-posts · `Ambassadors and Hangouts` H10 Create a post · Organization dashboard.

⚠️ The composer must make the choice obvious: **post it to the feed and spend a slot, or just list it.**

## 3.2 — Points and the 30-day cycle

⚠️ **Before the first drawing: nobody loses points.** No reset, no retention requirement, no countdown. Everyone accumulates.

⚠️ **After the first drawing: 30-day cycles**, everyone anchored to the drawing, same clock for all. Reset to **1, never zero**. Ten activities keeps the balance. A drawing every cycle.

**Screens affected:** `App Screens` 16 Points and **17 Points at risk** · `Prizes` · `Dashboards` Member points.

⚠️ **"Points at risk" must not exist before the first drawing.** There is nothing at risk yet. Design the pre-drawing state as well as the post.

**New point values:**

| Action | Points |
|---|---|
| Refer a Hangout that converts | **100** — and satisfies retention for that month plus eleven |
| Host a Hootza that completes | **10** ⚠️ not if cancelled |
| Refer the app to a person | **0** — retention only |

**Activities that count toward the ten:** visiting a Hello Hangout · attending a Hootza · starting a Hootza · referring the app · referring a Hangout.

## 3.3 — Ambassador commission split

⚠️ **$20 origination + $80 service.** ~~$50/$50~~ is dead.

**Downstream:** §2.4 — servicing somebody else's origination pays **$80** in year one. ~~$50~~ is dead. That makes taking over an existing Hangout considerably more attractive, and the queue offer screen should reflect it.

**Opt-out is 20% of what the current Ambassador earns on that Hangout**, two years, originated only. If the $100 ever moves, the opt-out follows it.

**Screens affected:** `Ambassadors and Hangouts` A1, A3 · `Ambassador Panel` overview and portfolio.

## 3.4 — The Ambassador radius

**20 miles, admin-adjustable.** ~~20 km~~ is dead.

⚠️ The reason belongs on the admin screen: **Wyoming may need 30, Manhattan may need 10.**

## 3.5 — Organization signup

`Signup Flows` has the frame. Two things to add:

⚠️ **The person signing up already has an account.** The organization is a role added to it, never a separate login.

⚠️ **The two-post feed ration**, same as a business, $10 after.

---

# PART 4 — ASSETS

| # | Item |
|---|---|
| 4.1 | **The second wave / vanish gesture.** No artwork. Third of three — thumbs up (+25), OK (+25, delivered as vector), second wave (+50, then vanishes). White ring on all three, each plays once, no loops. |
| 4.2 | **The base hand as true vector.** The thumbs-up is a PNG, so the three gestures can only crossfade. ⚠️ The spec calls for morphing, which needs vector. |
| 4.3 | ⚠️ **`badge-hangout.png`** — bare "Hangouts" baked into the bitmap, which §7.17 forbids, and the old green rather than Fern `#4F8C36`. Text in a bitmap cannot be fixed by the i18n layer. **Re-cut.** |
| 4.4 | **App Store screenshots** — 8 frames designed. ⚠️ Roughly six need real photographs. |

---

# PART 5 — RULES THAT HOLD ON EVERYTHING

- ⚠️ **Never state a distance.** §8.12. Extended by Design's own ruling: *"change the town, not a radius. We don't do miles."* A radius slider is a distance in disguise.
- ⚠️ **"Hello Hangout" is never shortened to "Hangout."** Not in copy, not in a variable name, not baked into an asset.
- **Hello** and **Say Hello** always Dreaming, never split. Hootza, Holla and Hello Hangout: Dreaming at headlines, Assistant in tabs, buttons, list rows and data.
- **Colours belong to people, not to categories.** The shape tells you what a pin is.
- Ten identity colours for people only. Fixed roles — Fern, Plum, Hello Blue, Amber, Signal Red, Terracotta, Midnight — never a user's colour.
- ⚠️ **Signal Red is errors only.**
- **Waverly notices, never grades.** No "Nice choice." No "Great job."
- ⚠️ **EARNED must never look as certain as BUILDING.**
- ⚠️ **No prize figure, no drawing date, no entry count "in the next drawing."**
- ⚠️ **Every earnings figure is MA-05 gated.** Design so numbers sit in fillable slots — never baked into artwork, never set as an image, never load-bearing for the layout.
- Font is Assistant — 300, 400, 600, 700, 800.
- Every string through the i18n layer. **No copy baked into artwork, ever.**
