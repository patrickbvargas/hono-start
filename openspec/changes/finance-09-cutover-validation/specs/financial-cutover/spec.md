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
