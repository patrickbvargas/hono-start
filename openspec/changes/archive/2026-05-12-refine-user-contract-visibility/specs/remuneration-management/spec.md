## MODIFIED Requirements

### Requirement: Remuneration behavior is preserved through the refactor
The system SHALL preserve existing remuneration product behavior while changing the feature's internal organization.

#### Scenario: Own remuneration visibility survives hidden referral contract
- **WHEN** a regular authenticated user loads remunerations that belong to that user's employee identity
- **THEN** the system returns those remunerations even if the linked contract is not visible to that user because the user participates only as `RECOMMENDING`
- **AND** the remuneration list remains scoped only by authenticated firm and employee ownership
