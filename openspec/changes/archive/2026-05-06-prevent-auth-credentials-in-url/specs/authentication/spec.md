## ADDED Requirements

### Requirement: Public credential forms keep secrets out of the browser URL
The system SHALL ensure that public authentication forms containing password-bearing fields submit through a transport that does not serialize those credential values into the browser URL, including when native browser submission occurs before client hydration or when JavaScript is unavailable.

#### Scenario: Login submission does not place password in URL
- **WHEN** a user submits the `/login` form with an identifier and password
- **THEN** the browser URL does not gain the submitted password value
- **AND** the form fallback behavior remains compatible with the existing login mutation flow

#### Scenario: Password reset completion does not place new password in URL
- **WHEN** a user submits the password reset completion form on `/recuperar-senha` with a reset token and new password values
- **THEN** the browser URL does not gain the submitted password values
- **AND** the reset-completion flow remains compatible with the existing reset mutation flow
