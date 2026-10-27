# shared-company-directory Specification

## Purpose

Define shared registration across branches of one company.

## Requirements

### Requirement: Global original master records
The system SHALL store clients and employees as original company-wide entities without firmId, extra profile entities, or branch memberships. All employee settings and lifecycle SHALL be global. Lookup options SHALL remain global.

#### Scenario: Switch branch
- **WHEN** a permitted user changes branch
- **THEN** the same clients, employees and options are available through existing lists and selectors without linking
- **AND** ordinary frontend forms and tables remain without link notices

### Requirement: Keep operations branch scoped
The system SHALL retain Firm ownership on contracts, revenues, fees, remunerations and expenses. Master counts and financial summaries SHALL expose only the active branch's operations.

#### Scenario: Read shared client finance
- **WHEN** a shared client has contracts in two branches
- **THEN** each branch sees the same client registration and only its own contracts and financial amounts

### Requirement: Preserve original schema and history
Migration SHALL restore master fields directly on Client and Employee and preserve existing IDs, storage paths and operation references. It SHALL reject duplicate legacy memberships and orphan profiles before altering data.

#### Scenario: Reconcile conflicting old memberships
- **WHEN** more than one legacy row points to one shared profile
- **THEN** migration stops atomically for explicit reconciliation instead of guessing global settings or Clerk identity anchors

### Requirement: One-company installation boundary
The system SHALL treat every Firm in this installation as a branch of one company. Global masters SHALL NOT provide separate-company directory isolation. A globally shared identity or a unique record ID SHALL NOT grant access to another branch's operational records.

#### Scenario: New branch shares registration only
- **WHEN** an operator maps an authorized Organization to a new Firm in this installation
- **THEN** eligible existing clients, employees and lookup options remain available under current grants
- **AND** operational data remains limited to that Firm and its applicable own/assigned scopes
