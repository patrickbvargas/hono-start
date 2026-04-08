## Why

The employees list currently supports type, role, and status filters on the backend and in the schema, but no filter UI component exists to expose these controls to the user. Additionally, there is no text search by name or OAB number, making it difficult to find specific employees in large firms.

## What Changes

- Add a `name` / `oabNumber` text search field to `employeeFilterSchema` and propagate it to the server query
- Create `src/features/employees/components/filter/index.tsx` — an `EmployeeFilter` component that renders controls for all three filter dimensions (name/OAB search, type, role)
- Export the new component from the employees feature barrel (`index.ts`)

## Capabilities

### New Capabilities

- `employee-filter-ui`: A React filter component (`EmployeeFilter`) that allows users to search employees by name/OAB number and multi-select by type and role. Lives at `src/features/employees/components/filter/`.

### Modified Capabilities

- `employee-management`: The `employeeFilterSchema` gains a `name` text field; the `getEmployees` server function is updated to apply a case-insensitive `fullName`/`oabNumber` OR filter when `name` is provided.

## Impact

- `src/features/employees/schemas/filter.ts` — add `name` field
- `src/features/employees/api/get.ts` — add `name` filter clause
- `src/features/employees/components/filter/index.tsx` — new file
- `src/features/employees/index.ts` — export new component
