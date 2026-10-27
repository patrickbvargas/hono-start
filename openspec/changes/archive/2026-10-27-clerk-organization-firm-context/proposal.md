## Why

Organization switching currently changes Clerk grants while selecting the first Firm in the database for every organization. Branch isolation must follow operator-managed Clerk Organization private metadata without adding provider links to business tables.

## What Changes

- **BREAKING**: resolve the business Firm exclusively from the active Organization's current `privateMetadata.firmId`, validated as a positive integer and an existing Firm.
- Deny protected access for absent, invalid or unknown Firm mappings; never fall back to a default Firm.
- Scope the optional user `privateMetadata.employeeId` to the resolved Firm; invalid, inactive or deleted bindings deny the session; a valid binding from another Firm is omitted and disables own/assigned grants while retaining authorized general grants.
- Keep organization selection available after denial, with safe user-facing guidance.
- Preserve request-local verification, native Clerk grants and business `firmId` filtering. Operators manage all identity links in Clerk.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-authorization`: require current Organization metadata to establish the authorized Firm and validate Employee membership in that Firm.
- `clerk-identity-lifecycle`: define provider-owned Organization/Firm mappings and recovery through organization selection.

## Non-goals

No database migrations, metadata writes, automatic Firm creation, fixed IDs, organization-name matching, consolidated branch reporting, or per-branch Employee mapping redesign. Multiple Organizations may point to the same existing Firm intentionally.

## Impact

All users require a valid Organization Firm mapping, including users with general permissions and no Employee binding. Changes affect shared server sessions, authentication recovery UI, focused tests and canonical security/domain documentation. Existing records and query scopes remain unchanged. No new dependencies.
