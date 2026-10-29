## Context

Phase 09: Development cutover, legacy retirement and release evidence. Predecessor: `finance-08-cash-flow`. Baseline has separate Client/Employee, Fee installment slots, implicit entry cash and immediate Expense outflows. The approved target intentionally replaces those semantics; this is not a backward-compatible patch. Only development fixtures exist.

## Goals / Non-Goals

**Goals:** Finish the branch as one coherent system, replacing obsolete fee/expense/remuneration contracts and validating all dependent flows before release.

**Non-goals:** unrelated architectural abstraction, production historical conversion, provider mutation during planning, and implementation of later phases before their gates.

## Decisions

Use the fixed TanStack Start/Router/Query/Form/Table, Zod, Prisma/PostgreSQL, shared shadcn UI, Clerk and private-storage house contract. Feature schemas validate server inputs/outputs, hooks own orchestration, routes compose only. Preserve small existing public-barrel boundaries; introduce no generic finance engine solely for symmetry. Retrieve current official library docs with Context7 before implementing library APIs.

Implementation boundaries:

1. Inventory every legacy Client/Employee/Fee/Remuneration reference in schema, session, route/search, attachments, audit, export, query keys, tests and docs; resolve each explicitly.
2. Prepare coordinated disposable-dev schema recreation and target seed only after confirming intended connection; no production reset or live provider mutation.
3. Replace old fee/remuneration/expense semantics in canonical OpenSpec specs and domain docs, including schedule uniqueness and automatic receipt/entry cash assumptions.
4. Verify Member/Admin provider setup, Person bindings, exact permissions and all negative access paths; record provider-limit decision without guessing.
5. Run full pnpm verify plus isolated real PostgreSQL concurrency/reversal/generation checks and private attachment transport checks.
6. Perform documented walkthroughs for contract and expense handoff, direct titles, partial/full settlement, same-debtor receipt grouping, ten payments across lawyers totaling5000 in one atomic action without lots or beneficiary groups, per-Payment proof/reversal and Member confidentiality, remuneration and monthly reconciliation.
7. Record evidence and remaining blockers; enable target navigation/writes only after preceding gates pass; preserve baseline commit and schema/config rollback recipe.

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

## Registration UI acceptance

Walk through separate Clientes/Fornecedores/Colaboradores menus with one multi-role Person; verify no identity duplication, authorized collaborator percentage management, Member direct-route/API denial and absence of privileged fields in customer responses/options/exports, while permitted contract-team and own-remuneration views still work.

## Contract dimension walkthrough

Verify title/report area, revenue-type and assignment-type filters/grouping, exact remuneration participation, “Sem vínculo com contrato”, non-additive Receivable assignment groups with distinct grand totals and authorized exports/options/drilldowns; exercise Member and cross-Firm negative cases.

## Seed continuity

Seed compatibility is a completion gate in every phase. Follow the incremental seeds and final reset contract in docs/implementation/FINANCIAL_ROADMAP.md: update fixture generators/assertions with schema/workflow changes, preserve valid dev identity bindings and real monetary/origin invariants, and record reproducible validation. Final clean migration/generate/seed and app-use checks belong to phase09; this design does not run reset or change external providers.
