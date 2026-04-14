## Requirements

### Requirement: Seed bootstrap includes contract financial fixtures
The system SHALL populate deterministic contract financial fixtures for the default development firm when the Prisma seed runs.

#### Scenario: Seed creates contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates contracts, contract assignments, revenues, fees, and remunerations linked to the default firm
- **AND** those records use valid foreign-key relationships across the aggregate

#### Scenario: Seed provides at least twenty contracts
- **WHEN** the seed completes successfully
- **THEN** the default firm has at least 20 seeded contracts available for local development use

### Requirement: Seeded financial fixtures cover the primary contract and fee scenarios
The system SHALL provide seeded financial fixtures that represent the business scenarios needed to validate contract, fee, and remuneration flows without manual data entry.

#### Scenario: Seed includes standard responsible-lawyer contracts
- **WHEN** the seed finishes creating contract fixtures
- **THEN** the dataset includes contracts with at least one responsible lawyer assignment and at least one revenue plan

#### Scenario: Seed includes referral-team contracts
- **WHEN** the seed finishes creating contract fixtures
- **THEN** the dataset includes contracts with recommending and recommended lawyer assignments that satisfy referral-percentage rules

#### Scenario: Seed includes assistant-participation contracts
- **WHEN** the seed finishes creating contract fixtures
- **THEN** the dataset includes contracts with active administrative-assistant assignments compatible with employee-type rules

#### Scenario: Seed includes fee fixtures without remuneration generation
- **WHEN** the seed finishes creating fee fixtures
- **THEN** the dataset includes at least one fee with remuneration generation disabled
- **AND** that fee has no active remuneration records linked to it

#### Scenario: Seed includes partially paid and fully paid contracts
- **WHEN** the seed finishes creating revenues and fees
- **THEN** the dataset includes at least one contract with remaining unpaid value
- **AND** the dataset includes at least one fully paid contract whose active revenues have no remaining value

### Requirement: Seeded remuneration records reflect documented fee formulas
The system SHALL create seeded remuneration records according to the same documented assignment-type formulas used by fee behavior.

#### Scenario: Responsible assignment remuneration uses employee remuneration percentage
- **WHEN** a seeded fee generates remuneration for a responsible assignment
- **THEN** the seeded remuneration amount equals the fee amount multiplied by that employee's remuneration percentage

#### Scenario: Recommending assignment remuneration uses referral percentage
- **WHEN** a seeded fee generates remuneration for a recommending assignment
- **THEN** the seeded remuneration amount equals the fee amount multiplied by that employee's referral percentage

#### Scenario: Recommended assignment remuneration subtracts the recommending referral percentage
- **WHEN** a seeded fee generates remuneration for a recommended assignment
- **THEN** the seeded remuneration effective percentage equals the recommended employee remuneration percentage minus the recommending referral percentage used for that contract

#### Scenario: Admin-assistant remuneration uses employee remuneration percentage
- **WHEN** a seeded fee generates remuneration for an admin-assistant assignment
- **THEN** the seeded remuneration amount equals the fee amount multiplied by that employee's remuneration percentage

### Requirement: Seed output remains deterministic and idempotent
The system SHALL allow repeated seed execution to converge to one stable contract financial fixture dataset for the default firm.

#### Scenario: Re-running seed does not duplicate seeded contracts
- **WHEN** `prisma db seed` is run multiple times against the same database state
- **THEN** seeded contracts identified by their fixture keys are updated or preserved
- **AND** duplicate contracts are not created for the same fixture definition

#### Scenario: Re-running seed does not duplicate seeded child rows
- **WHEN** `prisma db seed` is run multiple times against the same database state
- **THEN** seeded assignments, revenues, fees, and remunerations converge to one deterministic set per seeded contract
- **AND** reruns do not append duplicate child rows for the same fixture scenario

### Requirement: Seeded fixtures support role-aware contract and fee visibility
The system SHALL distribute seeded assignments so both administrators and regular users have meaningful seeded financial records within their allowed visibility scope.

#### Scenario: Administrator has firm-wide seeded financial data
- **WHEN** an administrator uses the seeded local environment
- **THEN** the contract and fee datasets contain enough seeded records to validate firm-wide list and detail views

#### Scenario: Regular users have assigned seeded financial data
- **WHEN** a regular user uses the seeded local environment
- **THEN** the seeded dataset includes contracts and fees assigned to that user through active contract assignments
- **AND** the dataset is not limited to one single assigned contract
