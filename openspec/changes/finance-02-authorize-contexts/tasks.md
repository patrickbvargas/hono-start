## 1. Implementation

- [ ] 1.1 Review provider limits for Member/Admin and exact custom-permission catalog; record verified official evidence when configuring Clerk, with no permanent third-role dependency.
- [ ] 1.2 Add explicit key schema and resource policies for receivables, receipts, payables, payments, adjustments, settings, reports and cash; default Member receipt creation OFF.
- [ ] 1.3 Enforce Member assigned-contract scope and own beneficiary restriction before serialization, aggregation, filtering, export, options, per-settlement proof and audit.
- [ ] 1.4 Prepare dev-only provider configuration/binding checklist; do not mutate production or auto-grant legacy fee creation to Members.
- [ ] 1.5 Cover every grant independently and test misconfigured Member broad grants cannot expose another collaborator; document trusted provider-derived confidentiality guard if needed.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Additional implementation gate

- [ ] Enforce separate registration navigation and server projections: deny Member supplier/collaborator management routes/APIs/options/counts/exports; preserve assigned-customer scope and strip professional/percentage/access fields from customer payloads. Verify explicit Admin action grants and resolve supplier permission catalog keys before enabling the screens.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.
