## ADDED Requirements

### Requirement: Shared entity detail bodies confine long content to the body scroll region
The system SHALL keep shared entity detail drawer headers and footers stable while long detail content scrolls inside the shared detail body region.

#### Scenario: Detail content exceeds available drawer height
- **WHEN** a user opens a detail drawer whose body content is taller than the available drawer height
- **THEN** the shared detail body SHALL become the vertical scrolling surface
- **AND** the drawer header and footer SHALL remain accessible without the entire drawer content block becoming the scroll container

#### Scenario: Feature detail views reuse the shared body behavior
- **WHEN** multiple feature detail views render through the shared `EntityDetail.Body`
- **THEN** they SHALL inherit the same bounded body scrolling behavior
- **AND** feature detail components SHALL NOT need per-feature overflow utilities to preserve fixed drawer chrome
