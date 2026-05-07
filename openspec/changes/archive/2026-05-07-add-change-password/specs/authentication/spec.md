## ADDED Requirements

### Requirement: Authenticated users can change their password from the product shell
The system SHALL allow any authenticated user with a credential-based account to change their password from the authenticated product shell by submitting the current password, a new password that satisfies policy, and a matching confirmation value. The flow MUST keep user-facing feedback in safe pt-BR copy and MUST rely on the authenticated session context rather than any client-submitted user identity.

#### Scenario: Authenticated user changes password successfully
- **WHEN** an authenticated user opens the account password-change flow, submits the correct current password, and provides a valid new password with matching confirmation
- **THEN** the system updates the credential password
- **AND** shows a success confirmation in pt-BR
- **AND** keeps the current authenticated session usable

#### Scenario: Current password is invalid
- **WHEN** an authenticated user submits the password-change form with an incorrect current password
- **THEN** the system denies the password change
- **AND** shows a safe pt-BR error for invalid current password
- **AND** does not reveal internal auth-provider details

#### Scenario: New password confirmation does not match
- **WHEN** an authenticated user submits a new password and confirmation with different values
- **THEN** the system blocks submission with inline validation feedback
- **AND** does not call the authenticated password-change operation

#### Scenario: User revokes other sessions during password change
- **WHEN** an authenticated user opts to revoke other sessions while changing the password successfully
- **THEN** the system invalidates the user's other active sessions
- **AND** preserves the current session so the user remains in the authenticated shell
