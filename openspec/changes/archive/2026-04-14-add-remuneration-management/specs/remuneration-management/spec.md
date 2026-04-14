## ADDED Requirements

### Requirement: List remunerations
The system SHALL display a paginated, sortable, filterable list of remunerations available to the authenticated user, following the shared entity-management list contract and the remuneration visibility rules defined by role and employee scope.

#### Scenario: Administrator sees firm-wide remunerations
- **WHEN** an administrator navigates to the remunerations route
- **THEN** the system displays remunerations belonging to the administrator's firm
- **AND** the list includes remunerations regardless of which employee earned them

#### Scenario: Regular user sees only own remunerations
- **WHEN** a regular authenticated user navigates to the remunerations route
- **THEN** the system displays only remunerations in the same firm linked to that user's own employee identity

#### Scenario: Remuneration list columns reflect the payout summary
- **WHEN** the remunerations list is loaded
- **THEN** the table shows columns for employee, contract, payment date, amount, effective percentage, override state, active state, and created date

#### Scenario: Filter by employee
- **WHEN** an administrator applies an employee filter
- **THEN** the list shows only remunerations linked to the selected employee in the authenticated administrator's firm

#### Scenario: Regular user cannot widen visibility with employee filter
- **WHEN** a regular user applies or tampers with an employee filter
- **THEN** the server still returns only remunerations linked to that user's own employee identity

#### Scenario: Filter by parent contract
- **WHEN** a user applies a contract filter
- **THEN** the list shows only remunerations linked to the selected contract in the authenticated user's scope

#### Scenario: Filter by payment date range
- **WHEN** a user applies `dateFrom` and `dateTo` filters
- **THEN** the list shows only remunerations whose payment date falls inside the selected range

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same remunerations view

### Requirement: View remuneration details
The system SHALL allow authenticated users with access to a remuneration to inspect remuneration details without leaving the list workflow.

#### Scenario: Open remuneration details drawer
- **WHEN** a user selects the details action for a visible remuneration row
- **THEN** the system opens a drawer showing the remuneration's employee, contract, fee, payment date, amount, effective percentage, generation state, and lifecycle metadata
- **AND** the list state remains preserved behind the drawer

#### Scenario: Detail access respects employee-scoped visibility
- **WHEN** a regular user requests details for a remuneration outside that user's own employee scope
- **THEN** the server rejects the request before remuneration data is returned

### Requirement: Administrators can manually adjust remunerations
The system SHALL allow only administrators to update remuneration values, and an intentional administrator edit SHALL convert the remuneration into a manual override so later fee recalculation does not silently replace it.

#### Scenario: Administrator opens edit remuneration form
- **WHEN** an administrator selects the edit action for a visible remuneration row
- **THEN** a modal overlay opens with the current remuneration amount and effective percentage pre-filled

#### Scenario: Successful administrator override
- **WHEN** an administrator submits a valid remuneration edit
- **THEN** the system updates the remuneration amount and effective percentage
- **AND** the system marks the remuneration as no longer system-generated
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the remunerations list refreshes to reflect the updated row

#### Scenario: Regular user cannot edit remunerations
- **WHEN** a regular user attempts to trigger a remuneration update
- **THEN** the server rejects the action before remuneration data is changed

#### Scenario: Manual override is preserved from later fee recalculation
- **WHEN** a remuneration has been manually adjusted by an administrator and a later fee update recalculates linked remunerations
- **THEN** the manually adjusted remuneration remains unchanged

### Requirement: Remuneration lifecycle actions respect role and parent consistency rules
The system SHALL allow administrators to soft-delete and restore remunerations while preserving consistency with the parent fee lifecycle.

#### Scenario: Administrator deletes remuneration
- **WHEN** an administrator confirms deletion for a remuneration
- **THEN** the system sets `deletedAt` on the remuneration record
- **AND** the remuneration no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Administrator restores remuneration
- **WHEN** an administrator confirms restoration for a soft-deleted remuneration whose parent fee remains active
- **THEN** the system clears `deletedAt`
- **AND** the remuneration becomes visible again according to the current filters

#### Scenario: Restore blocked when parent fee remains deleted
- **WHEN** an administrator attempts to restore a remuneration whose parent fee is still soft-deleted
- **THEN** the system rejects the restoration with an explanatory Portuguese error message

#### Scenario: Regular user cannot delete or restore remunerations
- **WHEN** a regular user attempts to trigger remuneration delete or restore
- **THEN** the server rejects the action before remuneration state changes

### Requirement: Remuneration route and queries derive scope from session
The system SHALL derive tenant scope and role-aware remuneration visibility from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Authenticated users can access remunerations route
- **WHEN** an authenticated user navigates to the remunerations route
- **THEN** the route allows access to the remuneration-management screen

#### Scenario: Unauthenticated users cannot access remuneration management
- **WHEN** an unauthenticated actor navigates to the remunerations route or triggers a remuneration server function
- **THEN** access is denied before remuneration data is returned or modified

#### Scenario: Server derives remuneration scope from session
- **WHEN** any remuneration list query, detail query, export query, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored
- **AND** regular-user financial visibility is constrained by the employee identity resolved from the same session

### Requirement: Remuneration export follows list filters and role scope
The system SHALL allow authenticated users to export remuneration data using the same filters and visibility boundaries applied to the on-screen remuneration list.

#### Scenario: Administrator exports filtered remunerations
- **WHEN** an administrator exports remunerations after applying supported filters
- **THEN** the exported dataset contains only remuneration rows matching the current filters inside the administrator's firm

#### Scenario: Regular user exports only own remunerations
- **WHEN** a regular user exports remunerations
- **THEN** the exported dataset contains only remunerations linked to that user's own employee identity even if the request includes broader filter values

#### Scenario: Export supports PDF and spreadsheet outputs
- **WHEN** a user triggers remuneration export
- **THEN** the system offers PDF and spreadsheet output formats for the filtered remuneration dataset
