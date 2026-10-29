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
| 06 | [finance-06-payments](../../openspec/changes/finance-06-payments/proposal.md) — Payable settlement and grouped cash outflow | finance-05-receipts |
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

Create a Person with multiple roles; configure Member/Admin; create Contract with two revenues, one still ungenerated; attach contract/expense files; generate entry and monthly titles with explicit dates and rounded final cents; confirm justified difference; reject duplicate confirmation; settle multiple same-Person titles partly with discount/charges; reject mixed-person/future-date/above-due/concurrent invalid batches atomically; inspect generated own-only remuneration; pay partially; block source receipt reversal; reverse payment then receipt and inspect dated cash; adjust settled title and analytic with history; create direct titles; verify Member cannot infer other beneficiaries through reports/evidence; confirm cancelled operational origins retain payable/receivable balances.

## Known external verification

Clerk production role/custom-permission limits must be checked against current official account/product information during phase 02. Member/Admin is intended role design, not an assertion of a verified free-plan limit. No live provider settings or database state were changed by this plan.

## Decision and test references

- [51 approved decisions](../domain/FINANCIAL_DECISIONS.md)
- [Acceptance matrix and evidence template](FINANCIAL_TEST_MATRIX.md)
