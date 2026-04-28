# Roles And Permissions

## Roles

- `Administrator`: full firm-scoped operational access.
- `User`: restricted access scoped to assigned contracts and own financial visibility, while still participating in core workflows allowed by the product.

## Permission Matrix

| Capability | Administrator | User |
|---|---|---|
| Access employee management screen | Yes | No |
| View all clients | Yes | Yes |
| Create or update clients | Yes | Yes |
| Delete or restore clients | Yes | No |
| View all contracts | Yes | No, only assigned contracts |
| Create contracts | Yes | Yes |
| Update assigned writable contracts | Yes | Yes, when assigned and writable |
| Assign or remove employees from a contract | Yes | Yes, when assigned and writable |
| Delete or restore contracts | Yes | No |
| View revenues and fees | Yes | No, only on allowed contracts |
| Create or update revenues and fees | Yes | Yes, within allowed contract boundaries |
| Delete or restore revenues and fees | Yes | No |
| View own remunerations | Yes | Yes |
| View all remunerations | Yes | No |
| Edit remunerations | Yes | No |
| Delete or restore remunerations | Yes | No |
| View dashboard | Yes, firm-wide | Yes, scoped |
| Export reports | Yes, firm-wide | Yes, scoped |
| Upload and view attachments | Yes | Yes |
| Delete attachments | Yes | No |
| View audit log | Yes | No |
| Manage employee accounts | Yes | No |

## Permission Baseline

- All authenticated users may access the application shell.
- Administrators manage employee accounts, full financial visibility, audit logs, and restore/delete operations.
- Regular users must not access administrative account management or firm-wide confidential financial views.

## Visibility Rules

- Administrators see firm-wide clients, contracts, fees, revenues, and remunerations.
- Regular users see all clients but only the contracts, fees, and revenues allowed by their assignment-based visibility rules.
- Regular users only see their own remunerations and own dashboard-scoped financial data.
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
| Remunerations | Authenticated and role-scoped |
| User Management | Administrator only |
| Audit Log | Administrator only |

## Access Policy Notes

- Route-level access may block entire screens early.
- Server-side policy remains authoritative even when the UI already hides actions.
- Non-admin contract edits are only valid while the contract is still writable and assigned to the actor.
- Session policy must stay aligned with this matrix and with the domain business rules.
- Dashboard and export scope must follow this matrix consistently.

## Permission Contract

- Role checks are not optional.
- UI affordances and server-side enforcement must agree.
- Role or visibility decisions must derive from authenticated session context, never from client-submitted authority claims.
