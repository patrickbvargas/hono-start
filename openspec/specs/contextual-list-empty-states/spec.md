# Spec: contextual-list-empty-states

## Purpose

Define contextual collection empty states, filter clearing, authorized actions and empty-page recovery.

## Requirements

### Requirement: Contextual empty results
Primary collection tables and cards SHALL share an empty presentation with an icon, title, explanation and applicable action. Existing loading and error states SHALL remain separate. Contextual tables SHALL retain their existing fallback messages.

#### Scenario: No filtered matches
- **WHEN** a primary collection has zero authorized records and any non-default search/filter value
- **THEN** it explains no results match and offers Limpar filtros instead of creation

#### Scenario: Default filters
- **WHEN** only route defaults, sorting or pagination are present
- **THEN** these values alone do not count as applied filters

### Requirement: Clear through existing filter flow
Limpar filtros SHALL use the same controller as the filter fields, cancel pending search debounce, reset form values and filter URL values, and return to page 1 while preserving sort and page size. Relationship filters such as feeId and entityId SHALL also clear.

#### Scenario: Clear while search is pending
- **WHEN** a user clears results while a search submission is debounced
- **THEN** no delayed submission restores the cleared search and displayed fields match defaults

### Requirement: Authorized creation and informational empty states
Unfiltered empty clients, employees, contracts, receipts and expenses SHALL offer their existing creation modal only with the matching create grant. Copy SHALL describe the authorized scope without asserting global absence. Remunerations and audit SHALL explain their source with no create action; pending work SHALL communicate no current visible pending work.

#### Scenario: Create a record
- **WHEN** an authorized user chooses the empty collection create action
- **THEN** the existing create modal opens with the same behavior as the header action

#### Scenario: No creation grant
- **WHEN** a user lacks the corresponding create grant
- **THEN** empty copy remains informative and no create button is rendered

#### Scenario: Derived collection
- **WHEN** remunerations, audit or pending work has no results without applied filters
- **THEN** the collection displays its domain-specific explanation and no create action

### Requirement: Empty page recovery
A page with zero rows and positive authorized total SHALL offer returning to page 1 and SHALL NOT claim the collection has no records.

#### Scenario: Last page becomes empty
- **WHEN** a deletion or shared URL leaves the selected page beyond available records
- **THEN** an Ir para a primeira página action preserves filters, sorting and page size
