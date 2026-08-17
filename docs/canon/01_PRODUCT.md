# SAY HELLO — WHAT IT IS AND HOW IT WORKS

**For:** an independent code reviewer
**Purpose:** enough product understanding to judge whether the code implements the product, not just whether the code runs.

---

## 0. THE ONE SENTENCE

Two strangers standing near each other both get a notification from a mascot called Waverly, both tap accept, they walk over and say hello in person, a pin drops on a shared map, and three hours later they find out who the other person was.

Everything else in the system exists to make that moment happen more often.

---

## 1. THE CORE LOOP — THE ENCOUNTER

This is the product. If this does not work, nothing else matters.

**1. Proximity.** GPS does a coarse filter server-side — two available users close enough to be worth waking. GPS accuracy is 5–10m outdoors and worse indoors, so this stage only answers "close enough," never a distance.

**2. The nudge.** A push notification goes to **BOTH phones simultaneously**. It comes from Waverly. ⚠️ No profile, no name, no photo, no distance — the notification is the handoff and there is no separate technical handoff step.

**3. Mutual accept.** Both tap accept. ⚠️ **The connection does not exist until both have accepted.** One person accepting produces nothing. The decliner never learns who accepted; the accepter is never told they were declined. **The app never explains non-acceptance.**

**4. Foreground.** Tapping accept brings the app forward, at which point BLE has full radio access and confirms the last stretch.

**5. The QR.** A per-encounter QR code, generated at mutual accept, valid only for that encounter, live camera only. Scanning it is what proves they actually met.

**6. The selfie.** Optional until the shutter fires, committed after. The first captured frame is kept. Retakes overwrite it; nothing withdraws it. ⚠️ Disclosed **before the camera opens**, never after.

**7. The pin.** Drops on the Hello Map at the exact spot. **Permanent. Survives account deletion** — consented at signup. Where a deleted user's name was, the pin says "a Say Hello member."

**8. The countdown.** Three hours, stored as a column, executed by a scheduled job. Hours and minutes, no seconds.

**9. The reveal.** Profiles open. Icebreaker answers exchange. ⚠️ A late accept reads identically to an immediate one — no timestamp, no elapsed time.

**If BLE never confirms**, the encounter closes quietly as a lost connection. The user is told it closed. They are never told why.

---

## 2. THE RULES THAT SHAPE EVERYTHING

These are not preferences. They are structural and they appear throughout the code.

| |
|---|
| ⚠️ **The UI NEVER states a distance.** Not in copy, a notification, an empty state, or marketing. GPS cannot support a number and the number would be a promise the system cannot keep. |
| ⚠️ **The app never explains non-acceptance.** Silence is the design. A missed connection, a decline and a block must all be indistinguishable from nothing happening. |
| ⚠️ **A user's age is never revealed.** Only the range they are looking for. |
| ⚠️ **Gender is never displayed.** It is matching input only. No orientation label is ever collected — orientation is derived from "who I'm looking for," never stored. |
| ⚠️ **"Hello Hangout" is never shortened to "Hangout."** Not in copy, not in a variable name. |
| **Waverly notices, never grades.** No "Nice choice," no "Great job." |
| **Pins are permanent.** Blocking, deletion and revocation never remove one. |

---

## 3. POINTS — AND WHY THEY EXIST

**The mechanic:** accept a hello 25, selfie 25, continue 50. **25 per unique person, once ever** — you cannot farm the same person twice.

**Why they exist, and this is the design intent:** there is a half-second before someone accepts where they think *what if this is weird.* The points exist to make that first yes cheaper. They do not make the app worth using — the app is worth using. And it only has to work once, because after someone has said hello and it went fine, the reason to do it again is not 25 points.

**One pool, two futures.** Points are simultaneously drawing entries AND store discount currency. ⚠️ **Spending points destroys entries.** 25 points is 20% off, 50 is 30%, 100 is 40%. Forty is a hard ceiling.

⚠️ **Never show the gap to the next tier** while someone is shopping. Naming the ceiling teaches the ladder and starts people counting.

