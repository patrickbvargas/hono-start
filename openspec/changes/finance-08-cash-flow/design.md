## Context

Phase 08: Monthly cash flow and operational financial projections. Predecessor: `finance-07-remuneration-payables`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Deliver month-by-month expected and realized views that reconcile principal, adjustments, cash and reversals without double counting.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Replace legacy scheduled revenue and expense-date cash queries with authorized title/settlement event projections.
2. Implement monthly remaining-principal forecast, overdue bucket and effective-cash realized streams with signed dated reversal events.
3. Expose negotiated amount, title financial total, post-generation difference, principal abated, cash, discounts/charges and balance with unambiguous labels. Show separate authorized Person receivable/payable balances per Firm, without automatic offset. Do not introduce competence fields/reports; due dates never create automatic settlements.
4. Update origin financial status: all active revenue generations plus valid title balances; do not mutate operational status on settlement/reversal.
5. Update dashboard, pending work, exports, related drawers, individual Receipt/Payment proof and own remuneration views under pre-aggregation scopes.
6. Test partial receipts, full discounts, month-boundary reversals, cancelled origins, ungenerated revenues, out-of-window arrears and Member confidentiality.

Read FINANCIAL_SYSTEM.md for monetary equations, reversal semantics and dates; do not redefine them locally. Read FINANCIAL_AUTHORIZATION.md for exact keys and scope. Read FINANCIAL_UML.md for structural intent; concrete FK names may be refined with an explicit implementation ADR and tests, not business-rule drift.

## Risks / Trade-offs

- Half-transition double counting → keep legacy and target readers explicit and gate target writes/navigation until phase 09. No dual posting of a real event.
- Scope leaks through derived data → apply same owner policy before options/counts/sums/export/evidence and negative-test other beneficiaries and Firms.
- Financial inconsistency → decimal amounts, positive/range constraints, server revalidation and database-backed transaction/concurrency tests where this phase writes money.
- Destructive dev recreation → identify disposable target, preserve baseline commit/config and never infer production reset authority.

## Migration Plan

Schema work: review dependencies; this phase does not authorize an unrelated schema change. Use staged additions or a coordinated dev rebuild; do not leave active baseline routes writing removed tables. Existing fixtures need not be backfilled. Rebuild occurs only at phase 09 or an explicitly isolated verified dev rehearsal, never as part of writing these artifacts. Rollback restores preserved code plus a matching disposable schema/seed and reviewed dev identity config; code checkout alone is insufficient after destructive schema changes.

## Verification and completion gate

Exercise every scenario in this change and its dependent financial invariants. Run focused meaningful Vitest tests, pnpm check, npx tsc --noEmit and required integration checks; update tasks only after actual evidence. Phase 09 runs full pnpm verify, real database transactions and UI/security walkthroughs. Artifact readiness is not implementation completion.

## Open Questions

Only technical layout choices consistent with the approved rules remain. Verify Clerk plan/catalog limits before configuration in phase 02. Stop and record any newly discovered business ambiguity instead of inventing a rule; do not reopen already recorded user decisions.

## Contract analysis dimensions

Implement feature-owned Zod/query/URL contracts and shared-UI filters/grouping for LegalArea, RevenueType and AssignmentType alongside FinancialAnalytic in title lists and reports. Resolve Receivable via Revenue/Contract and remuneration Payable via its exact calculation/assignment and source receipt. Include “Sem vínculo com contrato” for Expense/direct origins. Use authorized existence predicates/deduplicated title/event identities; preserve stable server pagination and consistent counts/exports/options. AssignmentType grouping for Receivables is explicitly overlapping/non-additive, with distinct grand total; no rateio or extra contract-specific title columns.

Test multiple same-type assignments, multi-type filters, exact remuneration participation, unrelated origins, combined OR/AND filters, partial/reversed cash, no duplicate grand totals and negative Member/cross-Firm options/export/drilldown cases. Preserve immutable monetary calculation snapshots; dimensions resolve existing origin lookups.

## Seed continuity

Seed compatibility is a completion gate in every phase. Follow the incremental seeds and final reset contract in docs/implementation/FINANCIAL_ROADMAP.md: update fixture generators/assertions with schema/workflow changes, preserve valid dev identity bindings and real monetary/origin invariants, and record reproducible validation. Final clean migration/generate/seed and app-use checks belong to phase09; this design does not run reset or change external providers.
