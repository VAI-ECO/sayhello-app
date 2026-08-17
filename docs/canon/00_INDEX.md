# 00 — INDEX AND AUTHORITY

**This file settles disagreements between documents. Read it first.**

---

## THE ORDER

When two documents conflict, the higher one wins. No discussion, no session-by-session re-litigation.

| # | Document | Status |
|---|---|---|
| **1** | **`RULES.md`** | 🔒 **AUTHORITATIVE.** Every locked rule. Nothing overrides it. |
| **2** | **`DECISIONS.md`** | 🔒 Rulings not yet folded into RULES.md. ⚠️ A newer ruling here supersedes an older rule there — and must then be written into RULES.md. |
| **3** | **`ROLE-*.md`** | Collections. They gather what applies to each role and point back to RULES.md. ⚠️ They never contain a rule that is not in RULES.md. |
| **4** | **`VOICE.md` · `SAFETY.md` · `MONEY.md` · `LEGAL.md`** | Cross-cutting collections. Same status as role files. |
| **5** | **`01_PRODUCT.md`** | Description, not law. Explains what the thing is. |
| **6** | **`RULES-RATIONALE.md`** | ⚠️ Why a rule exists. Not a rule itself, but read it before undoing anything — it exists to stop a future session reversing a decision it does not understand. |
| **7** | **`FLOW-*.md`** | Reference. ⚠️ Several predate current rulings and are stale. Never treat as authoritative. |
| **8** | **`DESIGN-BRIEF-*.md`** | Design reference only. |
| **9** | **`OPEN-QUESTIONS.md`** | Not authority. A list of what is genuinely unruled. ⚠️ An agent hitting one of these STOPS and asks. |
| **10** | **`BUILD-LOG.md`** | History. What was built, when, what was found broken. |
| — | `HANDOFF.md`, `PROMPT-*.md`, `PLAN-*.md` | ⚠️ **ARCHIVE.** Session artifacts. Not canon. Do not build from them. |

---

## THE RULES ABOUT THE RULES

| # | |
|---|---|
| **A** | ⚠️ **`RULES.md` lives in ONE place.** Two writable copies drift, and copying one over the other destroys whatever the other side had. That has already happened twice. |
| **B** | 🔒 A rule marked 🔒 is locked. ⚠️ Changing one is a ruling, dated in `DECISIONS.md`, not an edit. |
| **C** | ❓ or ⚠️ on a rule means unresolved. **An agent that hits one STOPS and asks. It does not guess.** |
| **D** | Every ruling goes into `DECISIONS.md` **the same session it is made.** ⚠️ A ruling that lives only in a conversation is lost when the conversation ends. |
| **E** | ⚠️ **Nothing is authoritative because it is recent.** A newer document does not outrank RULES.md. It outranks it only when the ruling is recorded in DECISIONS.md. |

---

## WHAT TRAVELS

Hand these to a new chat, a new model, or a new person:

```
00_INDEX.md
01_PRODUCT.md
RULES.md
DECISIONS.md
OPEN-QUESTIONS.md
ROLE-*.md          — whichever is relevant
VOICE.md           — if they are writing copy
```

Everything else is available on request. ⚠️ **Do not hand over the FLOW files as a starting point.** Several are stale and they will be treated as current.