**No reset until the first drawing** (§4.9). After it, reset to **1, never 0**, on **30-day cycles** anchored to that drawing — everyone on the same clock, length adjustable in admin. That 1 is the automatic drawing entry. Ten qualifying activities per cycle keeps the balance (§4.10). Before the first drawing: no retention requirement, no countdown.

**The drawing.** One permanent drawing number per user, assigned at signup, never changes. Points are the WEIGHT, not separate entries — 100 points means the pool contains that number 100 times. At draw time a snapshot is taken and published; the draw runs against the snapshot. ⚠️ Winner announced by **drawing number, never by name.** Every drawing is described as **PLANNED** until funded and scheduled. No prize amount is ever stated that is not held.

---

## 4. THE BUSINESS — WHERE MONEY COMES FROM

**Hello Hangouts** are local businesses paying to be on the map: **$349/year standard, $199/year Founding** with a five-year price lock. They get a listing and space on the What's Happening page twice a month.

**Ambassadors** walk into businesses and sign them up. **$100/year per Hangout — the protected number, never reduced.** Split as **$20 origination** plus **$80 service**, where service requires an actual physical visit. Year one on someone else's origination pays **$80** (§2.4). Recurring annually as long as the Hangout stays and the Ambassador visits twice a year.

⚠️ **Nobody in the chain is paid until the Hangout pays Say Hello.** No renewal, nobody paid — Ambassador, Influencer, retired originator, all of them.

**Influencers** get **$20/year flat per Hangout, paid by Say Hello on top, for life on both streams** (§2.15). ⚠️ Never a percentage, anywhere, including comments and variable names.

**The queue** distributes unclaimed Hangouts to Ambassadors — offered within **20 miles** (admin-adjustable), 5 Ambassadors maximum, 5 days each (§16.6).

---

## 5. THE OTHER OBJECTS

**Hootzas** — gatherings anyone can host. A house party, a run club, a tailgate. ⚠️ Not a Hello Hangout: a Hangout is a *place* that pays, a Hootza is an *event with an end time*. Venue type (public place or private residence) is always declared and always displayed — nobody arrives at a house without knowing it is a house. Cover charges are display-only; **Say Hello never touches that money.** No recurring Hootzas — a finished one gets "post again."

**Host Mode** — during a Hootza, the host opens nudge windows. ⚠️ **Server-side send suppression.** Nothing is suppressed on the device. One window opening is ONE notification, never one per person nearby.

**Icebreakers** — a library of questions users write their own answers to. Three answered unlocks sharing at reveal; that is a floor, not a cap. ⚠️ The gate is on **sharing**, not signup — a user completes onboarding with zero answers.

**Hollas** — announcements from a Hangout. **Discounts** — offers with **two clocks**: the post's 7-day shelf life AND the deal's own start and end dates. Whichever expires first takes it down.

**Organizations** — churches, clubs, leagues, student groups. They get Hootzas but no connections. ⚠️ **Say Hello never touches money here.** Followers are not a mailing list.

---

## 6. SAFETY

**Blocking is silent.** ⚠️ The blocked person's experience must be indistinguishable from the app simply not putting them together. No message, no missing profile, no tell.

**Reporting never identifies the reporter.** Not by a state change, not by timing, not by a disappearance.

**Chat is host-activated per Hootza**, off by default, group only, closes when the Hootza ends. Moderation is two-tier: severe items freeze pending human review; everything else is three strikes per surface with scoped revocation. ⚠️ **Losing chat never costs the encounter.** Saying hello is the product.

**Everyone is 18+.** A hard stop at signup, one correction allowed for a mistyped birthday, then a real dead end.

---

## 7. WHAT REVIEWING THIS SHOULD MEAN

The code has already been found to fail in a specific way: **it was written against a schema it never actually ran against.** Wrong column names, enum values that do not exist, missing permissions, unchecked errors. 299 tests were green while nobody could create a user.

So the question is not "does this code compile" or "do the tests pass." It is:

**Can the product described above actually happen?**

- Can two people both accept and produce one connection?
- Does a pin exist after they meet?
- Does the reveal fire three hours later?
- Can a business pay, and does the money reach the right person?
- Do points reach a ledger, and would a drawing be defensible?
- Is silence actually silent, or does something leak?

⚠️ A route that returns 200 while writing nothing is worse than one that returns 500. Look for the silent ones.
