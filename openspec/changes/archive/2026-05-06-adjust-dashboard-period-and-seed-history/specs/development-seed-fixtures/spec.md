## MODIFIED Requirements

### Requirement: Seed bootstrap includes contract financial fixtures

The system SHALL populate deterministic contract financial fixtures for the default development firm when the Prisma seed runs.

#### Scenario: Seed creates current and prior year contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates contracts, contract assignments, revenues, fees, and remunerations linked to the default firm for 2026
- **AND** the seed also creates deterministic historical financial fixtures for 2025 and 2024
- **AND** those records use valid foreign-key relationships across the aggregate

### Requirement: Seeded financial fixtures cover the primary contract and fee scenarios

The system SHALL provide seeded financial fixtures that represent the business scenarios needed to validate contract, fee, and remuneration flows without manual data entry.

#### Scenario: Seed includes prior-year fees for dashboard comparisons
- **WHEN** the seed finishes creating fee fixtures
- **THEN** the dataset includes active 2024 and 2025 fees across seeded contracts
- **AND** those fixtures support dashboard comparison against 2026 without manual data entry

#### Scenario: Seed distributes historical fees across the full year
- **WHEN** the seed finishes creating historical fee fixtures
- **THEN** the 2024 dataset includes fee launches in every month from January through December
- **AND** the 2025 dataset includes fee launches in every month from January through December
- **AND** the 2026 dataset includes fee launches in every month from January through April

#### Scenario: Seed keeps annual financial behavior stable across years
- **WHEN** the seed finishes creating 2024, 2025, and 2026 fixtures
- **THEN** monthly revenue and remuneration totals remain in a similar business band across the three years
- **AND** differences between years represent small month-to-month variation instead of extreme growth or collapse

### Requirement: Seed output remains deterministic and idempotent

The system SHALL allow repeated seed execution to converge to one stable contract financial fixture dataset for the default firm.

#### Scenario: Re-running seed preserves year-partitioned fixture identities
- **WHEN** `prisma db seed` is run multiple times against the same database state
- **THEN** seeded contracts from 2024, 2025, and 2026 are identified by deterministic fixture keys that do not collide across years
- **AND** reruns do not append duplicate child rows for either seeded year
