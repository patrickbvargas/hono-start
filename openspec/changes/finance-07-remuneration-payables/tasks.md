## 1. Implementation

- [ ] 1.1 Preserve current participation/percentage eligibility formulas; apply them to effective receipt cash including interest/penalty after discount and snapshot inputs.
- [ ] 1.2 Create one Payable per receipt/eligible participation with unique generation constraint and one calculation record; link titles to beneficiaries and original contract.
- [ ] 1.3 Resolve existing global payroll analytics by employee type; compute due date from receipt effective date and Firm cutoff/due settings with immutable date snapshot.
- [ ] 1.4 Integrate payable/calculation/audit creation atomically with phase 05 confirmation; do not enable receipts if downstream obligation generation is incomplete.
- [ ] 1.5 Implement own-only remuneration queries/exports/evidence and guarded manual Payable adjustments without rewriting original calculation.
- [ ] 1.6 Implement atomic unpaid cancellation on receipt reversal and block on ANY valid related payment, including zero-cash settlement.
- [ ] 1.7 Test positive/zero cash, generation disabled, non-contract origins, cutoff boundary, retroactive receipt, changed settings, multiple participants and Member inference.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## Role-profile FK gate

- [ ] Implement/verify the approved ClientProfile/SupplierProfile/EmployeeProfile 1:1 extensions now, derive role checkboxes from active profiles, atomically enforce employee→supplier for the same Person. Explicitly map Contract/Receivable to ClientProfile and Expense/Payable to SupplierProfile. Keep Clerk actor identity as Person, assignment as EmployeeProfile, and resolve beneficiary Person via SupplierProfile in own-scope/calculation checks. Update migrations, seeds (including documentless generic role profiles), FK/lifecycle/ID-mismatch tests and API projections; no duplicate personal fields or independent role-flag truth. Prisma/seed validation precedes Clerk policy work. No bank/address/family implementation now; reference docs/domain/PERSON_REGISTRATION.md.
