## Why

Collapsed empty team and revenue rows hide the next input and add unnecessary clicks to contract creation. Clear visible team inputs and open incomplete revenues make the form easier to complete.

## What Changes

- Show collaborator and assignment inputs directly, with a discreet remove action.
- Initially open incomplete or invalid revenues and allow complete revenues to collapse with type, amount and installment summaries.
- Focus the first field when adding a row, preserve stable field identity, and group revenue type and amount before payment details.
- Preserve the aligned ghost add actions and matching loading layout.

## Capabilities

### New Capabilities

- `contract-form-sections`: direct team editing and guided expandable revenue editing.

### Modified Capabilities

None.

## Impact

Contract create/edit form, feature orchestration hook, shared accordion optional behavior, focused tests and frontend docs. Applies to existing authorized contract editors; tenant scope and server rules remain unchanged. No database migration or new dependency.

## Non-goals

Financial rule changes, new fields, permission changes and broader form redesign.
