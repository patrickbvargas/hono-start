## ADDED Requirements

### Requirement: Administrators can grant collaborator access from employee details
The system SHALL allow administrators to grant system access from the employee details drawer for a collaborator who does not currently have enabled credential access. Granting access MUST create or reactivate the linked provedor legado de auth auth records, generate a temporary password, require a password change on next login, and reveal the temporary password once in pt-BR UI copy.

#### Scenario: Grant access for collaborator without auth user
- **WHEN** an administrator grants access for an active, non-deleted employee who has no linked provedor legado de auth user
- **THEN** the system creates a linked provedor legado de auth user and credential account for that employee
- **AND** enables access for that auth user
- **AND** generates a temporary password
- **AND** stores only the password hash
- **AND** marks the account to require a password change on next login
- **AND** reveals the temporary password once to the administrator

#### Scenario: Grant access for collaborator with revoked account
- **WHEN** an administrator grants access for an employee whose linked provedor legado de auth user already exists with `isAccessEnabled = false`
- **THEN** the system re-enables access for that auth user
- **AND** creates or refreshes the credential account password with a new temporary password
- **AND** revokes any active sessions for that auth user
- **AND** requires a password change on next login

#### Scenario: Grant access is blocked for inactive or deleted employee
- **WHEN** an administrator attempts to grant access for an employee who is inactive or soft-deleted
- **THEN** the system rejects the action
- **AND** shows a safe pt-BR error explaining that only active collaborators can receive access

#### Scenario: Temporary password is not written to audit payloads
- **WHEN** an administrator grants access
- **THEN** the system records an auditable employee mutation
- **AND** does not store the plaintext temporary password in audit payloads or logs

### Requirement: Administrators can revoke collaborator access from employee details
The system SHALL allow administrators to revoke collaborator access from the employee details drawer without deleting the linked provedor legado de auth user or credential account. Revoking access MUST disable future logins and revoke active sessions immediately.

#### Scenario: Revoke enabled access
- **WHEN** an administrator revokes access for an employee whose linked provedor legado de auth user has enabled access
- **THEN** the system sets `isAccessEnabled = false`
- **AND** deletes the collaborator's active sessions
- **AND** keeps the linked auth records for later re-enable

#### Scenario: Revoked collaborator no longer appears as access-enabled
- **WHEN** the administrator reloads the employee details drawer after revoking access
- **THEN** the access section shows that the collaborator no longer has enabled access
- **AND** the UI exposes `Conceder acesso` instead of `Revogar acesso`

#### Scenario: Regular user cannot grant or revoke collaborator access
- **WHEN** a regular user attempts to trigger grant-access or revoke-access behavior directly
- **THEN** the route and server authorization boundaries reject the operation
