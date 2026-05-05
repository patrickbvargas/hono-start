## ADDED Requirements

### Requirement: Automated tests cover business-critical integrity branches
The test suite SHALL directly protect the highest-risk lifecycle, side-effect, and hook-orchestration branches whose regressions could silently weaken financial integrity, authorization guarantees, or user-facing recovery flows.

#### Scenario: Employee lifecycle mutations cover blocked and successful transitions
- **WHEN** employee delete and restore mutations are exercised directly
- **THEN** tests SHALL cover blocked deletion caused by active assignment or remuneration dependencies where the documented contract requires that guard
- **AND** tests SHALL cover successful soft-delete and restore writes, including audit-log side effects

#### Scenario: Fee mutation coverage includes reparenting and disabled-remuneration branches
- **WHEN** fee update mutations are exercised directly
- **THEN** tests SHALL cover reparenting guards for manual overrides and remuneration-preservation conflicts
- **AND** tests SHALL cover the branch where remuneration generation is disabled and previously created remunerations remain unchanged

#### Scenario: Fee lifecycle coverage includes reverse contract-status synchronization
- **WHEN** fee delete or restore mutations change whether a contract remains fully paid
- **THEN** tests SHALL cover contract-status synchronization for both completion and reactivation paths
- **AND** tests SHALL cover branches where status-lock semantics prevent automatic transitions

#### Scenario: Contract mutation coverage includes successful lifecycle writes and status guards
- **WHEN** contract create, update, delete, or restore mutations are exercised directly
- **THEN** tests SHALL cover successful writes with audit behavior
- **AND** tests SHALL cover initial-status guards, read-only lifecycle guards, and lookup-driven lifecycle constraints that are enforced before persistence

#### Scenario: Authentication reset coverage protects success orchestration
- **WHEN** password reset request or completion hooks are exercised
- **THEN** tests SHALL cover safe success feedback, session-query invalidation where applicable, and navigation to the login route after successful password reset completion

#### Scenario: Attachment mutation coverage protects negative infrastructure branches
- **WHEN** attachment upload and delete mutations are exercised directly
- **THEN** tests SHALL cover unknown or inactive attachment types, upload-failure mapping, missing-record delete failures, and cleanup after persistence failures
