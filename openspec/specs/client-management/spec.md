# client-management Specification

## Purpose
Define the client-management contract for firm-scoped list, detail, create, update, delete, restore, lookup-option, and validation behavior within the shared entity-management workflow.
## Requirements
### Requirement: List clients
The system SHALL display a paginated, sortable, filterable list of clients belonging to the authenticated user's firm, following the shared entity-management list contract.

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
- **THEN** only clients belonging to the authenticated user's firm are returned

### Requirement: View client details
The system SHALL allow authenticated users to inspect client details without leaving the list workflow.

#### Scenario: Open client details drawer
- **WHEN** a user selects the details action for a client row
- **THEN** the system opens a drawer showing the client's core fields and attachment section
- **AND** the list state remains preserved behind the drawer

#### Scenario: Details reflect persisted client data
- **WHEN** a client details drawer is opened
- **THEN** the system shows the persisted client type, full name, document, contact fields, and active status for that client

#### Scenario: Client details include attachment workflow context
- **WHEN** a client details drawer is opened
- **THEN** the drawer SHALL include the attachment section for that client
- **AND** the attachment section SHALL preserve the same detail-drawer section rhythm and skeleton treatment used by the rest of the drawer

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
- **THEN** the system creates the client record scoped to the authenticated user's firm
- **AND** the submitted client type lookup value is resolved by the server before persistence
- **AND** the stored `isActive` value reflects the form checkbox
- **AND** the stored document and phone values do not include mask characters
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the client list refreshes to include the new record

#### Scenario: Duplicate document in the same firm
- **WHEN** a user submits a client document already used by another client in the same firm
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
- **THEN** the system updates the client record in the authenticated user's firm
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

### Requirement: Client management has one authoritative feature slice
The system SHALL use `src/features/clients` as the only authoritative client-management feature implementation.

#### Scenario: Client route consumes promoted client slice
- **WHEN** the `/clientes` route composes the client-management screen
- **THEN** it SHALL import route-facing client functionality from `src/features/clients`
- **AND** it SHALL NOT import from the legacy suffixed client feature path

#### Scenario: Obsolete client implementation is removed
- **WHEN** contributors inspect client-management source code
- **THEN** there SHALL be no separate legacy client implementation alongside the promoted `src/features/clients` slice
- **AND** there SHALL be no `_v2` suffixed client feature path used by active source code

### Requirement: Client writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to client create and update writes so schema validation, normalization, pure business validation, and lookup-backed server checks remain consistently separated.

#### Scenario: Client schema uses only pure validation helpers
- **WHEN** the client create or update schema validates submitted fields
- **THEN** any schema-level refinement uses only pure helpers that do not require Prisma or persisted client state

#### Scenario: Pure client business validation is discoverable from the promoted slice
- **WHEN** a contributor needs to change a pure client validation rule
- **THEN** the authoritative implementation SHALL be discoverable under `src/features/clients/rules/`
- **AND** exported assertion entrypoints SHALL use an `assert...` prefix

#### Scenario: Client type selection is resolved at the server boundary
- **WHEN** a client create or update mutation receives a submitted client type lookup value
- **THEN** the server resolves that lookup value before persistence
- **AND** the server rejects unknown or disallowed selections with a user-friendly Portuguese error

#### Scenario: Client input is normalized separately from validation
- **WHEN** the client create or update flow canonicalizes document or optional text inputs
- **THEN** that normalization executes separately from the pure business validation helpers
- **AND** the normalized values are the ones persisted by the server

### Requirement: Client advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more client filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Client popover trigger shows active indicator
- **WHEN** a user applies client type, active-state, or deletion-visibility filters through the advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline search does not activate popover indicator
- **WHEN** a user changes only the inline client search field
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Clearing client popover filters removes active indicator
- **WHEN** all client filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

### Requirement: Reset client list filters
The system SHALL provide a clear-filters action on the client list filter surface that restores all client filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default client filters
- **WHEN** a user changes the inline client search field or any advanced client filter away from its validated default value
- **THEN** the client filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets client filters and first page
- **WHEN** a user activates `Limpar filtros` on the client list
- **THEN** the client query, type, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current client sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all client filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

