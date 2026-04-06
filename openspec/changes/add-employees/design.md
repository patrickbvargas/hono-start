## Context

The `employees` feature is partially scaffolded: route, form component, table component, and API functions all exist but are non-functional. Server functions return mock data and use `alert()` for feedback. The route renders raw JSON. The goal is to replace the scaffold with a working Prisma-backed CRUD screen that follows established conventions.

The data model for `Employee` is fully defined in `DATA_MODEL.md §4.2`. Lookup tables `EmployeeType` and `UserRole` already exist in the schema. Authentication (BetterAuth account/password creation) is handled separately and is NOT part of this change.

## Goals / Non-Goals

**Goals:**
- Wire all employee server functions to real Prisma queries scoped by `firmId`
- Render the employee list route with proper table, URL-driven filter/sort/pagination
- Implement create and edit forms in modal overlays per UI conventions
- Implement soft-delete and restore with confirmation modals
- Replace `alert()` with toast notifications (sonner)
- Enforce role-based access: Administrators see full CRUD; regular Users see a read-only list with basic info (name, type, OAB)
- DB migration for `employees` table and lookup tables (`employee_types`, `user_roles`)
- Seed `EmployeeType` and `UserRole` lookup values

**Non-Goals:**
- BetterAuth account creation / password hashing (a future auth change)
- Avatar upload (file attachment change)
- Employee detail drawer
- Any remuneration or contract data on the employee record
- Firm-level `additionalEmployeeId` configuration via UI

## Decisions

### D1 — Defer password creation to the auth change

**Decision:** The create-employee form will NOT include a password field in this change.

**Rationale:** BetterAuth account creation involves credential storage in a separate `Account` table with its own hashing flow. Including it here would mix auth concerns into employee management. Administrators will set passwords when auth is implemented.

**Alternative considered:** Include a password field now and call a BetterAuth utility directly. Rejected because BetterAuth is not yet installed or configured — this change should not create a partial auth setup.

### D2 — Modal overlays for create and edit

**Decision:** Create and edit forms open in a modal overlay, not a dedicated sub-route.

**Rationale:** This is the required UI pattern per CONVENTIONS.md. Keeps URL clean for filter/sort/pagination while letting the modal handle form state.

### D3 — URL-driven filter/sort/pagination state

**Decision:** The existing `employeeSearchSchema` (type, role, status, sort column, sort direction, page, limit) is the single source of truth. State lives in URL search params.

**Rationale:** Required by CONVENTIONS.md for data tables. Enables bookmarkable, shareable views.

### D4 — firmId from session, never from client

**Decision:** All Prisma queries will read `firmId` from the authenticated session context. No client-supplied firmId will be accepted.

**Rationale:** Multi-tenancy constraint from ARCHITECTURE.md and CONVENTIONS.md. A Prisma middleware or service-layer guard will enforce this.

### D5 — Lookup table references by `value`, not `id`

**Decision:** Seed checks and FK resolution use `value` (e.g., `"LAWYER"`, `"ADMIN"`) not numeric `id`.

**Rationale:** IDs may differ across environments (dev, staging, production). CONVENTIONS.md explicitly requires this.

### D6 — referralPercentage can be 0 for Admin Assistants

**Decision:** The form allows `referrerPercent` of 0 when employee type is `ADMIN_ASSISTANT`. Validation enforces `referralPercentage <= remunerationPercentage`.

**Rationale:** DATA_MODEL.md §4.2 states both can be zero. Admin Assistants never act as referrers.

## Risks / Trade-offs

- **No password on create** → New employees cannot log in until the auth change is implemented. Acceptable because authentication is not a dependency for other features in this change.
- **OAB format locked to 2-letter prefix** → The current regex `^RS\d{6}$` only accepts RS state codes. Should be expanded to `^[A-Z]{2}\d{6}$` to support all Brazilian state OABs. This is a schema correction needed in this change.
- **Session not yet implemented** → `firmId` from session is a placeholder until BetterAuth is wired. Server functions may use a hardcoded seed `firmId` for development and must be guarded against production use.

## Migration Plan

1. Add `EmployeeType`, `UserRole` tables and `Employee` table to `prisma/schema.prisma`
2. Run `prisma migrate dev --name add-employees-table` to generate the migration
3. Add seed entries for `EmployeeType` and `UserRole` to `prisma/seed.ts`
4. Run `prisma db seed` to populate lookup tables in dev
5. No rollback risk — new tables only, no existing data affected

## Open Questions

- **Q1**: What should happen when an administrator tries to create an employee with a duplicate email? The DB has a global `@unique` on `email`. We need a user-friendly error message surfaced from the Prisma unique constraint violation.
- **Q2**: Should the list page be accessible to regular Users at all? The permission matrix (PRD §5.2) says Users can "view all employees (basic info: name, type, OAB)" but cannot access the full User Management screen. This change will display a read-only simplified view for Users and the full CRUD view for Administrators on the same route, gated by role check.
