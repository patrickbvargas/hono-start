# dashboard-layout-composition Specification

## Purpose
Dashboard layout composition defines how the root dashboard UI delegates analytical surface rendering to dedicated child components while keeping layout orchestration centralized.

## Requirements
### Requirement: Dashboard layout composes dedicated analytical surfaces
The system SHALL organize dashboard analytical surfaces through dedicated child components so the root dashboard component remains focused on layout composition and scroll orchestration.

#### Scenario: Dashboard renders metric cards through dedicated component
- **WHEN** dashboard summary data is available
- **THEN** the root dashboard component composes a dedicated metric-cards surface instead of rendering the metric-card implementation inline
- **AND** the rendered cards preserve the same summary labels, values, variations, and previous-period context
