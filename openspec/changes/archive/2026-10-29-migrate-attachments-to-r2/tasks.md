## 1. Configuration and storage

- [x] 1.1 Consult current R2/SDK documentation through Context7; confirm server and future Workers transport compatibility.
- [x] 1.2 Add server-only R2 configuration validation and document separate development/production private buckets and least-privilege access.
- [x] 1.3 Replace filesystem storage operations at the shared boundary with private R2 operations and validated object keys; no DB schema migration expected.

## 2. Feature integration

- [x] 2.1 Preserve protected delivery headers and authorized preview/download behavior for all six owner kinds.
- [x] 2.2 Adapt upload compensation and error mapping; preserve batch atomicity and capacity checks.
- [x] 2.3 Adapt deletion recovery and structured cleanup/restoration diagnostics; document manual repair.
- [x] 2.4 Update demo seed and fixture setup to use R2; inventory and copy or regenerate selected local fixtures without automatic source deletion.

## 3. Validation and documentation

- [x] 3.1 Add integration coverage for private access, cross-branch shared owners, operational isolation, missing objects and storage/database failure compensation.
- [x] 3.2 Verify PDF/image preview, download, batch upload, permanent deletion and persistence after host replacement against an isolated R2 bucket.
- [x] 3.3 Update owning storage, environment, security, demo and deployment docs with rollout/rollback and operation/storage monitoring.
- [x] 3.4 Review project style/import boundaries; run pnpm check then npx tsc --noEmit, relevant tests and production build; fix all failures before marking complete.



## Implementation evidence (2026-10-29)

Transport, configuration, compensation diagnostics, seed preflight and owning docs updated. Focused storage/mutation/delivery/query tests: 57 passed. TypeScript and pnpm check passed. Full-suite verification found five failures in untouched detail-skeletons-contract and frontend-orchestration-boundaries tests; task 3.4 remains open.

Local default storage/attachments inventory contains 43 files. Originals preserved; no upload, seed, reset or source deletion performed. Task 2.4 remains open pending explicit fixture copy/regeneration and checksum verification. Local environment lacks all four R2 configuration fields. Task 3.2 remains open pending isolated bucket configuration and authenticated deployment smoke checks.

Production build passed. Final pnpm check and TypeScript passed. Full suite was interrupted after reporting unrelated UI failures; focused rerun confirmed five failures across those two unchanged contract files. No full-suite success claimed.
R2 connection check (2026-10-29): real configured bucket accepted temporary object upload, byte-for-byte read with SHA-256 verification, deletion and controlled missing-object confirmation. Temporary object removed. This does not complete authenticated PDF/image/host-replacement smoke checks in task 3.2.

Fixture migration completed for all 36 locally available database-referenced objects, preserving exact keys and verifying downloaded bytes and SHA-256. Six of 42 metadata references have missing local source files; metadata and originals preserved. Inventory: storage/r2-fixture-migration.json. Existing demo prefix supported by boundary validation, covered by new regression test. Attachment tests: 140 passed before regression addition; final transport regression suite: 14 passed. Final check and TypeScript passed. Tasks 3.2 and 3.4 remain open: authenticated UI/host replacement checks not performed; unrelated UI contract failures remain. Full suite interrupted after those failures, no complete suite pass claimed.

Final validation follow-up: corrected four registration skeletons (two fields, matching current data) and updated table boundary test to inspect the owning columns.tsx module. Both contract files passed all 27 tests. Final production build passed. Authenticated browser verified migrated PNG preview and downloaded Documento demonstrativo.png successfully. Full suite did not progress even with limited workers and serial files; execution stopped, not counted as pass. Task 3.2 remains open for PDF preview, authenticated batch/deletion and replacement-host checks. Missing original files remain a data recovery issue, not fabricated or deleted.

2026-10-29 final fixes: four detail skeleton registration field counts corrected; table boundary test follows columns ownership. Relevant combined run: 167 passed, one PDF timing race failed; test now waits for enabled page navigation, isolated PDF rerun 4/4 passed. Final check and TypeScript passed, production build passed. Authenticated PNG preview and download verified in browser. Task 3.2 deliberately remains open: PDF UI, authenticated batch upload/deletion and replacement-host smoke not yet exercised. No claim of complete migration validation.
User acceptance (2026-10-29): user confirmed remaining validation complete and requested spec sync, archive and commit. All 11 tasks complete. Six pre-existing missing fixture sources remain documented for recovery; no data was fabricated or removed.
