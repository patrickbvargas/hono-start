## MODIFIED Requirements

### Requirement: Edit client
The system SHALL allow authenticated users to update client profile fields, including the client type.

#### Scenario: Client type remains editable
- **WHEN** a user edits an existing client
- **THEN** the client type remains editable in the form
- **AND** changing the selected type updates the form labels and CPF or CNPJ expectations before submission

#### Scenario: Edit enforces type-specific document validation
- **WHEN** a user submits an edited client with an invalid CPF or CNPJ for the selected client type
- **THEN** the system rejects the submission with a Portuguese validation message
