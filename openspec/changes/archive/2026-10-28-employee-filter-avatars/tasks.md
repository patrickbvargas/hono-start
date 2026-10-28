## 1. Server and data contract

- [x] 1.1 Add validated, cached server-only Clerk avatar enrichment without database migrations.
- [x] 1.2 Enrich authorized collaborator option handlers and allow query refresh.

## 2. Filter presentation

- [x] 2.1 Reuse shared avatars for collaborator options and selected values in all four filters.
- [x] 2.2 Document photo ownership, fallback and refresh behavior.

## 3. Verification

- [x] 3.1 Cover binding validation, pagination, cache, provider failures and avatar fallback with focused tests.
- [x] 3.2 Run pnpm check, npx tsc --noEmit, relevant tests and production build; review final diff.

## Verification results

- `pnpm check`, `pnpm check:ci`, `npx tsc --noEmit`, `pnpm build`, `git diff --check` and strict OpenSpec validation passed.
- All 21 focused tests passed with host filesystem permissions: 9 avatar tests and 12 attachment storage tests. All 4 PDF preview tests passed separately.
- The broader suite was not completed. Its restricted run encountered one intermittent PDF preview failure and three hard-link storage failures; those files passed in the isolated reruns above. No unrelated attachment code was changed.
