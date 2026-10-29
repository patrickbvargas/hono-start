## Context

Phase 01: Unified global people and collaborator identity. Predecessor: `None (preserved baseline)`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Replace duplicate Client/Employee identities with global Person and optional EmployeeProfile while preserving document, contract and evidence ownership.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Define Person/PersonType and EmployeeProfile schemas, cumulative roles and document uniqueness using existing normalization rules; map every current client and employee field.
2. Implement Person/Profile data operations and client/collaborator projections, retaining current UI permissions until phase 02; never expose compensation settings through customer projections.
3. Rewire Contract customer, assignment/profile, Expense counterparty, attachments, actor references and fixtures through an explicit ID map; never reinterpret old IDs.
4. Coordinate Clerk employeeId-to-personId binding with verified membership and profile activation; deny both missing and inactive profiles for all roles.
5. Add field-map and owner-scope tests, same-person multiple-role fixtures, normalized duplicate rejection and organization-switch regression coverage.

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
