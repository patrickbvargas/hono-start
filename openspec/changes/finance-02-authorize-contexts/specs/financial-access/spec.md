## ADDED Requirements

### Requirement: Member confidentiality
Member SHALL NEVER access another collaborator remuneration directly or indirectly; visible contracts SHALL NOT widen beneficiary scope.

#### Scenario: Aggregate inference
- **WHEN** Member requests contract remuneration totals, audit, options, export or batch attachments
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
