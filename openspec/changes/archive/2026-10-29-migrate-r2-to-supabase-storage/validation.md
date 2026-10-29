# Implementation evidence

2026-10-29: Official Supabase Storage error-code documentation and Context7 REST references reviewed. Existing metadata keys and application schema remain unchanged; no application database migration required.

Local environment has DATABASE_URL and DIRECT_URL but no R2 bucket/access credentials and no SUPABASE_URL/STORAGE_BUCKET/SECRET_KEY. Source inventory, target selection, real private-bucket smoke tests and deployment cutover have not run. Connected projects include active hono-sdd plus two inactive projects; selection has not been assumed.

Follow docs/implementation/ATTACHMENTS.md for copy, SHA-256 verification, write freeze and rollback reconciliation. No source objects removed; no remote writes or deployment performed.

Validation: pnpm check passed; npx tsc --noEmit passed. Focused attachment/seed suite: 19 files, 158 tests passed. Isolated HTTP adapter suite: 20 tests passed. Initial full pnpm verify encountered a financial calendar test failure during concurrent runs; it was interrupted and full tests rerun with two workers to distinguish resource contention. See final run results below.

Production build passed (existing bundler warnings). Financial calendar test rerun alone: 4/4 passed. User selected existing attachments bucket as official target. No disposable smoke object written to official bucket.

Read-only target verification: hono-sdd / attachments exists, public=false, file_size_limit=10485760, allowed_mime_types=null, object_count=5. Existing objects must be preserved. This is metadata verification, not successful HTTP or authenticated application smoke validation.

Full suite rerun with maxWorkers=2 did not finish or emit a final result during this session and was interrupted. Therefore task 3.3 remains incomplete; no claim that pnpm verify passed. Focused tests, TypeScript, formatting and production build passed independently. Remote R2 inventory and real HTTP validation remain blocked by absent credentials; official target bucket metadata was verified read-only.

## Updated environment validation

Real HTTP adapter smoke passed against official private attachments bucket: upload, SHA-256 round trip, duplicate-key rejection with original bytes intact, anonymous public URL denial, delete, ENOENT and idempotent missing deletion. Unique smoke object removed. Existing five target objects preserved.

Database inventory found 48 references initially absent from target. Recovered 36 exact-key objects from preserved local attachments; checked database size and SHA-256 equality of source/target. No overwrite, metadata changes or source deletion. inventory.json records all IDs/results. Remaining IDs 37–48 return ENOENT and have no matching local source; retained R2/backup originals required. Cutover cannot be declared complete until these 12 references are recovered or explicitly resolved by owner.

pnpm check and npx tsc --noEmit passed; current production build passed. Full Vitest run and focused rerun did not emit a final result within session; do not treat these as passing. Prior focused successful results remain historical evidence. Official-bucket transport smoke is real, but isolated-bucket and authenticated application cross-scope validation remain pending.

## User decision: disposable existing data

User explicitly waived further retained-object migration and will reset existing data later. Missing legacy IDs 37–48 no longer block this storage change; they can remain unavailable until the user resets data. No reset, metadata deletion, source deletion or additional object migration is authorized or performed by this decision. Previously copied 36 objects and five original target objects remain intact. Target is configured locally; no production deployment claimed. Tasks 1.2 and 4.3 updated to reflect accepted scope. Release verification and isolated/authenticated integration validation remain incomplete (3.3 and 4.2).

## Authenticated acceptance reported by user

User confirmed: "testes logado estão ok". Record this as user-reported authenticated acceptance, separate from agent-run HTTP transport smoke and mocked authorization tests. Validation used configured official attachments bucket rather than an isolated bucket. Individual authenticated scenarios and cross-scope denial were not independently observed or enumerated. Task 4.2 reflects this accepted validation scope. Full-suite release verification (3.3) remains pending; overall progress 10/11.

## Final review and release verification

Final full suite completed successfully: pnpm exec vitest run --pool=forks --maxWorkers=8 --reporter=verbose, exit 0, 226 test files and 1175 tests passed, 284.71 seconds. Full log: storage/final-supabase-forks.log. The default threads pool stalled in this environment; using the supported forks pool changed execution isolation only, with no skipped tests, timeout suppressions or altered assertions. No test configuration change was needed.

pnpm check passed; pnpm exec tsc --noEmit passed; pnpm build passed (storage/final-supabase-build.log). Earlier incomplete runs are superseded by this completed suite.

Final review: existing shared adapter exports/key validation preserved; server-only validated configuration; private Storage via secret apikey; no public/signed browser URLs; no-overwrite POST; explicit missing-file mapping; provider errors stay safe; no blind mutation retries; feature-owned cleanup/restoration and authorization preserved. AWS storage dependency removed. No application schema/auth/frontend architecture migration introduced. No temporary runtime fallback, test bypass or legacy-provider dual-write added.

All 11 tasks complete under explicitly accepted scope: legacy object recovery waived by user, authenticated testing confirmed by user on official private bucket, real transport smoke passed. No production deployment, reset, archive or source deletion performed.
