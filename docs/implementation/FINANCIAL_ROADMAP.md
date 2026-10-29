# Financial redesign implementation roadmap

Status: planning only, 2026-10-29. Branch `codex/financial-titles-redesign`. Existing working state preserved at `36a4fc8b5cbec3faa4e63006e8229cefb9ccb0d9`; main remains `4c5716bdb7ab81e875ed6a85303d8a2b5c0f2ad1`. No implementation/reset/provider changes are part of this documentation task.

## Required reading

Read docs/index.md, the existing architecture contract, [approved financial rules](../domain/FINANCIAL_SYSTEM.md), [UML](../domain/FINANCIAL_UML.md), [Clerk policy](../domain/FINANCIAL_AUTHORIZATION.md), then the selected change proposal/design/spec/tasks and its completed prerequisites. Do not rely on chat memory.

## Ordered changes

| Order | Change | Dependency |
|---|---|---|
| 01 | [finance-01-unify-people](../../openspec/changes/finance-01-unify-people/proposal.md) — Unified global people and collaborator identity | None (preserved baseline) |
| 02 | [finance-02-authorize-contexts](../../openspec/changes/finance-02-authorize-contexts/proposal.md) — Granular operational and financial authorization | finance-01-unify-people |
| 03 | [finance-03-title-foundation](../../openspec/changes/finance-03-title-foundation/proposal.md) — Financial title persistence and global catalogs | finance-02-authorize-contexts |
| 04 | [finance-04-financial-handoff](../../openspec/changes/finance-04-financial-handoff/proposal.md) — Operational financial generation and editable schedule | finance-03-title-foundation |
| 05 | [finance-05-receipts](../../openspec/changes/finance-05-receipts/proposal.md) — Receipts, partial settlement and grouped reversal | finance-04-financial-handoff |
| 06 | [finance-06-payments](../../openspec/changes/finance-06-payments/proposal.md) — Atomic multi-selection payments without payment lots | finance-05-receipts |
| 07 | [finance-07-remuneration-payables](../../openspec/changes/finance-07-remuneration-payables/proposal.md) — Receipt-driven remuneration obligations | finance-06-payments |
| 08 | [finance-08-cash-flow](../../openspec/changes/finance-08-cash-flow/proposal.md) — Monthly cash flow and operational financial projections | finance-07-remuneration-payables |
| 09 | [finance-09-cutover-validation](../../openspec/changes/finance-09-cutover-validation/proposal.md) — Development cutover, legacy retirement and release evidence | finance-08-cash-flow |

## Safety and release gates

- All nine changes are planning artifacts with unchecked implementation tasks. Do not implement them in parallel against shared persistence boundaries. No application code changes in this documentation pass.
- Phase order is authoritative. OpenSpec does not enforce cross-change prerequisites; verify them manually before apply. Individual artifact readiness is not permission to release an incomplete financial system.
- Keep baseline behavior working until coordinated cutover; stage additions or use a clearly gated isolated target path. No production release of partial settlement without atomic commission generation.
- Disposable development data can be recreated; do not invent historical entry payments or maintain unnecessary permanent legacy adapters. Never run reset against an unverified or production connection.
- Runtime enablement requires full pnpm verify and real PostgreSQL locking/idempotency/rollback coverage; mocked unit tests alone are insufficient. Include private evidence owner checks and UI walkthroughs.
- Restore code from baseline commit only together with its compatible development schema/seed and provider binding/catalog checklist. No production rollback guarantee is claimed.

## Legacy contract reconciliation

Existing fee-management, remuneration-management and expense-management main specs describe the baseline. Phase 09 must retire/replace fee and remuneration obligations with financial-receipts/financial-payments/financial-remuneration, update Expense to operational origin, and reconcile dashboard, contract completion, identity, audit and attachment specs. Preserve unrelated list/filter/UI rules. The completed revenue-installments-accordion change remains baseline history; its derived schedule and sequence assumptions are superseded by actual titles. Do not archive any finance change as implemented merely because artifacts exist.

## Required acceptance walkthrough

Create a Person with multiple roles; configure Member/Admin; create Contract with two revenues, one still ungenerated; attach contract/expense files; generate entry and monthly titles with explicit dates and rounded final cents; reject preview shortfall/excess even with justification; confirm exact agreed total including entry; permit later authorized adjustments with audit; reject duplicate confirmation; settle multiple same-Person titles partly with discount/charges; reject mixed-person receipt batches; pay ten titles across lawyers totaling5000 in one action without a payment lot; reject cross-Firm/denied/stale/future-date/above-due/concurrent invalid selections atomically; inspect generated own-only remuneration; pay partially; block source receipt reversal; reverse payment then receipt and inspect dated cash; adjust settled title and analytic with history; create direct titles; verify Member cannot infer other beneficiaries through reports/evidence; confirm cancelled operational origins retain payable/receivable balances.

