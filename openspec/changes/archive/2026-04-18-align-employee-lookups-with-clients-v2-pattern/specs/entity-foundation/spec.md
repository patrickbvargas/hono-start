## ADDED Requirements

### Requirement: Equivalent entity-slice responsibilities stay aligned with the reference slice
The system SHALL treat `src/features/clients_v2` as the reference slice for equivalent entity-feature responsibilities, so employee-slice internals keep the same boundary shape, naming, and public-surface discipline wherever both slices perform the same job.

#### Scenario: Equivalent boundaries follow the reference slice
- **WHEN** `employees` and `clients_v2` both expose route-facing queries, route-facing mutations, feature form orchestration, feature option loading, lookup-backed query helpers, or lookup-backed rule assertions
- **THEN** those responsibilities SHALL remain in the same feature-local layer and use comparably named entrypoints
- **AND** the employee slice SHALL not keep extra convenience barrels or aggregate helper entrypoints for those equivalent responsibilities when the reference slice does not need them

### Requirement: Multi-lookup slices extend the reference naming instead of replacing it
The system SHALL require feature slices that validate more than one lookup family in the same write flow to extend the reference slice naming and responsibility split rather than introducing a separate aggregate house pattern.

#### Scenario: Equivalent lookup responsibilities keep aligned names across slices
- **WHEN** two feature slices implement the same lookup-backed write responsibilities such as lookup existence checks, lookup selectability checks, or fetching a lookup row by stable `value`
- **THEN** those responsibilities SHALL use aligned naming across the slices
- **AND** a multi-lookup slice SHALL not collapse those responsibilities into slice-specific aggregate vocabulary when singular reference names already exist

#### Scenario: A better shared term is synchronized across the reference slice
- **WHEN** a refactor discovers that the current reference-slice name for an equivalent responsibility is weaker than a clearer shared term
- **THEN** the repository SHALL adopt the better term consistently across the affected slices in the same change
- **AND** the reference slice SHALL not keep the older name while another slice adopts the newer one for the same responsibility
