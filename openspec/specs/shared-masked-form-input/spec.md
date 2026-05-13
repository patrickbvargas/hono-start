# shared-masked-form-input Specification

## Purpose
Define the shared masked text input contract for the app-form layer so features can reuse CPF, CNPJ, and Brazilian phone masking without importing vendor masking APIs directly.

## Requirements

### Requirement: Shared masked form field preserves the app form contract
The system SHALL provide a shared masked text field through the existing app-form field registry so feature forms can use input masking without importing vendor masking APIs directly.

#### Scenario: Feature consumes shared masked field
- **WHEN** a feature renders a masked field through `form.AppField`
- **THEN** the field is available through the shared app-form registry
- **AND** the feature does not need to import masking helpers from the vendor library

### Requirement: Shared masked form field exposes built-in mask kinds
The system SHALL provide built-in shared mask kinds for CPF, CNPJ, and Brazilian phone values.

#### Scenario: Consumer uses built-in CPF mask
- **WHEN** a feature renders the shared masked field with the CPF mask kind
- **THEN** the input displays the CPF mask format during typing

#### Scenario: Consumer uses built-in CNPJ mask
- **WHEN** a feature renders the shared masked field with the CNPJ mask kind
- **THEN** the input displays the CNPJ mask format during typing

#### Scenario: Consumer uses built-in Brazilian phone mask
- **WHEN** a feature renders the shared masked field with the Brazilian phone mask kind
- **THEN** the input accepts supported Brazilian phone formats during typing
- **AND** the visible default mobile format follows the pattern `(99) 99999-9999`

### Requirement: Shared masked form field keeps visible length aligned with the selected mask
The system SHALL keep the input `maxLength` aligned with the visible mask used by the shared masked field.

#### Scenario: Built-in mask applies matching visible length
- **WHEN** a feature renders the shared masked field with a built-in mask kind
- **THEN** the input `maxLength` matches the longest visible format for that mask kind
- **AND** the consumer does not need to calculate that length manually
