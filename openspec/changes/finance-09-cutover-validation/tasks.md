## 1. Implementation

- [ ] 1.1 Inventory every legacy Client/Employee/Fee/Remuneration reference in schema, session, route/search, attachments, audit, export, query keys, tests and docs; resolve each explicitly.
- [ ] 1.2 Prepare coordinated disposable-dev schema recreation and target seed only after confirming intended connection; no production reset or live provider mutation.
- [ ] 1.3 Replace old fee/remuneration/expense semantics in canonical OpenSpec specs and domain docs, including schedule uniqueness and automatic receipt/entry cash assumptions.
- [ ] 1.4 Verify Member/Admin provider setup, Person bindings, exact permissions and all negative access paths; record provider-limit decision without guessing.
- [ ] 1.5 Run full pnpm verify plus isolated real PostgreSQL concurrency/reversal/generation checks and private attachment transport checks.
- [ ] 1.6 Perform documented walkthroughs for contract and expense handoff, direct titles, partial/full settlement, receipts across different debtors without lots, ten payments across lawyers totaling5000 in one atomic action without lots or beneficiary groups, per-Payment proof/reversal and Member confidentiality, remuneration and monthly reconciliation.
- [ ] 1.7 Record evidence and remaining blockers; enable target navigation/writes only after preceding gates pass; preserve baseline commit and schema/config rollback recipe.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Additional implementation gate

- [ ] Walk through separate Clientes/Fornecedores/Colaboradores menus with one multi-role Person; verify no identity duplication, authorized collaborator percentage management, Member direct-route/API denial and absence of privileged fields in customer responses/options/exports, while permitted contract-team and own-remuneration views still work.

## Additional acceptance task

- [ ] Verify title/report area, revenue-type and assignment-type filters/grouping, exact remuneration participation, “Sem vínculo com contrato”, non-additive Receivable assignment groups with distinct grand totals and authorized exports/options/drilldowns; exercise Member and cross-Firm negative cases.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## Final reset readiness

- [ ] Inspect and fix db:reset orchestration/migration history and seed invocation as needed for the installed Prisma version; verify seed assertions for catalogs, multi-role people, valid origins, money/balances, remuneration, proofs and current/overdue/future scenarios without future actual cash.
- [ ] Document and verify dev Clerk users/memberships/grants/Firm/Person mappings and Storage prerequisites; ensure configured bindings survive repeated reset without stale IDs, hardcoded secrets or manual database repair.
- [ ] Run two clean `pnpm run db:reset` cycles against the explicitly verified disposable target; after each, log in as Admin/Member and exercise registration, generation, receipts/payments, confidentiality and reports. Record actual evidence and run full pnpm verify. Do not mark complete on seed exit code alone.
