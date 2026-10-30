## MODIFIED Requirements

### Requirement: Seed bootstrap includes contract financial fixtures
The system SHALL populate deterministic contract financial fixtures for Matriz (Firm 1) and a smaller POA operation (Firm 2) when the Prisma seed runs, reusing the same global Client/Employee IDs, structuring financial titles as decoupled records linked via bridge tables.

#### Scenario: Seed creates contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates contracts, contract assignments, revenues, receivables with `ContractRevenueReceivable` bridges, receipts, and remunerations with `RemunerationPayable` bridges linked to the default firm
- **AND** those records use valid foreign-key relationships across the decoupled architecture

#### Scenario: Seed creates multi-year contract financial aggregate records
- **WHEN** `prisma db seed` runs against a reset local database
- **THEN** the seed creates deterministic historical financial fixtures for the two calendar years preceding the reference year
- **AND** the seed creates current-year fixtures for the reference year
- **AND** all three yearly datasets remain linked to the default firm with valid foreign-key and bridge relationships

#### Scenario: Seed provides at least twenty contracts
- **WHEN** the seed completes successfully
- **THEN** the default firm has at least 20 seeded contracts available for local development use
