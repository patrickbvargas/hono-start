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
