## MODIFIED Requirements

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication, permission-grant and identity-link authority. The active Organization privateMetadata.firmId SHALL identify the existing business Firm; required User privateMetadata.employeeId SHALL resolve an active, non-deleted Employee, which SHALL remain the same global business actor across authorized Organizations. Employee SHALL NOT carry firmId, and current Organization membership SHALL supply permissions independently of global employee identity. Existing integer business IDs and audit references SHALL remain unchanged, with no provider identity links copied into business tables. Protected access MUST require active membership and valid Firm and Employee mappings. Multiple Organizations MAY intentionally map to the same Firm.

#### Scenario: Organization and employee match
- **WHEN** a verified Clerk session has an active Organization with a valid private Firm mapping and matching active Employee
- **THEN** the system resolves that Employee and Firm as the business actor
- **AND** it derives permission grants from Clerk rather than local role lookups

#### Scenario: Invalid mapping or membership
- **WHEN** membership or Firm metadata is absent, or an Employee mapping is absent, invalid, inactive or deleted
- **THEN** protected access is denied without creating a default Firm or granting default permissions

#### Scenario: Valid member without Employee mapping
- **WHEN** an active member has a valid Firm mapping and no employeeId
- **THEN** all protected access is denied, including administrative and general grants

### Requirement: Denied organization access preserves organization selection
A signed-in user without application access SHALL retain access to the login recovery surface. Organization selection SHALL remain available unless an Employee or Firm binding issue requires correction in Clerk. When configuration issues exist the surface SHALL direct correction in Clerk and offer retry and sign-out without Organization selection. Other access denials SHALL retain safe guidance and Organization selection without implying missing membership or exposing private mapping values. Selecting another valid Organization SHALL recover application access through normal verification and preserve the safe destination.

#### Scenario: Unmapped branch is selected
- **WHEN** a signed-in user selects an Organization without a valid Firm mapping
- **THEN** the protected route redirects to login and shows configuration guidance, retry and sign-out without OrganizationList
- **AND** no business data from the previously active Organization remains available through the protected route

#### Scenario: User selects an available branch
- **WHEN** the denied user selects another Organization with valid mapping and grants
- **THEN** normal verified access resumes using that Organization's configured Firm
