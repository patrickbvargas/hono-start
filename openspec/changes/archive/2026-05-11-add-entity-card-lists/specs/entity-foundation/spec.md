## MODIFIED Requirements

### Requirement: Shared entity view controllers persist a global desktop surface preference
The system SHALL expose a shared entity-view controller that lets routes render table and card surfaces separately while reusing one global desktop preference across features.

#### Scenario: Shared entity view renders separate table and list surfaces
- **WHEN** a route composes a shared entity view for one entity-management screen
- **THEN** it SHALL provide separate table and list render surfaces to the shared controller
- **AND** the shared controller SHALL decide which surface to render without requiring the feature table component to embed card logic

#### Scenario: Shared entity view toggle can live outside the rendered surface
- **WHEN** a route places the shared entity-view toggle in a different layout slot from the rendered entity surface
- **THEN** the toggle SHALL stay synchronized with the rendered surface through the shared entity-view mode state
- **AND** the route SHALL not need ad hoc prop drilling between the toggle location and the rendered entity list

#### Scenario: Desktop entity-view preference is global across features
- **WHEN** a user selects the table or card surface through the shared entity-view toggle on a desktop-width viewport
- **THEN** the shared controller SHALL persist that preference under one global entity-view storage key
- **AND** another route reusing the same shared controller SHALL default to the same saved desktop surface unless it explicitly overrides the storage key

#### Scenario: Mobile viewport forces the configured mobile surface
- **WHEN** a route composes the shared entity-view controller with a mobile surface mode
- **THEN** the controller SHALL render the configured mobile surface regardless of the saved desktop preference
- **AND** the desktop preference SHALL remain preserved for later desktop visits

#### Scenario: Principal entity routes reuse the same shared entity-view controller
- **WHEN** an authenticated user navigates between principal entity routes that expose both table and card surfaces
- **THEN** the routes for clients, contracts, employees, fees, and remunerations SHALL all reuse the same shared entity-view controller pattern
- **AND** each route SHALL keep the active surface selection in shared view-mode state rather than introducing a route-local preference mechanism
