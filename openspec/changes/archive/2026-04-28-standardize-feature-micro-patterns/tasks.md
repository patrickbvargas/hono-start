## 1. Contract And Documentation

- [x] 1.1 Update `docs/implementation/ARCHITECTURE.md` to define the canonical route-facing feature barrel surface and clarify that equivalent feature slices export the same public API categories.
- [x] 1.2 Update `docs/implementation/FRONTEND.md` to define the normalized `hooks/use-data.ts` consumption pattern for collection, entity, and option queries.
- [x] 1.3 Update `docs/implementation/CONVENTIONS.md` to codify the equivalent prop contract for overlay ids, id-based table callbacks, and normalized option-hook naming.
- [x] 1.4 Update `docs/implementation/QUALITY_WORKFLOW.md` to state that equivalent micro-patterns across features must converge and be enforced by boundary tests.

## 2. Feature Public Surface Normalization

- [x] 2.1 Audit `src/features/*/index.ts` and normalize equivalent route-facing feature barrels to the canonical minimal surface without leaking incidental internal exports.
- [x] 2.2 Normalize route-facing export differences in `attachments`, `audit-logs`, `dashboard`, and `remunerations` where the current public surface diverges from the documented micro-contract.

## 3. Data Hook Normalization

- [x] 3.1 Normalize `src/features/*/hooks/use-data.ts` so equivalent collection and single-entity concerns use the same suspense-first query-consumption logic.
- [x] 3.2 Refactor mixed option-hook implementations so unconditional required option queries follow the canonical `useSuspenseQueries` pattern and conditional option concerns no longer force ad hoc hook behavior.
- [x] 3.3 Update affected feature components to consume only the normalized `use-data.ts` hook contracts while preserving existing render behavior.

## 4. Prop And Orchestration Alignment

- [x] 4.1 Audit lifecycle and detail overlays across feature slices and normalize equivalent props to id-driven contracts such as `id: EntityId`.
- [x] 4.2 Audit feature tables and normalize equivalent action callbacks to id-based contracts such as `onView(id)`, `onEdit(id)`, `onDelete(id)`, and `onRestore(id)`.

## 5. Contract Enforcement And Verification

- [x] 5.1 Extend `src/features/__tests__/frontend-orchestration-boundaries.test.ts` to enforce the normalized barrel, hook, and equivalent query-consumption rules.
- [x] 5.2 Add or update focused tests for any normalized feature hook or public-surface behavior that currently lacks explicit coverage.
- [x] 5.3 Run `pnpm check` and fix all reported issues.
- [x] 5.4 Run `npx tsc --noEmit` and fix all reported issues.
