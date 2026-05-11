## 1. Route and navigation

- [x] 1.1 Rename the authenticated audit route to `src/routes/_app/auditoria.tsx` and expose URL `/auditoria`.
- [x] 1.2 Update route references in shared navigation, generated route metadata, tests, and docs that still point to `/audit-log`.

## 2. Audit log presentation

- [x] 2.1 Add an `AuditLogList` card view and wire the route to shared `EntityView` with toggle support.
- [x] 2.2 Keep the audit table aligned with the localized display contract and shared pagination behavior.

## 3. Localization and verification

- [x] 3.1 Localize displayed audit entity labels and descriptions to pt-BR while preserving action codes.
- [x] 3.2 Add or update focused tests for localized audit-log query output and route composition.
- [x] 3.3 Run `pnpm check` and `npx tsc --noEmit`, fix any resulting errors, and then mark the tasks complete.
