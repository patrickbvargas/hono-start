## ADDED Requirements

### Requirement: Route-backed search URLs omit redundant default values
The system SHALL canonicalize TanStack Router URLs for screens with validated search state so parameters whose values equal the route's documented defaults are omitted from the generated query string. Non-default search values MUST remain in the URL so refresh and shared links restore the same visible state.

#### Scenario: Default list state omits redundant query parameters
- **WHEN** a user opens a route-backed list or dashboard screen in its validated default state
- **THEN** the generated URL omits search parameters whose values only repeat the route defaults

#### Scenario: Non-default search state remains shareable
- **WHEN** a user changes filters, sorting, pagination, or another validated search value away from its default
- **THEN** the resulting URL keeps the non-default search parameters needed to restore that state

#### Scenario: Reload preserves canonicalized state
- **WHEN** a user reloads or shares a canonicalized URL produced by a route search middleware
- **THEN** the route restores the same validated visible state represented by the remaining search parameters
- **AND** omitted default parameters are rehydrated from the route defaults rather than being treated as missing behavior
