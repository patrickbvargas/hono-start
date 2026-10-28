## 1. Shared presentation

- [x] 1.1 Add shared contextual empty UI and table/card slots, preserving fallback messages.

## 2. Collection integration

- [x] 2.1 Share each feature filter controller between header fields and empty actions.
- [x] 2.2 Integrate eight primary collections with filter clearing, authorized creation, derived copy and empty-page recovery.

## 3. Contract and verification

- [x] 3.1 Document empty-state behavior and add focused interaction/regression coverage. No database migration required.
- [x] 3.2 Run pnpm check, npx tsc --noEmit and relevant Vitest tests; fix errors and validate OpenSpec.

## Verification results

- `pnpm check`: passed.
- `npx tsc --noEmit`: passed.
- Focused empty-state, filter-hook and table/card tests: 14 files, 36 tests passed.
- Architecture/orchestration boundaries and final table regression: 3 files, 27 tests passed (table tests overlap the focused run).
- `openspec validate contextual-list-empty-states --strict`: passed.
- `git diff --check`: passed.
- Actual shared components visually inspected in an isolated local preview at desktop and 390px mobile widths; corrected table empty-cell wrapping. Preview files and server removed after verification. Authenticated end-to-end flows were not exercised.

## 4. Browser review follow-up

- [x] 4.1 Remove branch wording from expense empty copy.
- [x] 4.2 Use shared small button variants on plain router links for error/not-found recovery, without textual-link decoration.
- [x] 4.3 Fix pending-work SQL joining global clients through the removed firmId column; preserve contract and financial Firm scopes.
- [x] 4.4 Reproduce PostgreSQL 42703 before the fix, rerun the query successfully, verify the authenticated pending-work page renders, and add query/button regression coverage.

Follow-up validation: 18 tests across 4 files passed; pnpm check, npx tsc --noEmit and git diff --check passed.

- [x] 4.5 Audit every error recovery action: use small outline buttons for all four local retry surfaces and expand return-action coverage to session, permission, network, generic, unknown and 404 errors. Five focused files passed (36 tests); final drilldown regression passed (3 tests).

## 5. Workspace browser feedback

- [x] 5.1 Keep contract/client/employee alert wrappers at content height and shrink internally at the available height cap. Verified one compact contract alert and an employee preview scrolling 458px of content inside a 156px viewport.
- [x] 5.2 Show non-deleted inactive team assignments with an Inativo badge instead of claiming no members. Contract 213 has two inactive, non-deleted assignments; operational/financial active-assignment policies remain unchanged.
- [x] 5.3 Add team regression coverage and align domain/frontend contracts. Four focused files passed (24 tests); pnpm check, npx tsc --noEmit and git diff --check passed.
