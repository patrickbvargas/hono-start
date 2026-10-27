## MODIFIED Requirements

### Requirement: Create client
The system SHALL allow authenticated users to create a client in their own firm using type-dependent form behavior, masked contact inputs, and server-side validation.

#### Scenario: Open create form
- **WHEN** an authenticated user clicks the create-client action
- **THEN** a modal overlay opens with the client creation form
- **AND** the form includes the client type selector and an "Ativo" checkbox defaulting to checked

#### Scenario: Type drives labels and validation
- **WHEN** the selected client type is `INDIVIDUAL`
- **THEN** the primary name field uses the individual label
- **AND** the document field is validated as CPF
- **AND** the document input shows the CPF mask while the user types

#### Scenario: Company type drives labels and validation
- **WHEN** the selected client type is `COMPANY`
- **THEN** the primary name field uses the company label
- **AND** the document field is validated as CNPJ
- **AND** the document input shows the CNPJ mask while the user types

#### Scenario: Phone input uses Brazilian mask formatting
- **WHEN** a user fills the optional phone field in the create form
- **THEN** the phone input shows the shared Brazilian phone mask while the user types
- **AND** the visible default mobile format follows the pattern `(99) 99999-9999`
- **AND** the persisted phone value is normalized without mask characters

#### Scenario: Successful creation
- **WHEN** an authenticated user submits a valid create form
- **THEN** the system creates one company-wide client record without firmId
- **AND** the submitted client type lookup value is resolved by the server before persistence
- **AND** the stored `isActive` value reflects the form checkbox
- **AND** the stored document and phone values do not include mask characters
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the client list refreshes to include the new record

#### Scenario: Duplicate document in the company
- **WHEN** a user submits a client document already used by another client anywhere in the company
- **THEN** the system rejects the submission
- **AND** the form shows a Portuguese validation message indicating the document is already registered

### Requirement: Edit client
The system SHALL allow authenticated users to update client profile fields, including the client type, while preserving masked input behavior and normalized persistence.

#### Scenario: Open edit form
- **WHEN** an authenticated user clicks the edit action on a client row
- **THEN** a modal overlay opens pre-populated with the client's current data
- **AND** the "Ativo" checkbox reflects the client's current `isActive` value

#### Scenario: Client type remains editable
- **WHEN** a user edits an existing client
- **THEN** the client type remains editable in the form
- **AND** changing the selected type updates the form labels
- **AND** changing the selected type updates the document mask and CPF or CNPJ expectations before submission

#### Scenario: Successful edit
- **WHEN** an authenticated user submits a valid edit form
- **THEN** the system updates the shared client record for every branch
- **AND** the stored document and phone values do not include mask characters
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the list row and details drawer reflect the updated data

#### Scenario: Edit enforces type-specific document validation
- **WHEN** a user submits an edited client with an invalid CPF or CNPJ for the selected client type
- **THEN** the system rejects the submission with a Portuguese validation message

### Requirement: Soft-delete and restore client
The system SHALL allow administrators to soft-delete and restore clients while protecting clients that still have active dependents.

#### Scenario: Administrator deletes a client
- **WHEN** an administrator confirms deletion for a client with no blocking dependents
- **THEN** the system sets `deletedAt` on the client record
- **AND** the client no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Delete blocked by active contracts
- **WHEN** an administrator attempts to delete a client that still has active contracts in any branch
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
- **AND** eligible global clients are included, independent of creation branch

#### Scenario: Client type option query returns lookup rows by stable value
- **WHEN** the client form loads client type options
- **THEN** the option query returns all `ClientType` lookup rows ordered by `label`
- **AND** the field binds the selected option by lookup `value`
- **AND** inactive lookup rows remain visible as disabled options

### Requirement: Client route and mutations enforce authenticated firm scope
The system SHALL enforce current Organization membership and client action grants from the authenticated session. Client master reads and writes SHALL be company-wide without firmId; counts and financial summaries SHALL remain scoped to the current Firm. Client-supplied authority SHALL NOT grant access.

#### Scenario: Authenticated users can access the client route
- **WHEN** an authenticated user navigates to the clients route
- **THEN** the route allows access to the client-management screen

#### Scenario: Unauthenticated users cannot access client management
- **WHEN** an unauthenticated actor navigates to the clients route or triggers a client server function
- **THEN** access is denied before client data is returned or modified

#### Scenario: Server derives client firm scope from session
- **WHEN** any client list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server verifies current membership and action grants, with global master access and current-Firm operation summaries
- **AND** any client-supplied tenant scope is ignored

### Requirement: List clients
The system SHALL display a paginated, sortable, filterable list of company-wide clients visible under current Organization grants, following the shared entity-management list contract.

#### Scenario: Default desktop list view
- **WHEN** an authenticated user navigates to the clients route on a desktop-width viewport without a saved list-surface preference
- **THEN** the system displays a table whose first column shows the internal client id
- **AND** the table also shows columns for client name, document, type, contract count, and active status
- **AND** the list is paginated with the default page size

#### Scenario: Desktop user can switch list surface
- **WHEN** an authenticated user uses the shared list-surface toggle on a desktop-width viewport
- **THEN** the system allows switching between the table surface and a card-based list surface
- **AND** the selected desktop surface is persisted through the shared global entity-view preference

#### Scenario: Default mobile list view
- **WHEN** an authenticated user navigates to the clients route on a mobile-width viewport
- **THEN** the system displays a paginated list of client cards instead of the table
- **AND** each card shows the client id through the shared card header, client name, document, type, contract count, and active status
- **AND** the list uses the same default page size and URL-driven pagination state as the desktop table

#### Scenario: Mobile viewport forces the card surface
- **WHEN** an authenticated user has previously saved the table surface and later opens the clients route on a mobile-width viewport
- **THEN** the system ignores the saved desktop table preference for that viewport
- **AND** the route continues to display the card-based client list

#### Scenario: Mobile card opens client details
- **WHEN** a user activates a client card in the client list
- **THEN** the system opens the same client details drawer used by the desktop list actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Filter by name or document
- **WHEN** a user types a value in the client search field
- **THEN** the visible client list shows only clients whose full name or document contains the typed value

#### Scenario: Filter by client type
- **WHEN** a user applies one or more client type filters using lookup values
- **THEN** the visible client list shows only clients whose type matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the client list to show deleted records or all records
- **THEN** the visible client list updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Filter by active state
- **WHEN** a user applies an active or inactive client filter
- **THEN** the visible client list applies the `isActive` constraint independently from the deleted-state filter

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the desktop clients table
- **THEN** the list reloads sorted by client id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filters, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same client list state for the active viewport surface

#### Scenario: Firm isolation
- **WHEN** the client list is loaded
- **THEN** eligible company-wide clients are returned, with contract counts restricted to the current Firm
