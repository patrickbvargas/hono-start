## MODIFIED Requirements

### Requirement: Seed bootstrap includes contract financial fixtures
The system SHALL populate deterministic contract financial fixtures for the default development firm when the Prisma seed runs.

#### Scenario: Seed creates contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates contracts, contract assignments, revenues, fees, and remunerations linked to the default firm
- **AND** those records use valid foreign-key relationships across the aggregate

#### Scenario: Seed creates multi-year contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates deterministic historical financial fixtures for the two calendar years preceding the reference year
- **AND** the seed creates current-year fixtures for the reference year
- **AND** all three yearly datasets remain linked to the default firm with valid foreign-key relationships

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

#### Scenario: Seed includes full-year historical monthly launches
- **WHEN** the seed finishes creating fee fixtures
- **THEN** each prior-year dataset includes fee launches in every month from January through December
- **AND** the second prior-year dataset includes fee launches in every month from January through December
- **AND** the reference-year dataset includes fee launches in every month from January through the reference month, with realized values no later than the reference day

#### Scenario: Seed keeps annual financial behavior stable
- **WHEN** the seed finishes creating the reference year and two prior years financial fixtures
- **THEN** monthly revenue and remuneration totals reflect plausible seasonal and annual variation across the three years
- **AND** year-over-year comparison reflects plausible operational variation rather than extreme swings caused by the fixtures themselves

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

#### Scenario: Re-running seed preserves multi-year fixture identities
- **WHEN** `prisma db seed` is run multiple times against the same database state
- **THEN** seeded contracts from the reference year and two prior years are identified by deterministic fixture keys that do not collide across years
- **AND** reruns do not append duplicate child rows for any seeded year


## ADDED Requirements

### Requirement: Reset produces a complete preview
The development reset command SHALL apply migrations, generate the client and run the seed exactly once, creating realistic lifecycle examples, immutable audit history and readable example attachments for all six owner types in Matriz.

#### Scenario: Fresh reset
- **WHEN** db:reset completes with configured database and private attachment storage
- **THEN** the application contains active, completed, cancelled, inactive and deleted examples, manual and automatic remuneration, and readable evidence
- **AND** Clerk accounts and permission grants are unchanged

### Requirement: Comparable financial periods
The fixtures SHALL support existing dashboard monthly and YTD comparisons with nonzero receipts, down payments, remunerations and expenses in both periods, without future realized values.

#### Scenario: YTD comparison
- **WHEN** January 1 through the reference day is selected
- **THEN** realized totals and their same-date prior-year comparisons contain coherent activity
- **AND** future plans contribute only to forecast values

#### Scenario: Repeated seed preserves evidence references
- **WHEN** seed runs again with the same reference date
- **THEN** seeded financial IDs and attachment ownership remain stable and audit events are not duplicated

### Requirement: Pending-work severity examples
The seed SHALL provide named overdue high-severity, upcoming medium-severity and settled-active low-severity examples on its reference day, including month and year boundaries.

#### Scenario: Upcoming installment remains within the reminder window
- **WHEN** seed runs for any reference day, including month-end and leap February
- **THEN** the upcoming example has its first installment paid and its next outstanding installment due within seven days inclusive
- **AND** overdue and settled-active examples independently demonstrate high and low severity
- **AND** existing realized YTD receipt totals remain unchanged
