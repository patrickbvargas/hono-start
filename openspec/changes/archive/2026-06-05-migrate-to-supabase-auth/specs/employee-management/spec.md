## MODIFIED Requirements

### Requirement: Administrators can grant collaborator access from employee details
The system SHALL allow administrators to grant system access from the employee details drawer for a collaborator who does not currently have enabled credential access. Granting access MUST create or reactivate the linked Supabase Auth user, generate a temporary password, require a password change on next login, and reveal the temporary password once in pt-BR UI copy.

#### Scenario: Grant access for collaborator without auth user
- **WHEN** an administrator grants access for an active, non-deleted employee who has no linked Supabase Auth user
- **THEN** the system creates a linked Supabase Auth user for that employee
- **AND** enables access for that employee
- **AND** generates a temporary password
- **AND** stores the credential only through the auth provider
- **AND** marks the employee access state to require a password change on next login
- **AND** reveals the temporary password once to the administrator

#### Scenario: Grant access for collaborator with revoked account
- **WHEN** an administrator grants access for an employee whose linked Supabase Auth user already exists with `isAccessEnabled = false`
- **THEN** the system re-enables access for that employee
- **AND** creates or refreshes the credential password with a new temporary password
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
The system SHALL allow administrators to revoke collaborator access from the employee details drawer without deleting the linked Supabase Auth user. Revoking access MUST disable future logins and revoke active sessions immediately.

#### Scenario: Revoke enabled access
- **WHEN** an administrator revokes access for an employee whose linked Supabase Auth user has enabled access
- **THEN** the system sets `isAccessEnabled = false`
- **AND** revokes the collaborator's active sessions
- **AND** keeps the linked auth identity for later re-enable

#### Scenario: Revoke action unavailable when no enabled access exists
- **WHEN** an administrator opens employee details for a collaborator without enabled access
- **THEN** the system does not expose the revoke-access action

#### Scenario: Regular user cannot revoke collaborator access
- **WHEN** a regular user attempts to access employee details or trigger the revoke action directly
- **THEN** the route and server authorization boundaries reject the operation

### Requirement: Administrators can reset a collaborator password from the employee details screen
The system SHALL allow administrators to reset the password of a collaborator who already has a credential account by using an action in the employee details drawer. The reset flow SHALL generate a simple temporary password, update the credential through Supabase Auth, revoke the target user's active sessions, and require the collaborator to change that password on the next login.

#### Scenario: Administrator resets a collaborator password successfully
- **WHEN** an administrator opens an employee details drawer for a collaborator with a credential account and confirms the `Resetar senha` action
- **THEN** the system generates a temporary password in a simple segmented format
- **AND** updates the credential through Supabase Auth
- **AND** revokes the target collaborator's active sessions
- **AND** marks the target employee access state to require a password change on the next login
- **AND** reveals the temporary password once to the administrator in pt-BR UI copy

#### Scenario: Employee details shows reset action only for accounts that can authenticate
- **WHEN** an administrator opens an employee details drawer for a collaborator without a credential account
- **THEN** the system does not expose the `Resetar senha` action for that collaborator

#### Scenario: Regular user cannot reset collaborator password
- **WHEN** a regular user attempts to access employee details or trigger the reset action directly
- **THEN** the route and server authorization boundaries reject the operation

#### Scenario: Temporary password does not enter audit payloads
- **WHEN** an administrator resets a collaborator password
- **THEN** the system records an auditable employee mutation
- **AND** does not store the plaintext temporary password in audit payloads or logs
