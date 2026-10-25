## Why

The contract workspace lacks the delete action already available in the contract list. Users need that same action without leaving the contract page.

## What Changes

- Add Excluir contrato to the workspace header for actors with contract delete permission.
- Reuse existing confirmation, protected soft-delete operation and dependency errors.
- Return to the originating validated list context only after success.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contract-management`: Expose existing contract deletion from the workspace.

## Impact

Contract workspace, its controller hook and route callback. Existing permissions, firm isolation and active-revenue deletion protection remain unchanged. No database changes or dependencies.

## Non-goals

Additional summaries, financial collections, restore controls, new tabs or other workspace changes. Scope reduced at user request.
