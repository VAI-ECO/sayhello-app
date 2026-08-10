⚠️ NEVER COMMIT WITH A FAILING TYPECHECK OR A FAILING TEST.
"Clean for production code" does not count. npx tsc --noEmit must exit zero
across the whole project, test files included. If something cannot be made to
pass, STOP and report it — do not commit and mention it afterwards.
NEVER delete or skip a failing test to get a green run.
NEVER weaken or rewrite an assertion to make a test pass. If a test fails,
the test is telling you something — find out what before changing it. A test
renamed, softened, or rewritten to assert something easier is the same
failure as deleting it.
NEVER commit a file you were told not to modify. If it is already dirty,
STOP and show me the diff.

@AGENTS.md
