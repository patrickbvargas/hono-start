## ADDED Requirements

### Requirement: Release checks are reproducible
The repository SHALL provide a read-only verification command covering source and root configuration style, TypeScript, all unit tests and the production build. It SHALL stop on failures.

#### Scenario: Successful verification
- **WHEN** a contributor runs release verification in a configured environment
- **THEN** all four checks SHALL execute successfully before automated readiness is reported
- **AND** source files SHALL NOT be automatically rewritten

#### Scenario: Failed verification
- **WHEN** a check fails
- **THEN** verification SHALL return a nonzero status
- **AND** later checks SHALL NOT conceal that failure

### Requirement: Deployment evidence is explicit
Release documentation SHALL distinguish automated checks from authenticated workflows and operational prerequisites, preserving current firm and permission boundaries.

#### Scenario: Operator rehearsal remains unverified
- **WHEN** an authenticated upload/open/delete workflow has not been performed
- **THEN** the release record SHALL identify it as pending
- **AND** a successful build SHALL NOT be described as proof of full production readiness

#### Scenario: Setup follows current contracts
- **WHEN** an operator follows setup documentation
- **THEN** it SHALL reference Clerk configuration and private attachment storage
- **AND** development demo seeding SHALL NOT be presented as production bootstrap
