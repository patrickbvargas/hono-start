## ADDED Requirements

### Requirement: List clients
The system SHALL display a paginated, sortable, filterable list of clients belonging to the authenticated user's firm, following the shared entity-management list contract.

#### Scenario: Default list view
- **WHEN** an authenticated user navigates to the clients route
- **THEN** the system displays a table with columns for client name, document, type, active status, and created date
- **AND** the list is paginated with the default page size

#### Scenario: Filter by name or document
- **WHEN** a user types a value in the client search field
- **THEN** the table shows only clients whose full name or document contains the typed value

#### Scenario: Filter by client type
- **WHEN** a user applies one or more client type filters using lookup values
- **THEN** the table shows only clients whose type matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the client list to show deleted records or all records
- **THEN** the table updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Filter by active state
- **WHEN** a user applies an active or inactive client filter
- **THEN** the table applies the `isActive` constraint independently from the deleted-state filter

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filters, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same client list view

#### Scenario: Firm isolation
- **WHEN** the client list is loaded
- **THEN** only clients belonging to the authenticated user's firm are returned

### Requirement: View client details
The system SHALL allow authenticated users to inspect client details without leaving the list workflow.

#### Scenario: Open client details drawer
- **WHEN** a user selects the details action for a client row
- **THEN** the system opens a drawer showing the client's core fields
- **AND** the list state remains preserved behind the drawer

#### Scenario: Details reflect persisted client data
- **WHEN** a client details drawer is opened
- **THEN** the system shows the persisted client type, full name, document, contact fields, and active status for that client

### Requirement: Create client
The system SHALL allow authenticated users to create a client in their own firm using type-dependent form behavior and server-side validation.

#### Scenario: Open create form
- **WHEN** an authenticated user clicks the create-client action
- **THEN** a modal overlay opens with the client creation form
- **AND** the form includes the client type selector and an "Ativo" checkbox defaulting to checked

#### Scenario: Type drives labels and validation
- **WHEN** the selected client type is `INDIVIDUAL`
- **THEN** the primary name field uses the individual label and the document field is validated as CPF

#### Scenario: Company type drives labels and validation
- **WHEN** the selected client type is `COMPANY`
- **THEN** the primary name field uses the company label and the document field is validated as CNPJ

#### Scenario: Successful creation
- **WHEN** an authenticated user submits a valid create form
- **THEN** the system creates the client record scoped to the authenticated user's firm
- **AND** the submitted client type lookup value is resolved by the server before persistence
- **AND** the stored `isActive` value reflects the form checkbox
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the client list refreshes to include the new record

#### Scenario: Duplicate document in the same firm
- **WHEN** a user submits a client document already used by another client in the same firm
- **THEN** the system rejects the submission
- **AND** the form shows a Portuguese validation message indicating the document is already registered

### Requirement: Edit client
The system SHALL allow authenticated users to update client profile fields except for the immutable client type.

#### Scenario: Open edit form
- **WHEN** an authenticated user clicks the edit action on a client row
- **THEN** a modal overlay opens pre-populated with the client's current data
- **AND** the "Ativo" checkbox reflects the client's current `isActive` value

#### Scenario: Client type remains fixed
- **WHEN** a user edits an existing client
- **THEN** the client type is shown as read-only or otherwise non-editable
- **AND** the update flow does not allow changing the persisted client type

#### Scenario: Successful edit
- **WHEN** an authenticated user submits a valid edit form
- **THEN** the system updates the client record in the authenticated user's firm
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the list row and details drawer reflect the updated data

#### Scenario: Edit enforces type-specific document validation
- **WHEN** a user submits an edited client with an invalid CPF or CNPJ for the persisted client type
- **THEN** the system rejects the submission with a Portuguese validation message

### Requirement: Soft-delete and restore client
The system SHALL allow administrators to soft-delete and restore clients while protecting clients that still have active dependents.

#### Scenario: Administrator deletes a client
- **WHEN** an administrator confirms deletion for a client with no blocking dependents
- **THEN** the system sets `deletedAt` on the client record
- **AND** the client no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Delete blocked by active contracts
- **WHEN** an administrator attempts to delete a client that still has active contracts
- **THEN** the system rejects the deletion
- **AND** an explanatory Portuguese error message is shown

#### Scenario: Administrator restores a client
- **WHEN** an administrator confirms restoration for a soft-deleted client
- **THEN** the system clears `deletedAt`
- **AND** the client becomes visible again according to the current list filters

#### Scenario: Regular user cannot delete or restore
- **WHEN** a regular authenticated user views the clients list
- **THEN** delete and restore actions are not available to that user
- **AND** any direct attempt to trigger client delete or restore is rejected by the server

### Requirement: Client option queries return selectable business entities only
The system SHALL expose client option queries for downstream form usage using the shared business-entity selectable-options rule.

#### Scenario: Client option query excludes inactive and deleted rows
- **WHEN** a client option query is executed for another feature's form
- **THEN** it returns only clients where `deletedAt = null` and `isActive = true`
- **AND** only clients from the authenticated user's firm are included

#### Scenario: Client type option query returns lookup rows by stable value
- **WHEN** the client form loads client type options
- **THEN** the option query returns all `ClientType` lookup rows ordered by `label`
- **AND** the field binds the selected option by lookup `value`
- **AND** inactive lookup rows remain visible as disabled options

### Requirement: Client route and mutations enforce authenticated firm scope
The system SHALL enforce client access and tenant scope from the authenticated session rather than from client-provided input.

#### Scenario: Authenticated users can access the client route
- **WHEN** an authenticated user navigates to the clients route
- **THEN** the route allows access to the client-management screen

#### Scenario: Unauthenticated users cannot access client management
- **WHEN** an unauthenticated actor navigates to the clients route or triggers a client server function
- **THEN** access is denied before client data is returned or modified

#### Scenario: Server derives client firm scope from session
- **WHEN** any client list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored
