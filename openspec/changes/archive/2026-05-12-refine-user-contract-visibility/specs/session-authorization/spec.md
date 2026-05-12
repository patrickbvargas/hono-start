## MODIFIED Requirements

### Requirement: Shared authorization helpers
The system SHALL evaluate permission decisions through shared authorization helpers that accept the logged-user actor and optional resource context as explicit inputs. The shared authorization surface MUST keep `can(session, action, resource)` and `assertCan(session, action, resource)` as the canonical action API, MUST derive the exported permission type from canonical action and entity catalogs rather than a manually maintained string union, and MUST avoid duplicative feature-specific permission wrappers unless a wrapper has a clear route-facing purpose.

#### Scenario: Contract visibility uses assignment-role-aware resource context
- **WHEN** a resource-scoped authorization check is performed for contract visibility or contract-derived visibility
- **THEN** the decision considers active assignment summaries for the logged-in user, including assignment role and employee type
- **AND** assignment presence alone is not sufficient

#### Scenario: Recommending assignment does not grant regular-user contract access
- **WHEN** a regular authenticated lawyer is present on a contract only through an active `RECOMMENDING` assignment
- **THEN** the shared authorization helper denies contract visibility for that user

#### Scenario: Responsible or recommended lawyer grants regular-user contract access
- **WHEN** a regular authenticated lawyer is present on a contract through an active `RESPONSIBLE` or `RECOMMENDED` assignment
- **THEN** the shared authorization helper allows contract visibility for that user

#### Scenario: Admin assistant assignment grants regular-user contract access
- **WHEN** a regular authenticated administrative assistant is present on a contract through an active `ADMIN_ASSISTANT` assignment
- **THEN** the shared authorization helper allows contract visibility for that user
