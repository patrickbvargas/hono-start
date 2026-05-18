## 1. Shared Filter Orchestration

- [x] 1.1 Extend `src/shared/hooks/use-filter.ts` with a canonical reset helper that restores validated default filter values, preserves non-filter search state, and resets pagination to page 1
- [x] 1.2 Add or update focused tests for shared filter reset semantics, including preservation of sorting state

## 2. Entity Filter UI Adoption

- [x] 2.1 Update client, employee, contract, fee, remuneration, and audit-log filter hooks/components to expose and render the `Limpar filtros` action through the existing shared UI boundaries
- [x] 2.2 Ensure each list filter surface clears inline search plus advanced filters together and remains disabled or inert when the current filter state already matches defaults

## 3. Verification

- [x] 3.1 Add focused Vitest coverage for representative entity filter UI wiring and reset behavior
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any resulting issues before marking the change complete
