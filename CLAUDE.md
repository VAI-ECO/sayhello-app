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

BEFORE WRITING OR EDITING ANY TEST, read the version-matched docs shipped in
node_modules/@testing-library/react-native/docs/ — especially
guides/llm-guidelines.md and guides/common-mistakes.md. RNTL v14 changed the
API: render, fireEvent, renderHook and userEvent are ALL async and must be
awaited. Do not write v13-style tests.

READ A LIBRARY'S SHIPPED DOCS BEFORE DEBUGGING IT. Many packages ship
version-matched documentation inside node_modules. Check there first.

NEVER report a test result you did not see in tool output. If output is
truncated, say it was truncated and re-run with a narrower command until you
have the real numbers. An inferred PASS line is a fabrication, and I rely on
these reports to catch problems.

## ⚠️ THIS PRODUCT IS TWO REPOS

  /Users/bmac/sayhello-app  — this one. Frontend, every screen.
  /Users/bmac/sayhello-api  — backend. Endpoints, migrations, jobs.
                              ⚠️ Canon lives there: docs/canon/, docs/RULES.md
                              ⚠️ Design lives there: docs/design/

Any question about the product, a rule, or a design reads the api repo too.
State which repo every claim comes from.
