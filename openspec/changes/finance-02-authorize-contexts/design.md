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
3. Enforce Member assigned-contract scope and own beneficiary restriction before serialization, aggregation, filtering, export, options, per-settlement proof and audit.
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

## Registration UI acceptance

Enforce unified registration navigation with contextual permissions and server projections: deny Member supplier/collaborator management routes/APIs/options/counts/exports; preserve assigned-customer scope and strip professional/percentage/access fields from customer payloads. Verify explicit Admin action grants and resolve supplier permission catalog keys before enabling the screens.

## Seed continuity

Seed compatibility is a completion gate in every phase. Follow the incremental seeds and final reset contract in docs/implementation/FINANCIAL_ROADMAP.md: update fixture generators/assertions with schema/workflow changes, preserve valid dev identity bindings and real monetary/origin invariants, and record reproducible validation. Final clean migration/generate/seed and app-use checks belong to phase09; this design does not run reset or change external providers.

## Person revision — 2026-10-30

Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

## Role-profile FK revision

Implement/verify the approved ClientProfile/SupplierProfile/EmployeeProfile 1:1 extensions now, derive role checkboxes from active profiles, atomically enforce employee→supplier for the same Person. Explicitly map Contract/Receivable to ClientProfile and Expense/Payable to SupplierProfile. Keep Clerk actor identity as Person, assignment as EmployeeProfile, and resolve beneficiary Person via SupplierProfile in own-scope/calculation checks. Update migrations, seeds (including documentless generic role profiles), FK/lifecycle/ID-mismatch tests and API projections; no duplicate personal fields or independent role-flag truth. Prisma/seed validation precedes Clerk policy work. No bank/address/family implementation now; reference docs/domain/PERSON_REGISTRATION.md.
