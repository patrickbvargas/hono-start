## ADDED Requirements

### Requirement: Contract form sections use tabbed organization
The system SHALL organize the contract create and edit form into visible subsections for core contract data, collaborator assignments, and revenue plans while preserving a single aggregate form submission.

#### Scenario: Contract form shows tabbed aggregate sections
- **WHEN** a user opens the contract create or edit form
- **THEN** the form shows tabs for `Dados`, `Colaboradores`, and `Receitas`
- **AND** core contract fields are shown in `Dados`
- **AND** collaborator assignment rows are shown in `Colaboradores`
- **AND** revenue-plan rows are shown in `Receitas`

#### Scenario: Submit still saves one aggregate
- **WHEN** a user fills fields across multiple contract form tabs and submits the form
- **THEN** the system validates and submits one aggregate contract payload
- **AND** the existing create or edit success behavior is preserved

#### Scenario: Hidden assignment errors are signaled after submit
- **WHEN** a user submits the contract form with assignment validation errors while another tab is visible
- **THEN** the `Colaboradores` tab shows an error indicator
- **AND** the visible form area communicates in Portuguese that another subsection has errors

#### Scenario: Hidden revenue errors are signaled after submit
- **WHEN** a user submits the contract form with revenue validation errors while another tab is visible
- **THEN** the `Receitas` tab shows an error indicator
- **AND** the visible form area communicates in Portuguese that another subsection has errors

#### Scenario: Array-level business errors are associated with their tabs
- **WHEN** contract validation emits an error for the `assignments` array
- **THEN** the `Colaboradores` tab is marked as having errors
- **AND** when contract validation emits an error for the `revenues` array
- **THEN** the `Receitas` tab is marked as having errors

#### Scenario: Tab error state clears after correction
- **WHEN** a user corrects subsection validation errors and submits a valid contract form
- **THEN** subsection tab error indicators are no longer shown
- **AND** the modal closes according to the existing successful save behavior
