## ADDED Requirements

### Requirement: Coordinated cutover
Target finance SHALL not become enabled until all prerequisite contracts, security and atomic remuneration paths pass release acceptance.

#### Scenario: Incomplete integration
- **WHEN** target receipt settlement cannot generate required remuneration atomically
- **THEN** feature remains disabled and release is blocked

### Requirement: Disposable development reset
Only the explicitly identified disposable development database SHALL be recreated, with deterministic target fixtures and no fabricated legacy payments.

#### Scenario: Unverified connection
- **WHEN** reset target cannot be established as disposable development
- **THEN** reset is not executed

### Requirement: Release evidence
Release SHALL record passed full checks and real persistence integrity tests, not treat mocked tests alone as readiness.

#### Scenario: Rollback
- **WHEN** target validation fails
- **THEN** baseline code and dev database/config procedure remain available without changing main

### Requirement: Reproducible ready-to-use development reset
Every phase SHALL maintain compatible seeds as it changes schema/contracts. At final cutover `pnpm run db:reset` SHALL rebuild from migration history, generate the client and seed a usable development database without manual SQL repair. External Clerk/Storage prerequisites SHALL be documented and validated; configured development access bindings SHALL remain usable across repeated resets.

#### Scenario: Repeated clean reset
- **WHEN** the verified disposable development target has its documented external prerequisites configured and the reset command is run twice
- **THEN** each cycle produces valid catalogs, people/profiles, operational origins, financial scenarios and consistent balances without duplicates, and actual Admin/Member login and core workflows succeed

#### Scenario: Missing external access configuration
- **WHEN** a required Clerk identity/organization mapping or Storage prerequisite is absent
- **THEN** validation provides actionable setup feedback and readiness is not claimed; no obsolete provider IDs or fabricated external resources are silently assumed

#### Scenario: Incremental schema change
- **WHEN** a phase changes schema, lookup values, identity or monetary workflows
- **THEN** it updates and verifies matching seeds/fixtures/assertions before completion rather than leaving their repair to phase09
