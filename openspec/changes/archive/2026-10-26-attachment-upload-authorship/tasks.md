## 1. Implementation

- [x] 1.1 Add validated sender attribution from tenant-scoped CREATE audit events; no migration required.
- [x] 1.2 Improve upload copy and display sender with unknown fallback.
- [x] 1.3 Update canonical attachment behavior documentation.

## 2. Verification

- [x] 2.1 Cover attribution, missing authors and shared rendering with focused tests.
- [x] 2.2 Run pnpm check, TypeScript and attachment tests; validate OpenSpec change.

Validation: pnpm check and npx tsc --noEmit passed; attachment suite passed 90 tests across 10 files; strict OpenSpec validation passed.
