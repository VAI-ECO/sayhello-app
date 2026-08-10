⚠️ NEVER COMMIT WITH A FAILING TYPECHECK OR A FAILING TEST.
"Clean for production code" does not count. npx tsc --noEmit must exit zero
across the whole project, test files included. If something cannot be made to
pass, STOP and report it — do not commit and mention it afterwards.
NEVER delete or skip a failing test to get a green run.

@AGENTS.md
