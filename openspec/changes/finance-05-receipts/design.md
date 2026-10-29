## Context

Phase 05: Receipts, partial settlement and atomic multi-selection. Predecessor: `finance-04-financial-handoff`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Replace Fee installment slots with immutable receipts abating real titles; add atomic multi-selection, adjustments and reversals without receipt lots.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Create independent Receipt and unique reversal events with per-event effective date, actual PaymentMethod, generate-remuneration choice, principal, discount, interest, penalty, cash and optional proof. No ReceiptBatch/lot or person grouping.
2. Build checkbox allocation UI with full-balance defaults, manual adjustment fields and explicit cash versus principal totals; future titles remain selectable.
3. Implement cross-Person/origin title multi-selection within one Firm/direction, one common date/actual method copied to each Receipt, all-or-nothing server locking, duplicate-title rejection, idempotency, per-title scope validation and downstream generation inside the transaction.
4. Reject future effective dates and above-due allocations; permit reasoned full discounts with zero cash and no remuneration.
5. Implement individual/selected-event atomic reversal with dated immutable events; remove target dependence on Fee uniqueness, sequential installment and exhausted-count rules.
6. Keep target receipt writes disabled in released navigation until phase 07 atomic remuneration integration and phase 09 acceptance pass.
7. Test concurrent double settlement, inaccessible selected title, zero cash, per-Receipt proof ownership, mixed contract/direct eligibility, actual payment method, and reversal/report reconciliation.

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
