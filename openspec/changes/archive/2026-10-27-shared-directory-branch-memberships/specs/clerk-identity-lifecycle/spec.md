## MODIFIED Requirements

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication, permission-grant and identity-link authority. The active Organization privateMetadata.firmId SHALL identify the existing business Firm; optional User privateMetadata.employeeId SHALL resolve an active, non-deleted Employee, which SHALL remain the same global business actor across authorized Organizations. Employee SHALL NOT carry firmId, and current Organization membership SHALL supply permissions independently of global employee identity. Existing integer business IDs and audit references SHALL remain unchanged, with no provider identity links copied into business tables. Protected access MUST require active membership and a valid Firm mapping. Multiple Organizations MAY intentionally map to the same Firm.

#### Scenario: Organization and employee match
- **WHEN** a verified Clerk session has an active Organization with a valid private Firm mapping and matching active Employee
- **THEN** the system resolves that Employee and Firm as the business actor
- **AND** it derives permission grants from Clerk rather than local role lookups

#### Scenario: Invalid mapping or membership
- **WHEN** membership or Firm metadata is absent, or an explicit Employee mapping is invalid, inactive or deleted
- **THEN** protected access is denied without creating a default Firm or granting default permissions

#### Scenario: Valid member without Employee mapping
- **WHEN** an active member has a valid Firm mapping and no employeeId
- **THEN** general grants are available while own/assigned grants are excluded
