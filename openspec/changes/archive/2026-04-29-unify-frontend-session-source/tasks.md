## 1. Shared frontend session source

- [x] 1.1 Refactor `src/shared/session` so one shared TanStack Query session path is the only frontend source of truth for the authenticated actor while preserving the shared `LoggedUserSession` contract and selectors
- [x] 1.2 Add explicit refresh and clearing paths for the shared session query during auth transitions
- [x] 1.3 Update shared session hooks and exports so protected frontend consumers stop reading divergent optional and required query caches directly

## 2. Authentication and protected-route synchronization

- [x] 2.1 Update login flow to refresh the shared session query and only then navigate into the authenticated shell
- [x] 2.2 Update logout and required-session failure handling to clear the shared session query before redirecting to `/login`
- [x] 2.3 Refactor authenticated admin-route gating so protected routes such as collaborators and audit log resolve from the shared authenticated-session path instead of an optional browser-session cache

## 3. Validation

- [x] 3.1 Add or update focused tests covering frontend session synchronization, protected admin-route access after login, and logout/session-expiry clearing behavior
- [x] 3.2 Confirm no database migration is required for this browser-session-source consolidation
- [x] 3.3 Run `pnpm check` and fix all formatting, lint, and import issues
- [x] 3.4 Run `npx tsc --noEmit` and fix all TypeScript errors before marking the change complete
