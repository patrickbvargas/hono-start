## ADDED Requirements

### Requirement: Display employee deletion visibility filter control
The system SHALL render a dedicated deleted-state filter in the employee advanced filters so users can control soft-delete visibility independently from the `isActive` status filter.

#### Scenario: Filter component renders deleted-state control
- **WHEN** an administrator views the employees page
- **THEN** a deleted-state filter control is visible inside the advanced filters
- **AND** the control offers explicit visibility choices for non-deleted records, deleted records, or all records

#### Scenario: Deleted-state control updates URL state independently
- **WHEN** the user changes the deleted-state filter
- **THEN** the URL search params are updated to reflect the new deleted-state visibility
- **AND** the current `active` filter value remains unchanged

#### Scenario: Deleted-state control composes with active status filter
- **WHEN** the user applies both a deleted-state filter and an active status filter
- **THEN** the employee list reloads using both constraints together
- **AND** the result reflects the intersection of soft-delete visibility and `isActive` status
