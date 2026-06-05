## MODIFIED Requirements

### Requirement: Credential login requires an active linked employee and an unbanned Supabase Auth account
The system SHALL allow credential login only when the submitted email or OAB resolves to an employee that is active, not soft-deleted, linked to a Supabase Auth user, and backed by a Supabase Auth account that is not currently banned. The system MUST rely on Supabase Auth account state as the authoritative login-access control and MUST NOT require a separate application-managed access-enabled flag to determine whether credential login is allowed.

#### Scenario: Employee with active linked account logs in successfully
- **WHEN** a collaborator whose employee is active, not deleted, linked to a Supabase Auth user, and whose Supabase Auth account is not banned submits valid credentials
- **THEN** the system authenticates the collaborator normally

#### Scenario: Revoked collaborator access is denied by auth account state
- **WHEN** a collaborator whose linked Supabase Auth account is banned submits the correct password
- **THEN** the system denies login
- **AND** the denial is driven by Supabase Auth account state rather than by a post-auth application access flag

#### Scenario: Inactive or deleted employee cannot authenticate
- **WHEN** a collaborator submits valid credentials for a linked employee that is inactive or soft-deleted
- **THEN** the system denies login
- **AND** the system does not establish authenticated product access for that collaborator

#### Scenario: Linked auth user without active employee linkage cannot authenticate
- **WHEN** a collaborator has a linked Supabase Auth user but no active, non-deleted employee linkage
- **THEN** the system denies credential login
- **AND** the system does not establish authenticated product access for that collaborator
