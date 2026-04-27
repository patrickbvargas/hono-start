## 1. Contract And Remuneration Coverage

- [x] 1.1 Add direct contract mutation tests for create, update, delete, and restore business rules
- [x] 1.2 Add direct contract query tests for tenant scope, aggregate mapping, and derived revenue payment state
- [x] 1.3 Add direct remuneration query tests for role-aware visibility, export scope, and selectable options
- [x] 1.4 Add direct remuneration mutation tests for manual override, delete, restore, and parent-fee guards

## 2. Dashboard, Employee, And Audit Coverage

- [x] 2.1 Add dashboard data-boundary tests for summary totals, comparison windows, grouped revenue totals, and recent activity ordering
- [x] 2.2 Add employee query tests for filters, deterministic sorting, and active contract counts
- [x] 2.3 Add audit-log query tests for tenant scope, filter translation, pagination ordering, and distinct option builders

## 3. Verification

- [x] 3.1 Run targeted Vitest suites for the new coverage areas and fix failures
- [x] 3.2 Run `pnpm check`
- [x] 3.3 Run `npx tsc --noEmit`
