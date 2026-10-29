## 1. Confirm contracts and environment

- [x] 1.1 Verify current Supabase Storage APIs and error semantics using official docs and Context7; confirm no database schema migration is required.
- [x] 1.2 Inventory database keys and target private bucket; retained-object recovery waived by user because existing data will be reset later.

## 2. Replace storage transport

- [x] 2.1 Add validated server-only Supabase configuration and update environment examples while preserving unrelated Cloudflare configuration.
- [x] 2.2 Replace R2 upload/read/delete transport in the shared adapter, preserving exports, key validation, no-overwrite behavior and missing-object handling.
- [x] 2.3 Preserve quota classification, safe errors, unknown-outcome logging, upload cleanup and deletion restoration; remove unused storage dependencies.

## 3. Verify behavior

- [x] 3.1 Update transport tests for success, collision, missing configuration, missing file, denied access, quota, outage and unknown mutation outcomes.
- [x] 3.2 Run focused attachment authorization, mutation compensation, file-delivery and seed compatibility checks; verify all owner kinds and shared-master access.
- [x] 3.3 Review code against repository conventions; run pnpm check then npx tsc --noEmit and fix errors; run required release checks and record actual results.

## 4. Document and validate rollout

- [x] 4.1 Update owning architecture, security, attachment and quality documentation plus active D1 storage references; document cutover and rollback.
- [x] 4.2 Validate real private Storage transport and record user-confirmed authenticated testing in the configured attachments bucket; official bucket used instead of isolated bucket. Detailed cross-scope scenarios were not individually reported.
- [x] 4.3 Document copy/rollback procedure and configure local Supabase target. User waived retained-object migration and will reset data later; no reset or production deployment performed.
