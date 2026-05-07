## ADDED Requirements

### Requirement: Administrators can reset a collaborator password from the employee details screen
The system SHALL allow administrators to reset the password of a collaborator who already has a credential account by using an action in the employee details drawer. The reset flow SHALL generate a simple temporary password, persist only its hash, revoke the target user's active sessions, and require the collaborator to change that password on the next login.

#### Scenario: Administrator resets a collaborator password successfully
- **WHEN** an administrator opens an employee details drawer for a collaborator with a credential account and confirms the `Resetar senha` action
- **THEN** the system generates a temporary password in a simple segmented format
- **AND** stores only the hashed password in the credential account
- **AND** revokes the target collaborator's active sessions
- **AND** marks the target account to require a password change on the next login
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
- **AND** the temporary plaintext password is not stored in audit payloads or logs
