## 1. Spec Alignment

- [x] 1.1 Add delta spec updates for `contract-management` covering assignment-role-aware contract visibility.
- [x] 1.2 Add delta spec updates for `session-authorization` covering assignment-summary-based authorization inputs.
- [x] 1.3 Add delta spec updates for `remuneration-management` preserving own-remuneration visibility independent from contract visibility.

## 2. Shared Authorization

- [x] 2.1 Extend shared session authorization resource shapes to carry active assignment summaries instead of only assigned employee ids where contract visibility is evaluated.
- [x] 2.2 Update `contract.view` and contract-derived access decisions so `RECOMMENDING` does not grant regular-user contract visibility.
- [x] 2.3 Preserve access for regular lawyers on `RESPONSIBLE` and `RECOMMENDED` assignments and for regular admin assistants on `ADMIN_ASSISTANT` assignments.

## 3. Contract Data Boundaries

- [x] 3.1 Update contract list queries to exclude `RECOMMENDING`-only regular-user contracts at the Prisma/data boundary.
- [x] 3.2 Update contract detail access resources and detail queries to enforce the same refined visibility rule.
- [x] 3.3 Apply the same refined visibility rule to fee (`honorário`) data boundaries tied to the contract.

## 4. Verification

- [x] 4.1 Add or update authorization tests for assignment-role-aware contract access.
- [x] 4.2 Add or update contract query/detail tests for refined regular-user visibility.
- [x] 4.3 Add or update remuneration visibility tests proving own remunerations remain visible without contract visibility.
- [x] 4.4 Run repository verification commands required by the workflow.
