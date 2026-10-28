## ADDED Requirements

### Requirement: Consistent collaborator identity in filters
The system SHALL show an avatar beside each collaborator name in Dashboard, Contracts, Remunerations and Pending Work filter options and beside the selected collaborator, on desktop and mobile. Existing search labels, selected IDs, clearing, permissions and eligibility MUST remain unchanged.

#### Scenario: Linked account with photo
- **WHEN** an eligible collaborator has a unique valid Clerk privateMetadata.employeeId link and a profile photo
- **THEN** the filter shows that photo beside the existing business name

#### Scenario: Missing or unusable photo
- **WHEN** a collaborator lacks a linked account or photo, has an ambiguous binding, or the image fails to load
- **THEN** the filter shows initials derived from the collaborator name

#### Scenario: Selected collaborator
- **WHEN** a collaborator is selected or cleared
- **THEN** the selected avatar appears or disappears while selection and search retain existing behavior

### Requirement: Safe optional enrichment
The system MUST resolve links server-side, expose only optional photo URLs, preserve authorized option lists and continue serving options when Clerk photo lookup fails. Photo refresh SHALL use short-lived caching independent of authorization.

#### Scenario: Provider unavailable
- **WHEN** Clerk photo lookup fails
- **THEN** the existing eligible names and IDs remain usable with fallback avatars

#### Scenario: Multiple pages and concurrent filters
- **WHEN** linked users span provider pages and filters load concurrently
- **THEN** all pages are considered and concurrent lookups share one in-flight photo load

#### Scenario: Unauthorized request
- **WHEN** the existing option handler denies access
- **THEN** avatar enrichment does not bypass that denial or add otherwise hidden options
