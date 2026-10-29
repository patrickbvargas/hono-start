## Why

Revenue cards hide the installment schedule and receipt dates, requiring navigation away from the contract to understand payment progress.

## What Changes

- Add an initially collapsed accordion to each revenue card with planned installments, due dates, actual receipt dates and amounts, and status.
- Preserve existing totals, payment actions, financial masking and access scopes.

## Capabilities

### New Capabilities
- `revenue-installment-details`: On-demand installment and receipt details within contract revenue cards.

### Modified Capabilities

None.

## Non-goals

No payment mutation changes, new partial-payment rules, schema migrations, or fabricated entry receipt dates.

## Impact

Contract detail query/schema and feature components; existing shared accordion. Users with receipt read access can expand details under existing branch and assignment scopes. No new grants or dependencies.
