## 1. Baseline Coverage

- [x] 1.1 Add shared session authorization tests that pin current admin allow behavior and cross-firm denial.
- [x] 1.2 Add regular-user tests for authenticated shared actions, administrator-only denials, own-employee update, assigned contract and fee access, own remuneration access, attachment deletion denial, audit-log denial, and read-only contract mutation denial.

## 2. Policy Refactor

- [x] 2.1 Replace the long non-admin action switch in `src/shared/session/policy.ts` with named action categories and small resource predicate helpers.
- [x] 2.2 Keep `can(session, action, resource)` and `assertCan(session, action, resource)` behavior unchanged, including pt-BR denial messages.
- [x] 2.3 Remove unused feature-specific `can...` wrapper exports where consumers can call the canonical action API directly.
- [x] 2.4 Update all affected imports and call sites to use `can` or `assertCan` with explicit `SessionAction` values.

## 3. Verification

- [x] 3.1 Confirm no database migration is required.
- [x] 3.2 Run targeted session authorization tests and fix failures.
- [x] 3.3 Run `pnpm check` and fix all lint or format issues.
- [x] 3.4 Run `npx tsc --noEmit` and fix all type errors.
