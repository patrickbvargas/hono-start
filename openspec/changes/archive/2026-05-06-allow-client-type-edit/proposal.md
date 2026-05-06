## Why

The current client flow blocks changing the client type after creation, even though the underlying client record can safely switch between `INDIVIDUAL` and `COMPANY` without breaking the primary key or tenant ownership model.

That restriction now conflicts with the intended product behavior. Users need to correct onboarding mistakes and reclassify clients when a record was created with the wrong type, while preserving the same client identity and existing downstream relationships.

## What Changes

- Allow authenticated users to edit the client type during client updates.
- Keep CPF/CNPJ validation tied to the selected client type on both create and update flows.
- Persist the resolved `ClientType` lookup id on update when the submitted type changes.
- Update the client-management contract so the edit flow no longer treats client type as immutable.

## Capabilities

### New Capabilities

### Modified Capabilities
- `client-management`: Client edit flows now allow changing the selected type and require the submitted document to match the selected type semantics.

## Non-goals

- Redesigning how client documents are stored or normalized.
- Reworking contract-to-client relationships or changing client identity semantics.
- Relaxing document uniqueness rules or lookup activity rules.

## Impact

- Affected code: `src/features/clients/**` form UI, lookup rules, update mutation logic, and focused tests.
- Affected specs: `client-management` main spec and related domain docs that still described client type as fixed.
- Affected users: authenticated users who create or edit clients.
