## ADDED Requirements

### Requirement: Canonical feature error catalogs
Each feature SHALL define a canonical Portuguese error catalog for user-facing validation, lookup, resource, and mutation failures owned by that feature.

#### Scenario: Feature errors come from a single catalog
- **WHEN** a feature throws or rethrows an expected user-facing error
- **THEN** the message SHALL be sourced from that feature's canonical error catalog
- **AND** the same message SHALL not need to be retyped in the catch-site classification logic

#### Scenario: Feature error text remains unchanged
- **WHEN** the canonical catalog is introduced for an existing feature
- **THEN** the Portuguese message shown to the user SHALL remain the same as before the change

### Requirement: Exact error matching uses canonical catalogs
The system SHALL allow exact error-message matching against a feature's canonical catalog so catch blocks can classify expected errors without duplicating literal message lists.

#### Scenario: Catch blocks classify expected errors with one catalog reference
- **WHEN** a feature API handler needs to preserve an expected error raised earlier in the call chain
- **THEN** it SHALL use the canonical catalog as the source of allowed exact messages
- **AND** it SHALL NOT repeat the same literal string values in a separate list at the call site

#### Scenario: Unknown errors still fall back safely
- **WHEN** an unexpected error does not match the canonical catalog
- **THEN** the handler SHALL continue to use the feature's generic fallback error message
- **AND** the unexpected error SHALL remain logged server-side
