## ADDED Requirements

### Requirement: Public authentication screens use the shared product UI language
The system SHALL render the `/login` and `/recuperar-senha` screens with the repository's shared UI composition so the public authentication experience remains consistent with the rest of the product while preserving the existing authentication behavior.

#### Scenario: Login screen keeps the existing workflow with shared UI treatment
- **WHEN** an unauthenticated user opens `/login`
- **THEN** the system shows the same login fields, help text, remember-me control, password-reset link, and submit action
- **AND** the screen uses the shared product UI language instead of a one-off custom visual system

#### Scenario: Password-reset screen keeps the existing workflow with shared UI treatment
- **WHEN** an unauthenticated user opens `/recuperar-senha`
- **THEN** the system shows the same request and reset-completion flows, token-driven mode switching, and safe user feedback
- **AND** the screen uses the shared product UI language instead of a one-off custom visual system
