# Legacy Cleanup

## Purpose
Document the cleanup of legacy feature modules (`clients` and `employees`) after consolidating into the unified `@/features/people` module.

## Requirements

### Requirement: Decouple dashboard from legacy modules
The dashboard (`src/routes/_app/index.tsx`) SHALL use the unified `@/features/people` module for person forms, quick action overlays, and reference lookup prefetching, without importing `@/features/clients` or `@/features/employees`.

#### Scenario: Open person create modal from dashboard
- **WHEN** user clicks "Novo cliente" or "Novo colaborador" action from the dashboard
- **THEN** system opens `PersonForm` from `@/features/people`

### Requirement: Decouple related records from legacy modules
The related records system (`src/features/related-records`) SHALL route client and employee details and navigation to `@/features/people` without importing `@/features/clients` or `@/features/employees`.

#### Scenario: Navigate to related client or employee
- **WHEN** user opens a related client or employee record
- **THEN** system redirects to `/pessoas/$personId`

### Requirement: Remove legacy feature directories
The codebase SHALL NOT contain `src/features/clients` or `src/features/employees` directories or any direct imports from them.

#### Scenario: Verify clean removal
- **WHEN** full project type check and tests are run
- **THEN** TypeScript compilation passes with zero references to `@/features/clients` or `@/features/employees`

