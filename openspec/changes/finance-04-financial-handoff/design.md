## Context

Phase 04: Operational financial generation and editable schedule. Predecessor: `finance-03-title-foundation`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Replace implicit revenue schedules and immediate-expense cash with explicit acerto financeiro for Contract Revenue and Expense.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Preserve Contract/Expense notes and attachments; add separately stored negotiated amount and generated-title financial projections.
2. Build TanStack Form acerto preview with inherited amount, optional entry/date, installment count, explicit first due date, method and analytic defaults.
3. Implement decimal allocation, final-cent remainder, original-day monthly scheduling, row edits/add/remove and exact cent-level equality between agreed total and preview sum (including entry), enforced on client and transactionally on server; justification cannot bypass a mismatch.
4. Confirm generation once per origin atomically with idempotency token/unique boundary; repeat requests return prior result rather than duplicate obligations.
5. Expose generation and post-generation adjustments under distinct action grants; keep origin cancellation/status separate from title cancellation.
6. Test Jan 31 boundaries, entry-only preview, rejection of both shortfall and excess (even with a reason), exact equality including entry, stale agreed amount at confirmation, permitted post-generation adjustments, duplicate submissions, access denial and shared-contract evidence.

Read FINANCIAL_SYSTEM.md for monetary equations, reversal semantics and dates; do not redefine them locally. Read FINANCIAL_AUTHORIZATION.md for exact keys and scope. Read FINANCIAL_UML.md for structural intent; concrete FK names may be refined with an explicit implementation ADR and tests, not business-rule drift.

## Risks / Trade-offs

- Half-transition double counting → keep legacy and target readers explicit and gate target writes/navigation until phase 09. No dual posting of a real event.
- Scope leaks through derived data → apply same owner policy before options/counts/sums/export/evidence and negative-test other beneficiaries and Firms.
- Financial inconsistency → decimal amounts, positive/range constraints, server revalidation and database-backed transaction/concurrency tests where this phase writes money.
- Destructive dev recreation → identify disposable target, preserve baseline commit/config and never infer production reset authority.

## Migration Plan

Schema work: required (review model changes and generated client). Use staged additions or a coordinated dev rebuild; do not leave active baseline routes writing removed tables. Existing fixtures need not be backfilled. Rebuild occurs only at phase 09 or an explicitly isolated verified dev rehearsal, never as part of writing these artifacts. Rollback restores preserved code plus a matching disposable schema/seed and reviewed dev identity config; code checkout alone is insufficient after destructive schema changes.

## Verification and completion gate

Exercise every scenario in this change and its dependent financial invariants. Run focused meaningful Vitest tests, pnpm check, npx tsc --noEmit and required integration checks; update tasks only after actual evidence. Phase 09 runs full pnpm verify, real database transactions and UI/security walkthroughs. Artifact readiness is not implementation completion.

## Open Questions

Only technical layout choices consistent with the approved rules remain. Verify Clerk plan/catalog limits before configuration in phase 02. Stop and record any newly discovered business ambiguity instead of inventing a rule; do not reopen already recorded user decisions.

## Seed continuity

Seed compatibility is a completion gate in every phase. Follow the incremental seeds and final reset contract in docs/implementation/FINANCIAL_ROADMAP.md: update fixture generators/assertions with schema/workflow changes, preserve valid dev identity bindings and real monetary/origin invariants, and record reproducible validation. Final clean migration/generate/seed and app-use checks belong to phase09; this design does not run reset or change external providers.

## Person revision — 2026-10-30

Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.
