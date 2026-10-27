## MODIFIED Requirements

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication, permission-grant and identity-link authority. The active Organization privateMetadata.firmId SHALL identify the existing business Firm; optional User privateMetadata.employeeId SHALL resolve an active, non-deleted Employee, which SHALL be included as the business actor only when it belongs to that Firm. A valid Employee in another Firm SHALL be omitted together with own/assigned grants, preserving explicitly authorized general grants. Existing integer business IDs and audit references SHALL remain unchanged, with no provider identity links copied into business tables. Protected access MUST require active membership and a valid Firm mapping. Multiple Organizations MAY intentionally map to the same Firm.

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

## ADDED Requirements

### Requirement: Denied organization access preserves organization selection
A signed-in user without application access SHALL retain access to the login organization-selection surface. When an Organization is active the surface SHALL explain that the selected unit could not be loaded and direct the user to check its configuration with an administrator or select another Organization, without implying missing membership or exposing private mapping details. Selecting another valid Organization SHALL recover application access through normal verification and preserve the safe destination.

#### Scenario: Unmapped branch is selected
- **WHEN** a signed-in user selects an Organization without a valid Firm mapping
- **THEN** the protected route redirects to login and shows safe access guidance plus OrganizationList
- **AND** no business data from the previously active Organization remains available through the protected route

#### Scenario: User selects an available branch
- **WHEN** the denied user selects another Organization with valid mapping and grants
- **THEN** normal verified access resumes using that Organization's configured Firm
