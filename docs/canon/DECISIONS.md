# DECISIONS

**Every ruling, dated, one line. The ruling only — the reasoning lives in `RULES-RATIONALE.md`.**

⚠️ **This file exists so nothing gets asked twice.** When a new session raises something already settled, it is here.

⚠️ **A ruling recorded here must be written into `RULES.md`.** Until it is, this file outranks it.

---

## 2026-08-16

| | Ruling | Into RULES.md |
|---|---|---|
| | QR code is valid **30 minutes from mutual accept**, not from the notification | ✅ §10.7 |
| | **Either phone shows the code, either scans.** The WhatsApp model. No fixed roles. | ✅ §10.7 |
| | The scan **drops the pin and awards its points.** Selfie is separate points. Chat acceptance is separate points. | ✅ §10.8 |
| | **Two failed scans opens a manual selfie path.** The failure is evidence they are together. | ✅ §10.38 |
| | ⚠️ **No abuse limit on the fallback.** Faking it costs more coordination than 25 points is worth. Ruled acceptable. | ✅ §10.39 |
| | The **pin is not the row.** A hello exists from mutual accept; it appears on the map only once `qr_scanned_at` is set. | ✅ §10.8 |
| | **A pending hello shows only Waverly.** No name, no photo, no user ID, no location. Nothing until both accept. | ✅ §10.6 |
| | **§10.25 unchanged** — missed connections exchange icebreakers only. No chat, no profile. | ✅ |
| | **Map pins carry no names.** Name and selfie appear only on the enlarged view. | ✅ §10.40 |
| | **Location is stripped before reveal.** `hangout_id`, `location_name`, lat and lng return at reveal with everything else. | ✅ §10.41 |
| | Selfie points awarded on **successful upload**, not on attempt. | ✅ §10.35 |
| | Selfie size limit **8 MB**. iPhone photos run 2–4 MB. | ✅ §10.42 |
| | Selfie bucket is **private, signed URLs**. Non-participants see it only on the enlarged map pin, after reveal. | ✅ §10.43 |
| | ⚠️ **The selfie image survives account deletion.** A pin with a missing photo is not a preserved record. | ✅ §10.10 |
| | Signed URLs stay as they are. A forwarded link working for an hour is not a meaningful escalation over a screenshot. | ✅ §10.44 |
| | **Two people who have already met may say hello again.** ⚠️ No points on the repeat — §4.2 stands. | ✅ §10.45 · §11.3 |
| | Nudge TTL fallback **1 hour**; never-met fallback **2 hours**. ⚠️ Both retire when range detection ships. Superseded for QR by the 30-minute rule above. | ✅ §10.28 · §10.46 |

---

## 2026-08-15

| | Ruling | Into RULES.md |
|---|---|---|
| | **Gender: Male / Female / Other.** Radio. Other opens a modal with a curated list — non-binary, genderqueer, genderfluid, agender, prefer not to say. ⚠️ No free text. | ✅ §13 |
| | ⚠️ **Gender is never displayed.** Matching input only. | ✅ §13 |
| | **Looking For: Men / Women / Anyone.** ⚠️ This replaces orientation entirely — no orientation label is ever collected. | ✅ §13 |
| | **Pronouns are a separate, public field.** Full list plus custom free text. ⚠️ Never inferred from gender. | ✅ §13 |
| | **§13.18 answered YES** — a Romance mismatch still produces an ordinary hello nudge. | ✅ §13.18 |
| | **"Romantic nudges only" toggle** governs which nudges you receive. ⚠️ Never visible to anyone else. Asymmetry is the design. | ✅ §13 |
| | **§24.3 amended** — no KYC at signup, ever. The single exception is age verification for an age-restricted Hootza, and only after the app opens to 13+. | ✅ §24.3 |
| | **FLOW-10 §3.1 is stale.** Profiles open on mutual accept, not one tap. | ✅ |

---

## 2026-08-14

