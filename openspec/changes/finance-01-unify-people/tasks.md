## 1. Implementation

- [x] 1.1 Define Person/PersonType and EmployeeProfile schemas, cumulative roles and document uniqueness using existing normalization rules; map every current client and employee field.
- [x] 1.2 Implement Person/Profile operations and one Pessoas route/sidebar entry with role checkboxes and permission-scoped role filters over the same Person, as revised in docs/domain/PERSON_REGISTRATION.md. Collaborator management owns professional fields/percentages/access; customer projections exclude privileged profile, role and access data. Keep target surfaces gated until phase02 permissions are enforced.
- [ ] 1.3 Rewire Contract customer, assignment/profile, Expense counterparty, attachments, actor references and fixtures through an explicit ID map; never reinterpret old IDs.
- [x] 1.4 Coordinate Clerk employeeId-to-personId binding with verified membership and profile activation; deny both missing and inactive profiles for all roles.
- [ ] 1.5 Add field-map and owner-scope tests, same-person multiple-role fixtures, normalized duplicate rejection and organization-switch regression coverage.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## Person revision gate — 2026-10-30

- [ ] Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

## Role-profile FK gate

- [ ] Implement/verify the approved ClientProfile/SupplierProfile/EmployeeProfile 1:1 extensions now, derive role checkboxes from active profiles, atomically enforce employee→supplier for the same Person. Explicitly map Contract/Receivable to ClientProfile and Expense/Payable to SupplierProfile. Keep Clerk actor identity as Person, assignment as EmployeeProfile, and resolve beneficiary Person via SupplierProfile in own-scope/calculation checks. Update migrations, seeds (including documentless generic role profiles), FK/lifecycle/ID-mismatch tests and API projections; no duplicate personal fields or independent role-flag truth. Prisma/seed validation precedes Clerk policy work. No bank/address/family implementation now; reference docs/domain/PERSON_REGISTRATION.md.

## Evidência incremental

Ver docs/implementation/PERSON_IMPLEMENTATION.md. CRUD e banco implementados; demais gates permanecem abertos por cobertura integral e migração de consumidores legados/typecheck global. Não declarar a proposta inteira concluída.
