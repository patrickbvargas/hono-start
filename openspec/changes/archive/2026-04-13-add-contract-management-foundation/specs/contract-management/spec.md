## ADDED Requirements

### Requirement: List contracts
The system SHALL display a paginated, sortable, filterable list of contracts available to the authenticated user, following the shared entity-management list contract and the contract visibility rules defined by role and assignment.

#### Scenario: Administrator sees firm-wide contracts
- **WHEN** an administrator navigates to the contracts route
- **THEN** the system displays contracts belonging to the administrator's firm
- **AND** the list includes contracts regardless of whether the administrator is assigned to them

#### Scenario: Regular user sees only assigned contracts
- **WHEN** a regular authenticated user navigates to the contracts route
- **THEN** the system displays only contracts in the same firm where that user is actively assigned

#### Scenario: Contract list columns reflect the aggregate summary
- **WHEN** the contracts list is loaded
- **THEN** the table shows columns for process number, client, legal area, contract status, fee percentage, active state, and created date

#### Scenario: Filter by client
- **WHEN** a user applies a client filter
- **THEN** the list shows only contracts linked to the selected client in the authenticated user's firm

#### Scenario: Filter by legal area
- **WHEN** a user applies one or more legal-area filters using lookup values
- **THEN** the list shows only contracts whose legal area matches the selected lookup values

#### Scenario: Filter by contract status
- **WHEN** a user applies one or more contract-status filters using lookup values
- **THEN** the list shows only contracts whose current status matches the selected lookup values

#### Scenario: Deleted-state and active-state filters remain independent
- **WHEN** a user changes the deleted-state filter or the active-state filter
- **THEN** the system applies the selected filter independently from the other state filter

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same contracts view

### Requirement: View contract details
The system SHALL allow authenticated users with access to a contract to inspect contract details without leaving the list workflow.

#### Scenario: Open contract details drawer
- **WHEN** a user selects the details action for a visible contract row
- **THEN** the system opens a drawer showing the contract's core fields, team summary, and revenue summary
- **AND** the list state remains preserved behind the drawer

#### Scenario: Detail access respects assignment visibility
- **WHEN** a regular user requests details for a contract they are not assigned to
- **THEN** the server rejects the request before contract data is returned

### Requirement: Create contract as an aggregate
The system SHALL allow authenticated users to create a contract in their own firm only when the submitted payload satisfies the required aggregate rules for client, assignments, and revenues.

#### Scenario: Open create contract form
- **WHEN** an authenticated user clicks the create-contract action
- **THEN** a modal overlay opens with contract fields, assignment inputs, revenue-plan inputs, and an "Ativo" checkbox defaulting to checked

#### Scenario: Successful contract creation
- **WHEN** an authenticated user submits a valid contract create form
- **THEN** the system creates the contract in the authenticated user's firm
- **AND** the system creates at least one contract assignment
- **AND** the system creates at least one revenue plan in the same transaction
- **AND** the submitted lookup values are resolved by the server before persistence
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the contracts list refreshes to include the new record

#### Scenario: Contract creation requires a client
- **WHEN** a user submits the create form without a selected client
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Contract creation requires at least one assignment
- **WHEN** a user submits the create form without any collaborator assignment
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Contract creation requires at least one revenue
- **WHEN** a user submits the create form without any revenue plan
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Revenue types must be unique within an active contract
- **WHEN** a user submits a create form with duplicate active revenue types for the same contract
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Process number is unique per firm
- **WHEN** a user submits a process number already used by another contract in the same firm
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Inactive or deleted client cannot be used in contract creation
- **WHEN** a user submits a create form referencing a client that is inactive or soft-deleted
- **THEN** the system rejects the submission

### Requirement: Contract assignments obey collaborator rules
The system SHALL enforce assignment-type compatibility, uniqueness, and team-composition rules on contract writes.

