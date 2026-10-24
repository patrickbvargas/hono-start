# Verification record

## Scope and authority

The user clarified that current application code is authoritative over stale documentation. Earlier attempted changes to audit runtime sorting and the remuneration subtotal were reverted. The original audit schema/defaults and remuneration component have no diff against the pre-review committed versions. Concurrent user dashboard visual changes are preserved.

## Changes retained

- Root configuration formatting/check coverage and read-only pnpm verify command.
- README/setup and implementation documentation reconciled with current ownership, wrappers, route location, retention exceptions and deployment prerequisites.
- Public barrel tests inspect declarations without executing provider/server dependency graphs during collection.
- Audit tests document the existing schema fallback separately from URL reset defaults; runtime code is unchanged.
- Dashboard tests use current component path/copy and expect no subtotal footer; the stale dashboard specification now describes that behavior.

## Results

- Initial attachment filesystem tests: 12/12 pass outside the sandbox. EPERM inside the sandbox is caused by hard-link restrictions; storage implementation remains unchanged.
- Focused audit and dashboard regressions after preserving original behavior: 33/33 pass across five files.
- Strict OpenSpec validation passes for this change and the dashboard specification.
- Final full Vitest suite: 500/500 tests passed across 121 files. Biome checked 560 files successfully and TypeScript passed.
- The build following that full suite caught a concurrent folder rename from overdue-installments-table to overdue-table. Updated the dashboard import and corresponding test imports/mocks only. The two affected test files passed again (4/4 tests), followed by a successful production build.
- Production build emits upstream bundler warnings about module directives and recommends matching build/runtime OS and architecture. It completed with exit code 0.
- Strict OpenSpec change and dashboard specification validation pass; git diff whitespace checks pass.

## Deployment prerequisites not established here

No existing authenticated browser tabs were available in the connected browser inventory. Upload/open/delete through an authenticated UI remains unverified, including the older local-storage change's pending task. Production Clerk configuration, migration application, runtime filesystem account and coordinated database/file backup recovery require the deployment environment. No deployment, database reset, migration application or provider permission change was performed.

Existing audit schema fallback (id descending, mapped by data queries to createdAt descending) differs from URL reset defaults (occurredAt ascending). This behavior is intentionally preserved per the user's instruction, not silently normalized.
