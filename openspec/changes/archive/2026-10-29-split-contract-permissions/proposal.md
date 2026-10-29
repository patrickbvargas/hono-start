## Why
Contract editing currently combines general data, team, financial terms and lifecycle administration. Independent grants allow operational roles without unnecessary powers.

## What Changes
- **BREAKING**: require manage_assignments/manage_revenues for changes to existing contract teams/financial terms.
- Separate change_status and manage_status_lock from update_all.
- Preserve create authority for initial mandatory team and revenues; new contracts remain ACTIVE for everyone.
- Remove unused accounts:manage from local catalog.
- Reconcile Clerk grants additively before deployment, preserving existing role powers.

## Capabilities
### New Capabilities
- `contract-write-permissions`: independent aggregate editing capabilities and provider cutover.
### Modified Capabilities
None; the new capability specifies additional authorization constraints on existing operations.

## Impact
Contract API/data/hooks/form, shared permission catalog, tests and canonical docs. No DB migration. All grants remain Clerk-owned and current-Firm/assignment/lifecycle rules remain mandatory. Administrator and operational member presets need grant reconciliation.

## Non-goals
No auth migration, role editor, per-user overrides or changes to other feature permissions.
