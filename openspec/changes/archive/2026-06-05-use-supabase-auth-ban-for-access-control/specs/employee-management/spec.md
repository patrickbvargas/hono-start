## MODIFIED Requirements

### Requirement: Administrators can grant initial collaborator access from employee details
The system SHALL allow administrators to grant system access from the employee details drawer only for a collaborator who does not currently have a linked credential account. Granting access MUST create the linked Supabase Auth user, generate a temporary password, require a password change on next login, and reveal the temporary password once in pt-BR UI copy.

#### Scenario: Grant access for collaborator without auth user
- **WHEN** an administrator grants access for an active, non-deleted employee who has no linked Supabase Auth user
- **THEN** the system creates a linked Supabase Auth user for that employee
- **AND** stores the linked auth user id on the employee record
- **AND** generates a temporary password
- **AND** stores the credential only through the auth provider
- **AND** marks the account to require a password change on next login
- **AND** reveals the temporary password once to the administrator

#### Scenario: Grant access for collaborator with previously revoked account
- **WHEN** an administrator attempts to grant access for an employee whose linked Supabase Auth user already exists but is banned
- **THEN** the system rejects the action
- **AND** instructs the administrator to restore access instead

#### Scenario: Grant access is blocked for inactive or deleted employee
- **WHEN** an administrator attempts to grant access for an employee who is inactive or soft-deleted
- **THEN** the system rejects the action
- **AND** shows a safe pt-BR error explaining that only active collaborators can receive access

#### Scenario: Temporary password is not written to audit payloads
- **WHEN** an administrator grants access
- **THEN** the system records an auditable employee mutation
- **AND** does not store the plaintext temporary password in audit payloads or logs

### Requirement: Administrators can revoke collaborator access from employee details
The system SHALL allow administrators to revoke collaborator access from the employee details drawer without deleting the linked Supabase Auth user. Revoking access MUST ban the linked Supabase Auth user and disable future logins through the auth provider.

#### Scenario: Revoke enabled access
- **WHEN** an administrator revokes access for an employee whose linked Supabase Auth user currently allows credential login
- **THEN** the system bans that linked auth account
- **AND** keeps the linked auth identity for later re-enable

#### Scenario: Revoked collaborator no longer appears as access-enabled
- **WHEN** the administrator reloads the employee details drawer after revoking access
- **THEN** the access section shows that the collaborator no longer has usable credential access
- **AND** the UI exposes `Restaurar acesso` instead of `Revogar acesso`

#### Scenario: Regular user cannot grant or revoke collaborator access
- **WHEN** a regular user attempts to trigger grant-access or revoke-access behavior directly
- **THEN** the route and server authorization boundaries reject the operation

### Requirement: Administrators can restore revoked collaborator access without resetting the password
The system SHALL allow administrators to restore collaborator access from the employee details drawer for a banned linked Supabase Auth user without changing the stored password.

#### Scenario: Restore revoked access
- **WHEN** an administrator restores access for an employee whose linked Supabase Auth user is banned
- **THEN** the system unbans that auth account
- **AND** keeps the current password unchanged

### Requirement: Administrators can reset a collaborator password from the employee details screen
The system SHALL allow administrators to reset the password of a collaborator who already has a credential account by using an action in the employee details drawer. The reset flow SHALL generate a simple temporary password, persist only its auth-provider credential representation, keep the linked auth identity, and require the collaborator to change that password on the next login.

#### Scenario: Administrator resets a collaborator password successfully
- **WHEN** an administrator opens an employee details drawer for a collaborator with a credential account and confirms the `Resetar senha` action
- **THEN** the system generates a temporary password in a simple segmented format
- **AND** stores only the credential through the auth provider
- **AND** marks the target account to require a password change on the next login
- **AND** reveals the temporary password once to the administrator in pt-BR UI copy

#### Scenario: Employee details shows reset action only for accounts that can authenticate
- **WHEN** an administrator opens an employee details drawer for a collaborator without a credential account
- **THEN** the system does not expose the `Resetar senha` action for that collaborator

#### Scenario: Revoked account can still have the password reset
- **WHEN** an administrator opens an employee details drawer for a collaborator with revoked access but an existing credential account
- **THEN** the system still exposes the `Resetar senha` action for that collaborator

#### Scenario: Regular user cannot reset collaborator password
- **WHEN** a regular user attempts to access employee details or trigger the reset action directly
- **THEN** the route and server authorization boundaries reject the operation

#### Scenario: Temporary password does not enter audit payloads
- **WHEN** an administrator resets a collaborator password
- **THEN** the system records an auditable employee mutation
- **AND** the temporary plaintext password is not stored in audit payloads or logs
