## 1. Presentation

- [x] 1.1 Implement compact header, file rows, secondary delete menu and matching states; no DB migration required.
- [x] 1.2 Update four drawer compositions and frontend contract.

## 2. Verification

- [x] 2.1 Update focused UI coverage for upload, download, permissions, deletion and states.
- [x] 2.2 Run formatting, TypeScript, focused tests and browser layout checks.


Verification: pnpm check and npx tsc --noEmit passed. Eight focused test files passed (42 tests); the final section suite passed again with 8 tests after adding unavailable-download coverage. OpenSpec strict validation passed. Browser inspection confirmed compact desktop rows, secondary menu, and upload modal fitting a 390x600 viewport. No attachment was uploaded or deleted during verification.
