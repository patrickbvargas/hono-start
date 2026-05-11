## 1. OpenSpec And Shared Composition

- [x] 1.1 Add delta specs and route-facing task coverage for expanding shared entity-view card-list composition to contracts, employees, and remunerations.

## 2. Feature Card Lists

- [x] 2.1 Create `ContractList`, export it from the contracts barrel, and wire `/contratos` through `EntityView.Toggle` and `EntityView` without changing existing filters, overlays, or permissions.
- [x] 2.2 Create `EmployeeList`, export it from the employees barrel, and wire `/colaboradores` through `EntityView.Toggle` and `EntityView` without changing existing filters, overlays, or admin-only access.
- [x] 2.3 Create `FeeList`, export it from the fees barrel, and wire `/honorarios` through `EntityView.Toggle` and `EntityView` without changing existing filters, overlays, or permissions.
- [x] 2.4 Create `RemunerationList`, export it from the remunerations barrel, and wire `/remuneracoes` through `EntityView.Toggle` and `EntityView` while preserving export actions, filters, overlays, and role-scoped visibility.

## 3. Verification

- [x] 3.1 Add focused contract tests for contracts, employees, fees, and remunerations proving list/table separation and route-level `EntityView` orchestration.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, and then mark all completed tasks in this change.
