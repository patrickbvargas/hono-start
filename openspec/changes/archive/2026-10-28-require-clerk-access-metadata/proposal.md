## Why

Missing Clerk business mappings currently produce denied access or silently remove scoped capabilities. Both mappings are required and users need actionable configuration feedback.

## What Changes

- **BREAKING**: Require User privateMetadata.employeeId for every role, alongside Organization privateMetadata.firmId.
- Deny protected execution for missing, malformed, nonexistent or inactive/deleted bindings.
- Show persistent, specific configuration guidance with retry and sign-out, hiding organization selection until required mappings are corrected in Clerk, without exposing metadata values.
- Preserve authentication and provider failure handling separately from configuration feedback.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-authorization`: Require both mappings and expose a validated access-resolution state.
- `clerk-identity-lifecycle`: Require Employee binding and provide configuration recovery on login.

## Impact

Shared session resolution, authentication entry UI, focused tests and canonical domain/security/setup docs. Applies to all roles and all branches; current Organization grants and Firm isolation remain authoritative. No new dependencies or database migration.

## Non-goals

Editing Clerk metadata in the application, provisioning accounts, changing role grants or changing shared Employee ownership.
