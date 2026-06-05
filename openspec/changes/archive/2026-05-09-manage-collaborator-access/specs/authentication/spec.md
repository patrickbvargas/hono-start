## ADDED Requirements

### Requirement: Credential login requires granted access and an active linked employee
The system SHALL allow credential login only when the submitted email or OAB resolves to an employee that is active, not soft-deleted, linked to a provedor legado de auth user, and currently marked with administrator-granted access. The system MUST continue to return the same safe pt-BR invalid-credentials response when any of those conditions fail.

#### Scenario: Employee with granted access logs in successfully
- **WHEN** a collaborator whose employee is active, not deleted, linked to a provedor legado de auth user, has `isAccessEnabled = true`, and has a credential account submits valid credentials
- **THEN** the system authenticates the collaborator normally

#### Scenario: Revoked collaborator access is denied safely
- **WHEN** a collaborator whose linked provedor legado de auth user has `isAccessEnabled = false` submits the correct password
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback used for unknown identifiers or wrong passwords

#### Scenario: Inactive or deleted employee cannot authenticate
- **WHEN** a collaborator submits valid credentials for a linked employee that is inactive or soft-deleted
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback

#### Scenario: Linked auth user without credential account cannot authenticate
- **WHEN** a collaborator has a linked provedor legado de auth user but no credential account
- **THEN** the system denies credential login
- **AND** shows the same safe invalid-credentials feedback
