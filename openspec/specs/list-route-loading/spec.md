# Spec: list-route-loading

## Purpose

Define the shared pending-state behavior for canonical operational list routes that prefetch route data before mount.

---

## Requirements

### Requirement: List routes render a structural pending skeleton during initial loader fetch
The system SHALL render a structural skeleton placeholder while a canonical list route loader is pending before the route finishes mounting.

#### Scenario: Initial navigation to a list route keeps page structure visible
- **WHEN** a user navigates to a canonical list route whose loader is still awaiting server data
- **THEN** the route SHALL render a pending skeleton instead of leaving the main content area blank
- **AND** the skeleton SHALL preserve the visible page structure of title area, filter area, table area, and pagination area

### Requirement: Shared list-route skeleton follows the common list layout
The system SHALL provide a shared list-route pending UI that represents the common operational list layout rather than entity-specific content.

#### Scenario: Shared skeleton mirrors the common list screen shape
- **WHEN** a canonical list route enters its pending state
- **THEN** the pending UI SHALL show a top bar consistent with the authenticated shell
- **AND** the header area SHALL represent search and filter controls
- **AND** the body area SHALL represent a tabular content block with multiple placeholder rows
- **AND** the footer area SHALL represent pagination feedback or controls

### Requirement: Canonical list routes opt into the shared pending skeleton
Canonical operational list routes SHALL wire their route-level pending state to the shared list-route skeleton.

#### Scenario: Principal list screens use the shared pending UI
- **WHEN** a user opens clients, employees, contracts, fees, remunerations, or audit-log list routes and the loader has not completed yet
- **THEN** each route SHALL use the shared list-route pending skeleton as its route-level pending component
