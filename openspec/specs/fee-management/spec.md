## Purpose

Fee management defines the authenticated workflow for listing, viewing, creating, updating, deleting, restoring, and synchronizing fee records and their downstream remuneration and contract-status effects.

## Requirements

### Requirement: List fees
The system SHALL display a paginated, sortable, filterable list of fees available to the authenticated user, following the shared entity-management list contract and the fee visibility rules defined by role and allowed contract boundaries.

#### Scenario: Administrator sees firm-wide fees
- **WHEN** an administrator navigates to the fees route
- **THEN** the system displays fees belonging to the administrator's firm
- **AND** the list includes fees regardless of whether the administrator is assigned to the underlying contract

#### Scenario: Regular user sees only fees on allowed contracts
- **WHEN** a regular authenticated user navigates to the fees route
- **THEN** the system displays only fees in the same firm whose parent contracts are visible to that user through assignment-based access

#### Scenario: Fee list columns reflect the financial summary
- **WHEN** the fees list is loaded
- **THEN** the table shows columns for contract, revenue type, payment date, amount, installment number, remuneration-generation state, active state, and created date

#### Scenario: Query by parent contract number
- **WHEN** a user enters a free-text query in the fees list
- **THEN** the system matches fees whose parent contract process number contains the query text
- **AND** the existing firm scope and allowed-contract visibility rules remain enforced

#### Scenario: Filter by parent contract
- **WHEN** a user applies a contract filter
- **THEN** the list shows only fees linked to the selected contract in the authenticated user's scope

#### Scenario: Filter by parent revenue
- **WHEN** a user applies a revenue filter
- **THEN** the list shows only fees linked to the selected revenue in the authenticated user's scope

#### Scenario: Filter by payment date range
- **WHEN** a user applies `dateFrom` and `dateTo` filters
- **THEN** the list shows only fees whose payment date falls inside the selected range

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same fees view

### Requirement: View fee details
The system SHALL allow authenticated users with access to a fee to inspect fee details without leaving the list workflow.

#### Scenario: Open fee details drawer
- **WHEN** a user selects the details action for a visible fee row
- **THEN** the system opens a drawer showing the fee's payment fields, parent contract and revenue context, remuneration-generation state, and lifecycle metadata
- **AND** the list state remains preserved behind the drawer

#### Scenario: Detail access respects assignment visibility
- **WHEN** a regular user requests details for a fee whose parent contract is outside their assignment-based access
- **THEN** the server rejects the request before fee data is returned

### Requirement: Create fee against a revenue
The system SHALL allow authenticated users to create a fee in their own firm only when the submitted payload satisfies the fee and parent-resource business rules.

#### Scenario: Open create fee form
- **WHEN** an authenticated user clicks the create-fee action
- **THEN** a modal overlay opens with contract, revenue, payment date, amount, installment number, remuneration-generation, and "Ativo" inputs

#### Scenario: Successful fee creation
- **WHEN** an authenticated user submits a valid fee create form
- **THEN** the system creates the fee in the authenticated user's firm
- **AND** the submitted contract and revenue references are verified on the server
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the fees list refreshes to include the new record

#### Scenario: Fee must belong to selected revenue and firm
- **WHEN** a submitted fee references a revenue outside the authenticated user's firm or outside the selected contract context
- **THEN** the system rejects the submission before persistence

#### Scenario: Fee amount must be positive
- **WHEN** a user submits a fee amount less than or equal to zero
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Fee installment number must be at least one
- **WHEN** a user submits an installment number less than one
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Installment number must be unique while active
- **WHEN** a user submits a fee whose installment number matches another active fee on the same revenue
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Fee creation is blocked after all expected installments are paid
- **WHEN** a user submits a new fee for a revenue that already has all expected installments paid
- **THEN** the system rejects the submission with a Portuguese validation message

#### Scenario: Fee creation is blocked for read-only contracts
- **WHEN** a user submits a fee for a completed or cancelled contract
- **THEN** the system rejects the submission because the parent contract is read-only

### Requirement: Edit fee within writable boundaries
The system SHALL allow only writable fee updates according to role, assignment visibility, contract lifecycle state, and persisted fee integrity rules.

#### Scenario: Administrator can edit firm fee
- **WHEN** an administrator edits a fee in their firm whose parent contract remains writable
- **THEN** the system allows the update if the submitted payload passes validation

#### Scenario: Regular user can edit fee on allowed writable contract
- **WHEN** a regular user edits a fee whose parent contract is within their allowed contract boundaries and remains writable
- **THEN** the system allows the update if the submitted payload passes validation

#### Scenario: Regular user cannot edit fee outside allowed contract boundaries
- **WHEN** a regular user attempts to edit a fee whose parent contract is outside their assignment-based access
- **THEN** the server rejects the update before any data is changed

#### Scenario: Updating to a duplicate active installment number is rejected
- **WHEN** a user updates a fee so that its installment number duplicates another active fee on the same revenue
- **THEN** the system rejects the update with a Portuguese validation message

