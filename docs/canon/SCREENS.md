# SCREEN INVENTORY

**Every screen, where it lives, who it is for, and whether it is designed and built.**

⚠️ **This exists so a change lands in one place.** Before editing anything, find it here first.

**Design:** 28 canvases, ~205 frames.
**Built:** 30 mobile screens, 1 of 6 wired to the API.

**Key:** ✅ built · 🔨 designed, not built · ✏️ not designed

---

# THE MOBILE APP

## Getting in — `Onboarding Individual.dc.html`, 28 frames

| | Screen |
|---|---|
| ✏️ | **00 Splash** — ⚠️ specced frame-by-frame in `DESIGN-BRIEF-00`, never drawn |
| 🔨 | 01 Value cards ×3 |
| 🔨 | **02 Who are you** — the front door, the role fork · alt · Other paths sheet |
| ✅ | 03 Phone — empty · error |
| ✅ | 04 OTP — entry · error · verifying |
| ✅ | 05 Name and DOB |
| ✅ | **05 Under 18** — one correction, then a dead end |
| ✅ | 06 Photo — prompt · captured |
| ✅ | 07 Your colour — nothing picked · picked · confirmed |
| ✅ | 08 Location primer — granted · denied, limited mode |
| ✅ | 09 Notification primer |
| ✅ | 10 Icebreakers — framing · question · You're in |
| 🔨 | 11 Map — seeded · empty area |

## The encounter — `Waverlys Journey.dc.html`, 12 frames

| | Screen |
|---|---|
| ✅ | **1 The nudge** — shown in three identity colours ⚠️ full-bleed in the *other* person's colour |
| ✅ | 1½ Accepted |
| ✅ | 2 The arrow |
| ✅ | **3 Scan and say Hello** ⚠️ QR generation and scan not built — A4 |
| ✅ | 4 The selfie · 4b kept |
| ✅ | 5 The pin drop |
| ✅ | 6 The countdown |
| ✅ | 7 The reveal |
| ✅ | The missed connection |

## Core app — `App Screens.dc.html`, 18 frames

| | Screen |
|---|---|
| ✏️ | 01 Splash · **02 Front door** |
| ✅ | 03 Sign in |
| ✅ | 04 Icebreakers · 05 Nudge · 06 Reveal |
| 🔨 | **07 QR code** ⚠️ no generator exists |
| ✅ | 08 Selfie |
| 🔨 | **09 Entries earned** |
| ✅ | 10 Home · 11 Hello Map · 12 What's Happening |
| ✅ | 13 Connections |
| 🔨 | 14 Empty state · **15 Drawings** · 16 Points · **17 Points at risk** |
| ✅ | 18 Settings |

## Account and safety — `Missing Mobile Screens.dc.html`, 9 frames

| | Screen |
|---|---|
| ✅ | Sign in — phone · code · locked out |
| ✅ | Settings |
| 🔨 | **Delete account** ⚠️ blocked — no `DELETE /users/me` endpoint |
| ✅ | Report anything · Block · Blocked list |
| 🔨 | Entries earned |

## Home and map

**`Whats Happening.dc.html`** — ✅ Home · quiet day · Hootza detail · **superseded by a Hello** ⚠️ only a Hello supersedes home

**`Hello Map.dc.html`** — ✅ browsing · search · pin sheet · a place · empty here

## Icebreakers — `Icebreakers.dc.html`, 8 frames

✅ after the reveal · browse the library · answering one · yours filled · yours empty · the exit · points earned · 🔨 notification

## Hootzas — `Hootzas.dc.html`, 22 frames

⚠️ **The largest unbuilt block. Every frame designed, none built.**

| | Screen |
|---|---|
| 🔨 | Hootza page — **live · ended · cancelled** |
| 🔨 | Create — what and where · how it runs |
| 🔨 | Host controls |
| 🔨 | **Check-in code** · Scanned in — Host Mode asked · Host Mode window open |
| 🔨 | **Discount composer** ⚠️ two clocks · out of free posts |
| 🔨 | **Hootza chat** ⚠️ blocked on the moderation model |
| 🔨 | Edit a live Hootza · Cancel confirm · **End vs Cancel** |
| 🔨 | RSVP states · Comments · Who's here |
| 🔨 | Post it again · Nothing on · Couldn't post |

## Chat moderation — `Chat Moderation.dc.html`, 8 frames

🔨 Host switches chat on · message actions · report reason · report sent · Tier 2 warning · **Tier 1 frozen** · revoked with appeal · host — something was reported

⚠️ Whole surface blocked until chat exists.

---

# AMBASSADOR AND BUSINESS

## `Ambassadors and Hangouts.dc.html`, 17 frames

