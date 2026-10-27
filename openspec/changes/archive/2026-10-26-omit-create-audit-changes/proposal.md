## Why

Creation snapshots appear as field changes in the audit summary, adding redundant detail.

## What Changes

- Hide the field-change summary for CREATE events.
- Preserve the full technical payload in storage and technical details.
- Preserve other action summaries and immutable history.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-log-management`: creation summary presentation only.

## Impact

Audit presentation, focused regression tests and business rules. Administrator permissions and firm isolation remain unchanged.

## Non-goals

No persistence, seed, schema, permission or historical data changes.
