## ADDED Requirements

### Requirement: Behavior-changing work includes Vitest coverage
The project SHALL require Vitest coverage for every feature, refactor, or new-code change that alters behavior, shared contracts, route orchestration, validation, data access, or reusable abstractions.

#### Scenario: Feature behavior changes
- **WHEN** a feature change adds or modifies user-facing behavior, validation, data access, permissions, lifecycle handling, or orchestration
- **THEN** the change SHALL include focused Vitest coverage for the changed behavior

#### Scenario: Shared abstraction changes
- **WHEN** shared code such as hooks, components, schemas, utilities, or infrastructure is added or refactored in a behavior-relevant way
- **THEN** the change SHALL include Vitest coverage for the shared contract that consumers rely on

#### Scenario: Documentation-only or generated-only change
- **WHEN** a change only updates documentation, generated artifacts, formatting, or mechanical metadata without changing runtime behavior or shared contracts
- **THEN** the change MAY omit new Vitest coverage
- **AND** the implementation summary SHALL identify why no new test is required

#### Scenario: Test coverage is impractical
- **WHEN** Vitest coverage cannot be added for a behavior-changing change because of tooling, environment, or scope constraints
- **THEN** the change SHALL document the reason
- **AND** it SHALL include the closest feasible verification step before completion
