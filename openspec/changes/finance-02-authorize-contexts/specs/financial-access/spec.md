## ADDED Requirements

### Requirement: Member confidentiality
Member SHALL NEVER access another collaborator remuneration directly or indirectly; visible contracts SHALL NOT widen beneficiary scope.

#### Scenario: Aggregate inference
- **WHEN** Member requests contract remuneration totals, audit, options, export or settlement attachments
- **THEN** other beneficiaries amounts and identifying financial metadata remain inaccessible

### Requirement: Optional receipt creation
Member receipt registration SHALL default OFF and when explicitly granted SHALL remain assigned-contract scoped.

#### Scenario: Explicit grant
- **WHEN** Member with receipts:create selects an assigned-contract title
- **THEN** server permits only that authorized scope

#### Scenario: Direct entry
- **WHEN** Member targets a direct title or Expense
- **THEN** server denies even when the same Person is globally readable

### Requirement: Provider authority
Admin and Member SHALL use explicit current membership grants and valid current Firm binding; role names SHALL NOT bypass action checks.

#### Scenario: Revoked membership
- **WHEN** provider membership is revoked or verification fails
- **THEN** protected requests deny and organization changes discard old caches

### Requirement: Registration management isolation
Member SHALL NOT access supplier or collaborator management, independently of shared Person identity. Customer access SHALL remain assigned-contract scoped. Routes, endpoints, options, counts and exports SHALL enforce contextual authorization before serialization; hiding navigation alone is insufficient.

#### Scenario: Direct URL or forged API request
- **WHEN** Member targets supplier/collaborator management through a direct URL or API including options and export
- **THEN** access is denied without leaking professional fields, percentages, role flags or access configuration

#### Scenario: Contract team is not collaborator-directory access
- **WHEN** Member reads already-permitted team participation on an assigned contract or their own remuneration
- **THEN** existing contextual access is preserved without granting the collaborator directory or another participant's compensation settings

### Requirement: Unified Pessoas context isolation
A unified Pessoas route SHALL preserve independent customer, supplier and professional permissions. A readable customer who has additional roles SHALL not expose those roles, EmployeeProfile percentages or access configuration to Member. Generic seeded Persons SHALL not authenticate. Revisit Clerk/session projections only after the revised Prisma/seed validation; role names SHALL not grant broad directory access.

#### Scenario: Role filter forgery
- **WHEN** Member requests supplier/employee role filters, privileged profile fields, or a generic identity as their account
- **THEN** server denies the forbidden scope without leaking records or granting access through the unified route