#### Scenario: Same employee cannot be assigned twice while active
- **WHEN** a user submits the same employee more than once in the active assignment set for one contract
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Assignment type must match employee type
- **WHEN** a user submits an assignment type that is not compatible with the selected employee's type
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Solo handling requires a responsible lawyer
- **WHEN** a contract submission omits any responsible lawyer assignment
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Referral relationships must satisfy percentage rules
- **WHEN** a contract submission includes recommending and recommended assignments whose percentages violate the referral rule
- **THEN** the system rejects the submission with a Portuguese validation message

### Requirement: Edit contract within writable boundaries
The system SHALL allow only writable contract updates according to role, assignment visibility, lifecycle state, and status-lock semantics.

#### Scenario: Administrator can edit firm contract
- **WHEN** an administrator edits a writable contract in their firm
- **THEN** the system allows the update if the submitted payload passes validation

#### Scenario: Regular user can edit assigned writable contract
- **WHEN** a regular user edits a contract they are assigned to and the contract remains writable
- **THEN** the system allows the update if the submitted payload passes validation

#### Scenario: Regular user cannot edit unassigned contract
- **WHEN** a regular user attempts to edit a contract they are not assigned to
- **THEN** the server rejects the update before any data is changed

#### Scenario: Completed contracts are read-only
- **WHEN** a user attempts to update a completed contract
- **THEN** the system rejects the update because the contract is read-only

#### Scenario: Cancelled contracts are read-only
- **WHEN** a user attempts to update a cancelled contract
- **THEN** the system rejects the update because the contract is read-only

#### Scenario: Only administrators can control status-change locking
- **WHEN** a regular user submits an update that changes the status-lock setting
- **THEN** the server rejects the update before persistence

### Requirement: Contract lifecycle actions respect role and dependency rules
The system SHALL allow administrators to soft-delete and restore contracts while protecting contracts whose active dependents would make the lifecycle action invalid.

#### Scenario: Administrator deletes contract without active revenues
- **WHEN** an administrator confirms deletion for a contract that has no active revenues
- **THEN** the system sets `deletedAt` on the contract record
- **AND** the contract no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Delete blocked by active revenues
- **WHEN** an administrator attempts to delete a contract that still has active revenues
- **THEN** the system rejects the deletion with an explanatory Portuguese error message

#### Scenario: Administrator restores contract
- **WHEN** an administrator confirms restoration for a soft-deleted contract
- **THEN** the system clears `deletedAt`
- **AND** the contract becomes visible again according to the current filters

#### Scenario: Regular user cannot delete or restore contracts
- **WHEN** a regular user attempts to trigger contract delete or restore
- **THEN** the server rejects the action before contract state changes

### Requirement: Contract option and lookup queries support aggregate workflows
The system SHALL expose option queries needed by the contract form while preserving the repository's business-entity and lookup-query rules.

#### Scenario: Client options include selectable business entities only
- **WHEN** the contract form loads client options
- **THEN** the option query returns only clients in the authenticated user's firm where `deletedAt = null` and `isActive = true`

#### Scenario: Employee options include selectable collaborators only
- **WHEN** the contract form loads employee options for team assignment
- **THEN** the option query returns only employees in the authenticated user's firm where `deletedAt = null` and `isActive = true`

#### Scenario: Lookup options bind by stable value
- **WHEN** the contract form or filters load legal area, contract status, assignment type, or revenue type options
- **THEN** the option query returns lookup rows ordered by `label`
- **AND** the fields bind selected values by lookup `value`
- **AND** inactive lookup rows remain visible as disabled options

### Requirement: Contract route and server operations derive scope from session
The system SHALL derive tenant scope and role-aware contract access from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Authenticated users can access contracts route
- **WHEN** an authenticated user navigates to the contracts route
- **THEN** the route allows access to the contract-management screen

#### Scenario: Unauthenticated users cannot access contract management
- **WHEN** an unauthenticated actor navigates to the contracts route or triggers a contract server function
- **THEN** access is denied before contract data is returned or modified

#### Scenario: Server derives firm scope from session
- **WHEN** any contract list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored
