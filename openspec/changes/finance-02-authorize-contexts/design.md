## Context

Phase 02: Granular operational and financial authorization. Predecessor: `finance-01-unify-people`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Introduce exact-key financial grants and Member confidentiality before exposing new financial surfaces.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Review provider limits for Member/Admin and exact custom-permission catalog; record verified official evidence when configuring Clerk, with no permanent third-role dependency.
2. Add explicit key schema and resource policies for receivables, receipts, payables, payments, adjustments, settings, reports and cash; default Member receipt creation OFF.
3. Enforce Member assigned-contract scope and own beneficiary restriction before serialization, aggregation, filtering, export, options, batch proof and audit.
4. Prepare dev-only provider configuration/binding checklist; do not mutate production or auto-grant legacy fee creation to Members.
5. Cover every grant independently and test misconfigured Member broad grants cannot expose another collaborator; document trusted provider-derived confidentiality guard if needed.

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
