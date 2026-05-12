## MODIFIED Requirements

### Requirement: List contracts
The system SHALL display a paginated, sortable, filterable list of contracts available to the authenticated user, following the shared entity-management list contract and the contract visibility rules defined by role, employee type, and assignment role.

#### Scenario: Regular lawyer sees only owned contract assignments
- **WHEN** a regular authenticated lawyer navigates to the contracts route
- **THEN** the system displays only contracts in the same firm where that user is actively assigned as `RESPONSIBLE` or `RECOMMENDED`
- **AND** contracts where that user is assigned only as `RECOMMENDING` are excluded

#### Scenario: Regular admin assistant still sees assigned contracts
- **WHEN** a regular authenticated administrative assistant navigates to the contracts route
- **THEN** the system displays contracts in the same firm where that user is actively assigned as `ADMIN_ASSISTANT`

#### Scenario: Referral-only lawyer does not gain contract visibility
- **WHEN** a regular authenticated lawyer is assigned to a contract only as `RECOMMENDING`
- **THEN** that contract does not appear in the contracts list

### Requirement: View contract details
The system SHALL allow authenticated users with access to a contract to inspect contract details without leaving the list workflow.

#### Scenario: Referral-only lawyer cannot open hidden contract details
- **WHEN** a regular authenticated lawyer requests details for a contract where that user participates only as `RECOMMENDING`
- **THEN** the server rejects the request before contract data is returned
