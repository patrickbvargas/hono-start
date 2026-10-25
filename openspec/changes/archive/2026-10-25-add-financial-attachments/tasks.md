## 1. Persistence and domain

- [x] 1.1 Extend Prisma with financial owners and add migration for foreign keys, indexes and exactly-one-owner check; regenerate client.
- [x] 1.2 Update canonical domain and attachment implementation documentation.

## 2. Attachment flows

- [x] 2.1 Extend owner schemas, storage paths, query keys, binding and financial resource queries.
- [x] 2.2 Enforce financial subject visibility for listing, downloading, uploading and deleting; enforce upload lifecycle.

## 3. Financial interfaces

- [x] 3.1 Add Anexos tabs to receipt and remuneration pages and validated search state.
- [x] 3.2 Add compact shared attachment sections and skeletons to both contextual detail drawers.

## 4. Verification

- [x] 4.1 Cover new owner validation, isolation, permission/lifecycle checks, capacity and financial UI integration with focused tests.
- [x] 4.2 Run OpenSpec validation, pnpm check, npx tsc --noEmit and relevant/full tests; inspect final diff. See validation.md for Windows filesystem limitations in the broad suite.
