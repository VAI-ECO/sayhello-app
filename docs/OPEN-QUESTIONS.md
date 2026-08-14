# Open Questions

## Item 5: Delete Account Feature

**Status:** STOPPED - API endpoint does not exist

**Issue:**
Design spec found in `Missing Mobile Screens.dc.html` (Frame 5), but the API backend has no account deletion endpoint.

**Design complete:**
- UI properly warns per §10.10: "Your pins on the Hello Map" stays (emphasized in bordered box)
- Explains reason: "Both of you put each pin there. It's their record of meeting you as much as yours of meeting them"
- §10.11 compliant: "Selfies you're in can be taken down — ask us and a person handles it" (not a button)
- Copy: "Where your name was, a pin will say **a Say Hello member**"

**API status:**
- ❌ No DELETE /users/me endpoint exists in `sayhello-api/src/routes/users.ts`
- ✅ Only GET /users/me and PATCH /users/me currently implemented

**Next steps:**
1. Create DELETE /users/me endpoint in API
2. Implement soft deletion (mark deleted_at, preserve pins per §10.10)
3. Remove: name, photo, icebreaker answers, points/entries, chats
4. Keep: pins (with name replaced by "a Say Hello member")
5. Selfie removal remains out-of-band (§10.11)

**Blocked:** UI implementation blocked until API endpoint exists

---

*Updated: 2026-08-14*
*Session: Queue items 5-7 - Delete Account, Report, Block*
