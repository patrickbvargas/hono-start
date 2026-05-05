## MODIFIED Requirements

### Requirement: Shared list-route skeleton follows the common list layout
The system SHALL provide a shared list-route pending UI that represents the common operational list layout rather than entity-specific content, and the placeholder blocks SHALL align with the size of the final controls and table structure without introducing decorative border strokes.

#### Scenario: Shared skeleton mirrors the common list screen shape
- **WHEN** a canonical list route enters its pending state
- **THEN** the pending UI SHALL show a top bar consistent with the authenticated shell
- **AND** the header area SHALL represent search and filter controls with heights matching the final controls
- **AND** the body area SHALL represent a tabular content block with placeholder header and rows sized to the final table structure
- **AND** the footer area SHALL represent pagination feedback or controls sized to the final pagination structure
- **AND** the shared skeleton SHALL avoid decorative border lines around the placeholder table shell, rows, and footer
