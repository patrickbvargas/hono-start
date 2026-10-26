## Why

Current demo data repeats six financial templates with fixed years and leaves attachment and history screens empty. Client previews need realistic lifecycle scenarios and comparable current/prior-year financial activity.

## What Changes

- Generate deterministic monthly business activity relative to a configurable reference date, covering the current year and two prior years.
- Cover contract lifecycle, payment, team, remuneration, deletion, attachment and audit examples with coherent financial values.
- Make db:reset seed once and document repeatability and demo account setup.
- Verify YTD and prior-period totals using the existing dashboard period and summary rules.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `development-seed-fixtures`: Rolling multi-year history, lifecycle examples, stable references and reset reproducibility.

## Impact

Prisma seed, reset command, seed tests and setup documentation. Data belongs to Matriz; Clerk permissions and accounts remain provider-managed. Administrators can inspect all examples; scoped collaborators retain existing visibility.

## Non-goals

No dashboard formula changes, production provisioning, Clerk account creation or access-policy changes.
