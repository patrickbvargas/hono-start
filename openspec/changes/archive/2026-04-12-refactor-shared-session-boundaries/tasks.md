## 1. Shared session boundaries

- [x] 1.1 Split `src/shared/session` into focused modules for model, mock session factory, selectors, policy, scope, client store, and server session access
- [x] 1.2 Update `src/shared/session/index.ts` to preserve the supported public API through a compatibility barrel
- [x] 1.3 Move permission and scope helpers into pure shared utilities that accept the logged-user actor explicitly and remain safe for server-side use

## 2. Employee-management integration

- [x] 2.1 Update the employees route to use shared session authorization helpers for admin-only action visibility
- [x] 2.2 Update employee list and mutation server functions to derive `firmId` from the shared server session helper instead of hardcoded placeholders
- [x] 2.3 Enforce shared authorization checks in employee create, update, delete, and restore server functions so server-side access remains authoritative

## 3. Validation

- [x] 3.1 Confirm no database migration is required for this refactor-only change
- [x] 3.2 Run `pnpm check` and fix all formatting, lint, and import issues
- [x] 3.3 Run `npx tsc --noEmit` and fix all TypeScript errors before marking the change complete