## Known external verification

Clerk production role/custom-permission limits must be checked against current official account/product information during phase 02. Member/Admin is intended role design, not an assertion of a verified free-plan limit. No live provider settings or database state were changed by this plan.

## Decision and test references

- [51 approved decisions](../domain/FINANCIAL_DECISIONS.md)
- [Acceptance matrix and evidence template](FINANCIAL_TEST_MATRIX.md)

## Registration navigation gate

Phases01/02/09 must preserve separate Clientes, Fornecedores and Colaboradores screens/sidebar entries over shared Person, with contextual fields and explicit action permissions. Member is denied supplier/collaborator management, including direct API access and derived data; shared customer identity never exposes professional percentages or access bindings. See the canonical financial rules and contextual registration acceptance matrix.

## Contract dimensions gate

Phase08 delivers LegalArea/RevenueType/AssignmentType filters and grouping in financial title lists/reports alongside analytics. Validate exact remuneration assignment, non-contract origins, deduplicated grand totals and visibly overlapping Receivable assignment-type groups. Phase09 walkthrough must verify these dimensions, exports and Member/cross-Firm denial.

## Incremental seeds and final reset contract — approved 2026-10-29

Every phase SHALL update the seed/fixtures and their assertions alongside its schema, lookup, permission, identity and workflow changes; do not postpone broken seed repair to phase09. Maintain prisma/seed.ts, seed-fixtures.ts, seed-scenarios.ts and seed-evidence.ts (or their approved replacements) against that phase's schema. Changes without new fixture needs still verify compatibility and record evidence. Do not fabricate settlements or bypass domain invariants just to populate reports. Keep the existing UI style/components and change only navigation, fields/actions required by the target.

Final acceptance command is `pnpm run db:reset`. The existing script runs `prisma migrate reset --force && prisma generate && prisma db seed`; phase09 must verify the actual installed-version behavior, migration chain, generated client and effective seed invocation, correcting orchestration if needed. A schema that works only through db push or manual SQL does not satisfy this gate. Run against the explicitly verified disposable development target only, record actual results, and never claim a reset was tested from mocked tests.

After successful reset, the database SHALL be ready for app use without manual SQL/data repair: global catalogs and existing payroll analytics; Firms; multi-role Persons/active EmployeeProfiles; Contract/Revenue/Expense with notes and valid attachment owners; matched acertos including entries; receivable/payable/direct titles; pending/overdue/partial/settled cases; partial/multiple receipts with adjustments; generated remuneration and calculations; ten lawyer Payables totaling5000 for multi-selection payment; payments/reversals and current/future cash-flow scenarios. Include multiple assignment types, areas and revenue types, non-contract origins, two Firms and beneficiaries for authorization tests. Derive dates from a consistent business reference so overdue/current/future cases remain useful over time; never create future realized cash. No legacy Fee/Remuneration writes after cutover, duplicate master documents, orphaned calculations or inflated assignment totals.

Readiness includes sign-in to the configured development Clerk app with valid Admin/Member memberships, Firm mapping, Person binding and active EmployeeProfile. Clerk users/organizations/grants and private Storage bucket are external prerequisites: reset must preserve/reconcile configured development bindings deterministically, not assume deleted database IDs remain valid. Provide documented, repeatable bootstrap/configuration and an actionable preflight for missing prerequisites; never silently succeed with an unusable login or secretly mutate production/provider roles. Seed must not hardcode obsolete Clerk/Supabase IDs or secrets. Verify real private attachment fixtures when configured, with no dangling storage references. After initial documented external setup, repeated resets must leave usable bindings and fixture data without hand-editing records. Re-running standalone db:seed must follow a documented deterministic/idempotent strategy, not duplicate monetary events.

Phase09 completion requires two successful clean reset/use cycles in the verified disposable environment, actual Admin/Member login, navigable separate registration screens, contract/expense generation and financial settlement walkthroughs, seed assertions and full pnpm verify. Record prerequisites, safe invocation, target identity (without secrets), commands, outputs and remaining blockers. Writing this requirement does not execute a reset now.