#### Scenario: Updating a fee preserves authoritative parent checks
- **WHEN** a user updates a fee and changes its parent contract or revenue selection
- **THEN** the server verifies the new parent references belong to the same authenticated firm and remain mutually consistent before persistence

### Requirement: Fee writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to fee writes so schema validation, normalization, pure business validation, and persisted resource checks remain consistently separated.

#### Scenario: Pure fee business validation is discoverable from the feature rules directory
- **WHEN** a contributor needs to change a fee business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable under `src/features/fees/rules/`
- **AND** exported throwing assertion entrypoints SHALL use an `assert...` prefix

#### Scenario: Fee API writes use the canonical rules directory
- **WHEN** the fee create or update flow enforces non-Prisma fee rules
- **THEN** those rules SHALL reuse modules under `src/features/fees/rules/`
- **AND** parent-resource reads and persisted-state checks MAY remain in API-side or data-side helpers

#### Scenario: Fee schema parse remains authoritative for pure write validation
- **WHEN** the fee create or update schema successfully parses a submitted payload
- **THEN** that payload SHALL be valid for the feature's pure non-Prisma fee rules
- **AND** any remaining server-side fee checks SHALL be limited to parent-resource or persisted-state concerns

#### Scenario: Fee validation tests are colocated with the feature
- **WHEN** the fee validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical fee rules

### Requirement: Fee writes update derived financial state
The system SHALL treat persisted fee records as the source of truth for revenue payment progress and downstream contract completion state.

#### Scenario: Revenue paid value is derived from active fees
- **WHEN** a fee is created, updated, deleted, or restored
- **THEN** the parent revenue's paid value is derived from its down payment plus the sum of active fee amounts

#### Scenario: Revenue installments paid are derived from active fees
- **WHEN** a fee is created, updated, deleted, or restored
- **THEN** the parent revenue's installments-paid state is derived from the count of active fee records on that revenue

#### Scenario: Contract auto-completes when all active revenues are fully paid
- **WHEN** a fee write causes every active revenue on a contract to become fully paid
- **THEN** the system transitions the contract to completed if status change is allowed

#### Scenario: Status lock prevents automatic completion
- **WHEN** a fee write causes every active revenue on a contract to become fully paid but the contract has status change locked
- **THEN** the contract remains in its current status

### Requirement: Fee remuneration-generation behavior is preserved on fee writes
The system SHALL persist whether a fee generates remunerations and SHALL execute the documented remuneration side effects for fee lifecycle events.

#### Scenario: Fee created with remuneration generation enabled
- **WHEN** a user creates a fee with remuneration generation enabled
- **THEN** the system creates remunerations for the eligible contract assignments defined by the business rules

#### Scenario: Fee created with remuneration generation disabled
- **WHEN** a user creates a fee with remuneration generation disabled
- **THEN** the fee is recorded without creating remuneration records

#### Scenario: Fee update recalculates linked system-generated remunerations
- **WHEN** a user updates a fee that has remuneration generation enabled
- **THEN** the system recalculates linked system-generated remunerations according to the current fee values
- **AND** manual remuneration overrides remain unchanged

#### Scenario: Fee update with remuneration generation disabled preserves existing remunerations
- **WHEN** a user updates a fee and remuneration generation is disabled
- **THEN** previously created remunerations linked to that fee remain unchanged

### Requirement: Fee lifecycle actions respect role and dependency rules
The system SHALL allow administrators to soft-delete and restore fees while protecting fees whose active dependents would make the lifecycle action invalid.

#### Scenario: Administrator deletes fee without active-remuneration conflict
- **WHEN** an administrator confirms deletion for a fee whose linked remunerations can be soft-deleted consistently
- **THEN** the system sets `deletedAt` on the fee record
- **AND** linked remunerations are soft-deleted
- **AND** the fee no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Administrator restores fee
- **WHEN** an administrator confirms restoration for a soft-deleted fee
- **THEN** the system clears `deletedAt`
- **AND** linked remunerations are restored
- **AND** the fee becomes visible again according to the current filters

#### Scenario: Regular user cannot delete or restore fees
- **WHEN** a regular user attempts to trigger fee delete or restore
- **THEN** the server rejects the action before fee state changes

### Requirement: Fee route and option queries derive scope from session
The system SHALL derive tenant scope and role-aware fee access from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Authenticated users can access fees route
- **WHEN** an authenticated user navigates to the fees route
- **THEN** the route allows access to the fee-management screen

#### Scenario: Unauthenticated users cannot access fee management
- **WHEN** an unauthenticated actor navigates to the fees route or triggers a fee server function
- **THEN** access is denied before fee data is returned or modified

#### Scenario: Server derives firm scope from session
- **WHEN** any fee list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored

#### Scenario: Revenue options include only selectable parent records
- **WHEN** the fee form loads contract and revenue options
- **THEN** contract options follow the authenticated user's allowed contract boundaries
- **AND** revenue options return only active, non-deleted revenues in the authenticated user's firm whose parent contracts remain writable