| | Ruling | Into RULES.md |
|---|---|---|
| | **Moderator reads the reported message plus 10 either side.** Full thread only on a Tier 1 severity item. | ✅ §35 |
| | ⚠️ **The host does NOT see reports about their own Hootza.** They may be the subject. They see that something was reported and may end or remove. | ✅ §35 |
| | **Strikes expire after 12 months, rolling.** | ✅ §35 |
| | **5 strikes across both surfaces** becomes an account matter, human review. | ✅ §35 |
| | **Every drawing is described as PLANNED** until funded and scheduled. ⚠️ No prize amount that is not held. Never a number of entries "in the next drawing." | ✅ §5 |
| | **Age is an optional host-set advisory**, off by default, labelled "Adults only." ⚠️ Not a required field. Stamping every Hootza is noise. | ✅ §28.18 |
| | **Hootza chat is host-activated**, off by default, group only, closes when the Hootza ends. | ✅ §28.19 |
| | ⚠️ **No friend requests from chat.** They are in the same building — the hello happens in the room. | ✅ §28.20 |

---

## 2026-08-13

| | Ruling | Into RULES.md |
|---|---|---|
| | **The drawing is weighted, not issued.** One permanent drawing number per user; points are the weight. ⚠️ A snapshot at a fixed moment is the auditable record. | ✅ §5.16 |
| | ⚠️ **Winner announced by drawing number, never by name.** | ✅ §5.17 |
| | **Discount colour is Terracotta `#B5502A`.** A fixed role colour, never pickable. | ✅ §34 |
| | **A Discount is a TAG on the map**, outlined, eyelet in the neck. | ✅ §33 |
| | **The Founding badge shows on the map pin**, not only on the page. Amber `#CE8527`. | ✅ §33.3 |
| | **Business categories use the library's own sections**, not generic buckets. Old categories retired, never deleted. | ✅ §18.6 |
| | **Icebreakers: users type their own answers.** ⚠️ Not tap-to-select. Three answered unlocks sharing — a floor, not a cap. | ✅ §13 |

---

## 2026-08-12

| | Ruling | Into RULES.md |
|---|---|---|
| | **The selfie commits at the shutter.** Optional until the first capture; retakes overwrite; nothing withdraws it. | ✅ §10.29–10.33 |
| | ⚠️ **Disclosed before the camera opens**, never after. | ✅ §10.34 |
| | **25 points at first capture only**, never on retake. | ✅ §10.35 |
| | **§10.11 amended** — removal is a formal request handled out of band, never a button, never inside the encounter flow. | ✅ §10.11 |
| | **Proximity is two-stage:** GPS coarse filter server-side, BLE fine confirm in the foreground. The push notification IS the handoff. | ✅ §8.10–8.13 |
| | ⚠️ **The UI never states a distance.** Not in copy, a notification, an empty state, or marketing. | ✅ §8.12 |
| | Extended by Design: **"change the town, not a radius. We don't do miles."** A radius slider is a distance in disguise. | ✅ §8.14 |

---

## 2026-08-11

| | Ruling | Into RULES.md |
|---|---|---|
| | **The ten identity colours**, all pickable, foreground from a fixed table. ⚠️ Never a computed contrast check. | ✅ §34 |
| | **The picker is ONE screen.** ⚠️ Copy: "Waverly looks good in [colour]." Never "Nice choice." Waverly notices, never grades. | ✅ §34 |
| | **Font is Assistant**, weights 300–800. Dreaming for brand words only. | ✅ §7.15–7.18 |
| | **"Hello" is always Dreaming, everywhere.** "Say Hello" is one locked lockup, never split. Hootza, Holla and Hello Hangout are Dreaming at headlines, Assistant in tabs, buttons and data. | ✅ §7.15–7.18 |
| | **Tabs: Happening · Map · Hellos · Prizes · You.** ⚠️ "Hellos" is locked vocabulary and overrides the design's "People." | ✅ §6.16 |
| | **Under 18 is a hard stop with ONE correction allowed.** A second under-18 entry is a real dead end. | ✅ §24.17 |
| | **Onboarding order: colour before photo.** Waverly is already wearing their colour when the photo screen opens. | ✅ §26.8 |

---

## PLANNED, NOT BUILT

⚠️ These are ruled but deliberately not in the product yet.

| | |
|---|---|
| **Age expansion to 13+** | Only after: insurance, a second legal pass, and KYC-gated Hootzas. ⚠️ Unverified means **no connection at all** at an age-restricted Hootza — not a warning, not a limited mode. |
| **Prize figures** | Nothing stated until funded. The first drawing date does not exist. |
