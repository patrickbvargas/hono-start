# Roles And Permissions

## Clerk authority

Clerk exclusively owns authentication, Organization memberships, roles and permission grants. Firm is an independent business unit; Employee is a business entity; Clerk privateMetadata.employeeId optionally identifies an active collaborator. Organization membership does not define a firm access boundary. Missing membership denies product access. An explicit invalid or inactive/deleted employeeId binding denies the session; an absent binding disables own/assigned capabilities only. A role name never bypasses a permission check.

Business permissions use `org:<feature>:<permission>`. See the approved catalog in `src/shared/session/catalog.ts` and deployment guidance in `docs/implementation/CLERK_MIGRATION.md`. Read, create, update, delete, restore and export grants are independent. `manage` is explicit only for account administration. Provider `sys_*` permissions retain their native purpose.

The following matrix describes initial role presets to configure in Clerk, not immutable application grants. Future custom roles may differ. Native RBAC is the current scope; no per-user grant exceptions. All references to administrator-only behavior below mean the corresponding explicit permission in the initial preset.

## Initial roles

- `Administrator`: full firm-scoped operational access.
- `User`: restricted access scoped to assigned contracts and own financial visibility, while still participating in core workflows allowed by the product.

## Permission Matrix

| Capability | Administrator | User |
|---|---|---|
| Access employee management screen | Yes | No |
| View all clients | Yes | Yes |
| Create or update clients | Yes | Yes |
| Delete or restore clients | Yes | No |
| View all contracts | Yes | No, only contracts visible by assignment role |
| Create contracts | Yes | Yes |
| Update assigned writable contracts | Yes | Yes, when assigned and writable |
| Assign or remove employees from a contract | Yes | Yes, when assigned and writable |
| Delete or restore contracts | Yes | No |
| View revenues and fees | Yes | No, only fees on allowed contracts |
| Create or update revenues and fees | Yes | Yes, within allowed contract boundaries |
| Delete or restore revenues and fees | Yes | No |
| View expenses | Yes | No |
| Create, update, delete, or restore expenses | Yes | No |
| View own remunerations | Yes | Yes |
| View all remunerations | Yes | No |
| Edit remunerations | Yes | No |
| Delete or restore remunerations | Yes | No |
| View dashboard | Yes, firm-wide | Yes, scoped |
| Export remunerations | Yes, firm-wide | Yes, scoped |
| Upload and view attachments | Yes | Yes |
| Delete attachments | Yes | No |
| View audit log | Yes | No |
| Manage employee accounts | Yes | No |
| Reset collaborator password | Yes | No |

## Permission Baseline

- All authenticated users may access the application shell.
- Administrators manage employee accounts, full financial visibility, audit logs, and restore/delete operations.
- Account managers assist with Clerk recovery; the application never generates temporary passwords.
- Regular users must not access administrative account management or firm-wide confidential financial views.

## Visibility Rules

- Administrators see firm-wide clients, contracts, fees, revenues, and remunerations.
- Administrators see firm-wide expenses.
- Regular users see all clients but only the contracts and fees allowed by their assignment-based visibility rules.
- Regular users do not access the expenses route.
- Regular lawyers see contracts only when actively assigned as responsible or recommended.
- Regular lawyers do not gain contract visibility from recommending assignments alone.
- Regular administrative assistants continue seeing contracts where they are actively assigned as admin assistants.
- Regular users only see their own remunerations and own dashboard-scoped financial data.
- Regular users must not see dashboard cash-flow surfaces that derive values from firm-wide expenses or consolidated firm balance.
- "Allowed contract boundaries" means the actor is inside the same firm, is assigned where assignment-based visibility is required, and the target resource remains writable by lifecycle rules.

## Protected Actions

- Delete and restore actions are administrator-only.
- Audit log access is administrator-only.
- Manual remuneration edits are administrator-only.
- Contract status lock management is administrator-only.
- Employee management is administrator-only.
- Attachment deletion is administrator-only.

## Shared Operational Actions

- Authenticated users may create and update clients within product rules.
- Authenticated users may create contracts within product rules.
- Authenticated users may create and update contracts, revenues, fees, and assignments only within their allowed visibility and lifecycle boundaries.
- Authenticated users may upload and view attachments within permitted contexts.

## Screen Access Overview

| Screen | Access |
|---|---|
| Login | Public |
| Password Reset | Public |
| Dashboard | Authenticated and role-scoped |
| Clients | Authenticated |
| Contracts | Authenticated and role-scoped |
| Fees | Authenticated and role-scoped |
| Expenses | Administrator only |
| Remunerations | Authenticated and role-scoped |
| User Management | Administrator only |
| Audit Log | Administrator only |

## Access Policy Notes

- Route-level access may block entire screens early.
- Server-side policy remains authoritative even when the UI already hides actions.
- Non-admin contract edits are only valid while the contract is still writable and assigned to the actor.
- Session policy must stay aligned with this matrix and with the domain business rules.
- Dashboard and export scope must follow this matrix consistently.
- Dashboard cash-flow summaries that combine honorários, remunerações, and despesas are administrator-only because expenses are firm-wide financial data.

## Permission Contract

- Clerk permission checks are mandatory; local UserRole values are not authorization authority.
- UI affordances and server-side enforcement must agree.
- Role or visibility decisions must derive from authenticated session context, never from client-submitted authority claims.

## Business and authentication isolation

See `DOMAIN_MODEL.md` for ownership. Own and assigned permissions require a valid optional Clerk privateMetadata.employeeId. Organization membership does not confer firm-specific access; metadata-based firm restrictions are future work. Account administration occurs in Clerk Dashboard.
