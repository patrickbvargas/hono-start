## MODIFIED Requirements

### Requirement: Seed bootstrap includes contract financial fixtures
The system SHALL populate deterministic contract financial fixtures for Matriz (Firm 1) and a smaller POA operation (Firm 2) when the Prisma seed runs, reusing the same global Client/Employee IDs.

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

### Requirement: Seed output remains deterministic and idempotent
The system SHALL allow repeated seed execution to converge to one stable contract financial fixture dataset per seeded Firm at the same reference date, preserving global master and evidence identities.

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

### Requirement: Reset produces a complete preview
The development reset command SHALL apply migrations, generate the client and run the seed exactly once, creating realistic lifecycle examples and operational history/evidence in Matriz and POA. Shared Client/Employee history and attachments SHALL be created once and remain visible from both units under existing grants. The reset SHALL NOT provision Clerk accounts or memberships.

#### Scenario: Fresh reset
- **WHEN** db:reset completes with configured database and private attachment storage
- **THEN** the application contains active, completed, cancelled, inactive and deleted examples, manual and automatic remuneration, and readable evidence
- **AND** Clerk accounts and permission grants are unchanged

## ADDED Requirements

### Requirement: Smaller second-unit demonstration
The seed SHALL create POA with 17 contracts and 12 expenses, derived from recent and lifecycle examples with monetary values at 60% of corresponding Matriz examples. Contracts, assignments, revenues, fees, remunerations and expenses SHALL retain matching branch ownership while clients and employees remain global.

#### Scenario: Switch between seeded units
- **WHEN** an authorized member switches between Organizations mapped to Firm 1 and Firm 2
- **THEN** client and employee IDs remain shared while operational lists, amounts and evidence reflect the selected unit
- **AND** repeating seed at the same reference date preserves all fixture IDs and does not duplicate audit or attachments
