# Spec: contract-form-sections

## Purpose

Define direct team editing, guided revenue editing and consistent row actions in contract forms.

## Requirements

### Requirement: Direct contract team editing
The contract create and edit form SHALL show each collaborator and assignment field without requiring expansion. Removal SHALL be available beside each row. Existing limits, validation and aligned add actions SHALL remain intact.

#### Scenario: Open a new contract
- **WHEN** the contract form opens with an empty team row
- **THEN** collaborator and assignment inputs are immediately visible

#### Scenario: Add or remove a collaborator
- **WHEN** a collaborator is added
- **THEN** the new row is visible and its first field receives focus
- **WHEN** a preceding row is removed
- **THEN** surviving row values and input identity are preserved

### Requirement: Guided revenue editing
Incomplete or invalid revenues SHALL initially show their fields and SHALL allow manual collapse. Submission attempts SHALL reopen invalid revenues. Complete revenues SHALL be collapsible with a summary containing type, total and installment count. Type and total SHALL precede payment details. Added revenues SHALL open and receive focus at their first field. Validation failures SHALL expose affected revenue fields without discarding values.

#### Scenario: Add a revenue
- **WHEN** the user adds a revenue
- **THEN** its fields are open and its type field receives focus

#### Scenario: Review a complete revenue
- **WHEN** a complete revenue is collapsed
- **THEN** its summary displays type, formatted total and installment count

#### Scenario: Invalid revenue
- **WHEN** the form initially shows incomplete revenue data or contract submission reveals a revenue validation failure
- **THEN** affected revenue fields are visible and retain entered values

#### Scenario: Narrow viewport
- **WHEN** the form is used on a narrow or short screen
- **THEN** fields and removal actions remain reachable through the existing modal scroll area

#### Scenario: Manual collapse
- **WHEN** a user collapses an incomplete revenue
- **THEN** it stays collapsed until the user opens it or a new submission attempt reveals a validation failure

### Requirement: Consistent removal action geometry
Team and revenue removal buttons SHALL use the same height as the adjacent inputs, a visible outline, and bottom alignment.

#### Scenario: Removal beside inputs
- **WHEN** team or revenue fields are displayed
- **THEN** the removal button matches their control height and remains aligned beside them
