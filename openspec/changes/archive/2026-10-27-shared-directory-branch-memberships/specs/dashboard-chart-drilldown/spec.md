## MODIFIED Requirements

### Requirement: Enforce financial detail access at the server
Every detail request SHALL require current dashboard access and the applicable financial-subject grant, derive business scope from the verified session and enforce the same eligibility as the chart. Client parameters SHALL NOT widen tenant, ownership, assignment or consolidated-result access.

#### Scenario: Expense-only user requests revenue
- **WHEN** a user with only expense financial access submits a revenue detail request directly
- **THEN** the server denies the request without returning revenue rows, totals or counts
- **AND** forbidden financial records are not queried

#### Scenario: Own or assigned access
- **WHEN** a scoped user submits another collaborator's ID or an unrelated entity selector
- **THEN** the request cannot return records outside the verified own/assigned scope
- **AND** an absent Employee binding never grants broader access

#### Scenario: Cross-firm or invalid selection
- **WHEN** a request references a client without authorized operations in the selected Firm or an unsupported chart/series/group combination
- **THEN** it is rejected without revealing restricted record existence

#### Scenario: Consolidated result restriction
- **WHEN** a user lacks any grant required for consolidated balance/Result or uses an unsupported allocation filter
- **THEN** balance and Result details are denied even if the endpoint is called directly

#### Scenario: Permission revoked while modal is open
- **WHEN** a financial grant is revoked before the next source request
- **THEN** the next request rechecks current grants and denies restricted details
- **AND** restricted rows are cleared from the modal
