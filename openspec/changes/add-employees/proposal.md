## Why

The employee management screen (Funcionários) is scaffolded but non-functional — the list page renders raw JSON, the form is disconnected, API handlers use mocks and `alert()`, and CRUD flows have no UI integration. Administrators need a working screen to create, edit, and deactivate employee accounts before the rest of the system (contracts, remunerations) can be exercised.

## What Changes

- Replace mock data in server functions with real Prisma queries scoped to `firmId`
- Wire the employee list route to render the `EmployeeTable` component with filters, sorting, and pagination
- Integrate the create-employee form into the list page (drawer or dedicated sub-route)
- Add edit-employee flow that pre-populates the form from existing data
- Add soft-delete and restore with confirmation dialog
- Replace `alert()` calls with proper toast notifications
- Enforce role-based access: full CRUD for Administrators only; regular users see basic info (name, type, OAB)
- Add DB migration for the `employees` table (schema already defined in the data model)

## Capabilities

### New Capabilities

- `employee-management`: Full employee CRUD screen — list with filters/sort/pagination, create form, edit form, soft-delete confirmation, and restore action. Administrator-only access per the permission matrix.

### Modified Capabilities

<!-- No existing specs to modify -->

## Non-goals

- Authentication / BetterAuth account creation (password hashing, credential storage) — handled as part of a future auth change
- Avatar upload — file attachment capability is out of scope for this change
- Employee detail view / side panel
- Any remuneration or contract data displayed on the employee record

## Impact

- **New route or sub-route**: `/funcionarios` updated to render a full CRUD UI
- **Backend**: `src/features/employees/api/*.ts` — replace mock handlers with Prisma queries
- **DB migration**: `prisma/migrations/` — create `employees` table (and referenced lookup tables `employee_types`, `user_roles` if not already present)
- **Seed data**: `prisma/seed.ts` — seed `EmployeeType` and `UserRole` lookup values
- **Affected roles**: Administrators (full CRUD); Users (read-only view of basic info)
- **Multi-tenancy**: All queries must filter by `firmId` from session — no client-supplied `firmId`
