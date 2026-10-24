# contextual-entity-details Specification

## Purpose
TBD - created by archiving change document-contextual-entity-details. Update Purpose after archive.
## Requirements
### Requirement: Main details are addressable through route search
The system SHALL accept a valid `detailId` on client, employee, contract, expense, fee and remuneration routes and open the corresponding main detail. Detail selection SHALL NOT become an entity-list filter. Invalid detail identifiers SHALL be ignored by search validation.

#### Scenario: Open and close a main detail
- **WHEN** a user opens an entity route with a valid detail identifier
- **THEN** its main detail opens with “Fechar” and closing it clears the detail selection

### Requirement: Singular related details preserve their parent context
The system SHALL open supported singular client, employee, contract and fee relationships above the current detail without navigating to the related entity list. The trigger SHALL expose dialog semantics and SHALL NOT display a route-navigation icon. Nested details SHALL use “Voltar”.

#### Scenario: Return from a related record
- **WHEN** a user opens a related record and chooses “Voltar”
- **THEN** the related detail closes and the original detail remains available on the same route

#### Scenario: Operate on a related record
- **WHEN** a permitted user edits, deletes or restores a related record
- **THEN** existing feature permission and data-isolation rules apply, with the mutation dialog visible above the details

### Requirement: Collections retain list navigation with collapsed advanced filters
The system SHALL retain filtered-list navigation for collection relationships. Advanced filters SHALL start collapsed and SHALL collapse on marked internal collection navigation, including navigation reusing the current route. Applied filters SHALL remain effective while the panel is collapsed.

#### Scenario: Follow a collection relationship
- **WHEN** a user follows a contract collection or revenue fee collection link
- **THEN** the destination shows the filtered collection with advanced filters closed

### Requirement: Related details use natural loading feedback
The system SHALL load related details on demand with normal skeleton and error feedback. It SHALL NOT introduce speculative hover, focus or related-data prefetch. Existing query caching MAY satisfy subsequent opens.

#### Scenario: Load an uncached related record
- **WHEN** a related record requires loading
- **THEN** loading feedback appears with an accessible title and a return action

#### Scenario: Loading fails
- **WHEN** a related detail fails to load
- **THEN** error feedback and a return action remain available

### Requirement: Contextual detail flows remain usable on mobile
The system SHALL fit detail panels to narrow viewports, keep form content scrollable within available height, and display editing and discard confirmations above their originating details. Mobile navigation SHALL close after destination selection and expose Portuguese navigation labels.

#### Scenario: Edit on a short viewport
- **WHEN** a user opens an edit form above a related detail on a short viewport
- **THEN** the form is visible above the detail and its body can scroll while footer actions remain accessible

#### Scenario: Select a mobile navigation destination
- **WHEN** a user selects a sidebar destination or the home logo on mobile
- **THEN** the mobile sidebar closes