| | Screen | For |
|---|---|---|
| 🔨 | **A1 Earned and Building** ⚠️ earned must never look as certain as building | Ambassador |
| 🔨 | A2 My Hello Hangouts | Ambassador |
| 🔨 | **A3 Queue offer** — one at a time, never browsable | Ambassador |
| 🔨 | **A4 Visit check-in** ⚠️ GPS + QR scan, nothing writes visits today | Ambassador |
| 🔨 | **A5 Payouts** ⚠️ Trolley not onboarded | Ambassador |
| 🔨 | A6 Ambassador signup | Ambassador |
| 🔨 | A7 Ambassador store | Ambassador |
| 🔨 | A8 Find the business · A9 Confirm details · A10 Photo of the place | Ambassador |
| 🔨 | **R1 Member refers a Hello Hangout** — 100 points on conversion | Individual |
| 🔨 | **H8 Signup and tier** ⚠️ nothing creates a Hangout in code | Hangout |
| 🔨 | H9 Business dashboard | Hangout |
| 🔨 | **H10 Create a post** ⚠️ two free a month, three Founding, $10 after | Hangout |
| 🔨 | H11a Directory · H11 Directory listing | Hangout |
| 🔨 | H12 Deal redemption | Hangout |

## `Ambassador Panel.dc.html`, 7 frames

🔨 Overview · Visits · Portfolio · Portfolio empty — each desktop and phone

⚠️ **Missing, ruled tonight:** commissions tracker, and visit history with location marking.

## `Dashboards.dc.html`, 7 frames

🔨 Influencer overview · Ambassadors empty · My Links · Ambassador dashboard · Hello Hangout dashboard · Member points · Member store

⚠️ **Missing, ruled tonight:** influencer tracking of Ambassadors they recruited and every business those Ambassadors bring; custom code and QR management.

## `Admin Panel.dc.html`, 3 frames

🔨 **Payout release queue** · Price override · Report review

⚠️ **`DOC-Admin-Controls-Register.md` specs far more than three screens.** You cannot run the business without this — no way to release payments, moderate, or fix anything.

---

# THE WEBSITE

⚠️ **No repo exists. Nothing deployed.**

**`Landing and Stores.dc.html`** — 🔨 Landing page · Waverly's Place · **Ambassador Shop, locked**

**`Signup Flows.dc.html`** — 🔨 Hello Hangout · Ambassador application · Creator · Organization
⚠️ **Commercially the most important screens on this list.** Every earnings figure is MA-05 gated.

**`Web Surfaces.dc.html`** — 🔨 What's Happening · Hello Map · Hangout directory · Hangout page

**`Prizes.dc.html`** — 🔨 how it works · why it's small · two futures · **drawings planned**
⚠️ No figure, no date, no entry count.

**`Waverlys Place Store.dc.html`** — 🔨 Storefront · Product · **Ambassador store · Ambassador product** · Category index

⚠️ **Missing:** privacy policy and terms as live URLs. **Apple will not accept a submission without them.**

---

# REFERENCE, NOT SCREENS

| File | |
|---|---|
| `Identity Colors.dc.html` | The ten, one frame each |
| `Category Marks.dc.html` | Map marks — teardrop, square, ringed circle, pennant, tag |
| `Brand Directions.dc.html` | Type, colour, the Dreaming lockup |
| `App Store Screenshots.dc.html` | 8 frames ⚠️ roughly six need real photographs |
| `Agency Packet.dc.html` | For Jonathan |
| `Whats Left.dc.html` | Design's own gap list |
| `Splash 00 Locked` · `Waverlys Journey Locked` | Locked versions |

---

# WHERE TO MAKE A CHANGE

| Changing… | Goes in |
|---|---|
| Signup, colour picker, under-18 | `Onboarding Individual` |
| Nudge through reveal | `Waverlys Journey` |
| Anything Hootza, including the discount composer | `Hootzas` |
| Settings, delete, report, block | `Missing Mobile Screens` |
| The feed | `Whats Happening` |
| Pins, map behaviour | `Hello Map` + `Category Marks` |
| Ambassador panel, business dashboard, signup | `Ambassadors and Hangouts` + `Ambassador Panel` |
| Influencer tracking, codes | `Dashboards` |
| Admin | `Admin Panel` |
| Website | `Landing and Stores` + `Signup Flows` + `Web Surfaces` |
| Store | `Waverlys Place Store` |
| Colours, marks, type | `Identity Colors` + `Category Marks` + `Brand Directions` |

---

# GAPS

| | |
|---|---|
| ✏️ | **Splash and front door** — never designed. `DESIGN-BRIEF-00` specs the launch animation frame by frame. |
| ⚠️ | **Admin panel** — 3 frames designed, far more specced |
| ⚠️ | **Commissions tracker** and **visit history with location** — ruled tonight, not designed |
| ⚠️ | **Influencer tracking panel** — Ambassador stream not designed |
| ⚠️ | **Custom code and QR management** — ruled tonight, not designed |
| ⚠️ | **QR generation and scan** — designed as a screen, no system behind it |
| ⚠️ | **Delete account** — designed, blocked on a missing endpoint |
