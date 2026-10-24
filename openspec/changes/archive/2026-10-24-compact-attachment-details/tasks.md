## 1. Presentation

- [x] 1.1 Implement compact header, file rows, secondary delete menu and matching states; no DB migration required.
- [x] 1.2 Update four drawer compositions and frontend contract.

## 2. Verification

- [x] 2.1 Update focused UI coverage for upload, download, permissions, deletion and states.
- [x] 2.2 Run formatting, TypeScript, focused tests and browser layout checks.


Verification: pnpm check and npx tsc --noEmit passed. Eight focused test files passed (42 tests); the final section suite passed again with 8 tests after adding unavailable-download coverage. OpenSpec strict validation passed. Browser inspection confirmed compact desktop rows, secondary menu, and upload modal fitting a 390x600 viewport. No attachment was uploaded or deleted during verification.

## 3. Bulk upload and capacity

- [x] 3.1 Support multiple selection, drag and drop, per-file removal and available-capacity messaging.
- [x] 3.2 Implement a single validated batch request and transactional metadata/audit persistence with staged binary cleanup.
- [x] 3.3 Enforce 25 non-deleted attachments per owner with transaction advisory locking and update canonical docs.
- [x] 3.4 Verify batch boundaries, whole-batch failures, cleanup and owner limits with focused tests and type/format checks.

Final verification: pnpm check and npx tsc --noEmit passed. Ten focused test files passed, totaling 60 tests. PostgreSQL advisory lock execution was verified in a transaction without changing data. Browser inspection confirmed the modal reports 23 remaining slots for a record with two attachments.
