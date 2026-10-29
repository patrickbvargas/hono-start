# Contract write permissions

## Purpose
Define independent contract editing grants and safe Clerk cutover.

## Requirements
### Requirement: Independent sensitive contract edits
Updates SHALL require existing scoped edit authority plus manage_assignments for team changes, manage_revenues for terms and feePercentage changes, change_status for status changes and manage_status_lock for lock changes. All keys SHALL use org:contracts prefix. Tenant and lifecycle restrictions SHALL remain enforced.
#### Scenario: General editor
- **WHEN** an authorized editor changes notes with unchanged restricted groups
- **THEN** the update is allowed
#### Scenario: Forged restricted changes
- **WHEN** an editor changes a restricted group without its additional grant
- **THEN** the entire update is rejected before persistence
#### Scenario: Independent lifecycle permissions
- **WHEN** an editor has change_status but lacks manage_status_lock
- **THEN** status changes remain subject to existing locks and lock changes are denied
### Requirement: Complete creation
contracts:create SHALL authorize initial team and revenues. New contracts SHALL remain ACTIVE; initial locking SHALL require manage_status_lock.
#### Scenario: Creator without additional editing grants
- **WHEN** an authorized creator submits required team and financial terms
- **THEN** creation succeeds without grants for later editing
### Requirement: Provider cutover
Local accounts:manage SHALL be removed. Provider migration SHALL preserve unrelated grants and reproduce existing role powers without role-name assumptions.
#### Scenario: Scoped editor migration
- **WHEN** a role has update_assigned only
- **THEN** team and financial grants are added without lifecycle grants
