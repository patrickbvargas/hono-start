## 1. OpenSpec And Shared Session Structure

- [x] 1.1 Replace the redundant shared-session barrel layout with one explicit public barrel and dedicated responsibility-focused modules.
- [x] 1.2 Move session actor types, permission catalogs, access rules, middleware, query helpers, and provider helpers into their new shared-session modules without changing runtime behavior.

## 2. Authorization Contract Refactor

- [x] 2.1 Replace the manually maintained permission union with canonical entity and action catalogs plus a template-literal permission type.
- [x] 2.2 Consolidate authorization rule grouping and denial messages into one permission policy catalog while preserving existing role, tenant, assignment, and writability behavior.

## 3. Consumer Migration And Verification

- [x] 3.1 Update shared-session consumers and tests to the clarified module surface and remove obsolete imports/files.
- [x] 3.2 Run focused shared-session verification plus `pnpm check` and `npx tsc --noEmit`, fixing every issue before completion. No DB migration required.
