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
The system SHALL open supported singular client, employee, contract and fee relationships above the current detail without navigating to the related entity list. Summary-default triggers SHALL expose dialog semantics and SHALL NOT display a route-navigation icon. Nested details SHALL use “Voltar”. An explicit page primary action SHALL instead navigate directly and omit dialog accessibility attributes.

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

### Requirement: Related links offer direct page access
Every RelatedRecordLink SHALL default to primary-click summary opening and offer a context menu with Abrir página followed by Ver resumo. Page access SHALL target the same record and overview tab using the destination entity's validated collection return context, without opening its summary. Existing read permissions and server resource checks SHALL remain enforced.

#### Scenario: Open related client page
- **WHEN** an authorized user right-clicks a client link on a contract and chooses Abrir página
- **THEN** the client page opens directly without mounting the client summary

#### Scenario: Inspect a related record
- **WHEN** the user clicks a summary-default link or selects Ver resumo
- **THEN** the related summary opens while the originating URL and context remain intact

#### Scenario: Keyboard menu access
- **WHEN** a focused related link receives Shift+F10 or ContextMenu
- **THEN** its menu opens and Escape closes it with focus returned to the link

#### Scenario: Restricted read access
- **WHEN** the viewer lacks the related entity read grant
- **THEN** the context menu SHALL NOT expose page or summary actions


#### Scenario: Configurable primary action
- **WHEN** a link specifies page as its primary action
- **THEN** primary click SHALL open the page directly, its tooltip SHALL describe page access, and its context menu SHALL still offer both actions
- **AND** links without an override SHALL follow the central default, initially summary
