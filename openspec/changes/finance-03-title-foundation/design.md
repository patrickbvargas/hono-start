## Context

Phase 03: Financial title persistence and global catalogs. Predecessor: `finance-02-authorize-contexts`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Create concise receivable/payable primitives and integrity-enforced origins, separating expected obligations from future cash events.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Design and review Prisma schema for Receivable, Payable, origin/generation/direct-entry relationships, catalogs and Firm cutoff/due-day settings.
2. Define Person counterparty, one analytic, expected method, title kind, face amount, due date, cancellation, reason and timestamps; keep remuneration calculation columns out of Payable.
3. Introduce constrained global PaymentMethod/TitleKind and evolve ExpenseCategory into FinancialAnalytic preserving stable existing values; no Firm FK on catalogs.
4. Enforce exactly one origin and same-Firm relationships at database/service boundaries; use concrete validated FKs rather than unchecked polymorphic IDs.
5. Create reviewed development schema migrations and deterministic fixtures; add parallel target structures without enabling old dashboards to count both systems.
6. Test cancellation, settled-title adjustment floor, analytic correction, counterparty requirements and direct-origin denial for Members.

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
