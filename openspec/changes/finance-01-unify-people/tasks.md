## 1. Implementation

- [ ] 1.1 Define Person/PersonType and EmployeeProfile schemas, cumulative roles and document uniqueness using existing normalization rules; map every current client and employee field.
- [ ] 1.2 Implement Person/Profile data operations and client/collaborator projections, retaining current UI permissions until phase 02; never expose compensation settings through customer projections.
- [ ] 1.3 Rewire Contract customer, assignment/profile, Expense counterparty, attachments, actor references and fixtures through an explicit ID map; never reinterpret old IDs.
- [ ] 1.4 Coordinate Clerk employeeId-to-personId binding with verified membership and profile activation; deny both missing and inactive profiles for all roles.
- [ ] 1.5 Add field-map and owner-scope tests, same-person multiple-role fixtures, normalized duplicate rejection and organization-switch regression coverage.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.
