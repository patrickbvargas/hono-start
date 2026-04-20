## ADDED Requirements

### Requirement: Employee lookup-backed writes follow the reference per-lookup flow
The system SHALL implement employee create and update lookup validation as separate per-lookup responsibilities aligned with the `clients_v2` reference flow, even though employees validates both employee type and user role on the same write.

#### Scenario: Employee slice keeps the same shared lookup names as the reference slice
- **WHEN** the employee slice needs equivalent lookup-backed responsibilities for employee type and user role
- **THEN** it SHALL use the shared naming pattern `get...ByValue`, `assert...Exists`, and `assert...CanBeSelected`
- **AND** employee-only aggregate helper names such as combined lookup resolvers or combined selectability assertions SHALL not remain as the primary house pattern

#### Scenario: Type and role are resolved independently before write
- **WHEN** an employee create or update write receives submitted `type` and `role` lookup values
- **THEN** the server SHALL resolve the employee type and user role independently by stable lookup `value`
- **AND** each resolved lookup SHALL be validated before persistence

#### Scenario: Unknown lookup values fail at the owning lookup boundary
- **WHEN** an employee write submits an unknown employee type or unknown user role
- **THEN** the system SHALL reject the write with the lookup-specific Portuguese error for the invalid selection
- **AND** the rejection SHALL not depend on a combined lookup-selection validator to determine which lookup failed

#### Scenario: Inactive persisted selections remain valid on edit
- **WHEN** an existing employee already references an inactive type or inactive role and the edit flow keeps that same persisted lookup value
- **THEN** the system SHALL allow the update to proceed if the rest of the payload is valid
- **AND** changing the employee to a different inactive lookup value SHALL remain rejected
