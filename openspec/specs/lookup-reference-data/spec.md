# Spec: lookup-reference-data

## Purpose

Define the global employee, attachment, and expense-category lookup reference tables and the option-query behaviour used to populate lookup-backed selectors.

---

## Requirements

### Requirement: Employee lookup tables store active state
The system SHALL store an `isActive` boolean on global lookup tables used by product features, including `EmployeeType`, `UserRole`, and `AttachmentType`. The field SHALL default to `true` so existing and newly seeded lookup rows remain active unless explicitly deactivated later.

#### Scenario: Existing lookup rows gain active state during migration
- **WHEN** the database migration adds `isActive` to `employee_types`, `user_roles`, or `attachment_types`
- **THEN** all existing rows are persisted with `isActive = true`
- **AND** future inserts default to `isActive = true`

#### Scenario: Seeded employee lookup rows remain active
- **WHEN** the seed script upserts the default employee types and user roles
- **THEN** each seeded row is stored with `isActive = true`

#### Scenario: Seeded attachment lookup rows remain active
- **WHEN** the seed script upserts the default attachment types
- **THEN** each seeded row is stored with `isActive = true`

### Requirement: Employee lookup option queries return all rows
The system SHALL return all lookup rows from option queries used to populate lookup-backed selectors for employee and attachment features. This lookup-options rule SHALL act as the canonical behavior for lookup-backed entity form options, and lookup option results SHALL remain sorted by `label` ascending.

#### Scenario: Employee type options include active and inactive rows
- **WHEN** the employee type option query is executed
- **THEN** all `EmployeeType` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: User role options include active and inactive rows
- **WHEN** the employee role option query is executed
- **THEN** all `UserRole` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: Attachment type options include active and inactive rows
- **WHEN** the attachment type option query is executed
- **THEN** all `AttachmentType` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: Lookup option payload uses stable value identity
- **WHEN** a lookup-backed form field receives employee type, user role, or attachment type options
- **THEN** each option exposes the lookup row `value` as the field-selection key
- **AND** the option label remains the localized display text

#### Scenario: Existing records may still reference inactive lookup rows
- **WHEN** a record already references an `EmployeeType`, `UserRole`, or `AttachmentType` that later becomes inactive
- **THEN** the persisted foreign key remains valid
- **AND** the inactive lookup row is still returned by the generic option query as a disabled option

### Requirement: Lookup catalogs expose stable categorical values
The system SHALL expose global lookup catalogs through stable application-facing `value` identifiers and localized pt-BR `label` values. The expense-management category catalog SHALL be part of this lookup contract.

#### Scenario: Expense categories are seeded as stable lookup values
- **WHEN** the system seeds or loads the expense-category catalog
- **THEN** it exposes the following stable values and labels:
- **AND** `PAYROLL_LAWYERS` => `Folha Advogados`
- **AND** `PAYROLL_INTERNS` => `Folha Estagiários`
- **AND** `PAYROLL_STAFF` => `Folha Funcionários`
- **AND** `TAX_PIS` => `PIS`
- **AND** `TAX_IRPJ` => `IRPJ`
- **AND** `TAX_COFINS` => `COFINS`
- **AND** `TAX_ISSQN` => `ISSQN`
- **AND** `TAX_CSLL` => `CSLL`
- **AND** `TAX_OTHER` => `Outros Impostos`
- **AND** `PHONE` => `Telefone`
- **AND** `MEDIA` => `Mídia`
- **AND** `POSTAGE` => `Correio`
- **AND** `CONDOMINIUM` => `Condomínio`
- **AND** `ELECTRICITY` => `RGE`
- **AND** `MEALS` => `Refeitório`
- **AND** `ASSETS` => `Patrimônio`
- **AND** `SUPPLIES` => `Insumos`
- **AND** `NOTARY` => `Tabelionato`
- **AND** `COURT_COSTS` => `Custos Judiciais`
- **AND** `OTHER` => `Outros`

#### Scenario: Expense category fields bind by stable value
- **WHEN** the expense form or expense filter reads or writes a selected category
- **THEN** the application binds the selection by stable lookup `value`
- **AND** user-facing surfaces display the pt-BR `label`

#### Scenario: Inactive expense categories remain visible but disabled
- **WHEN** an expense category is marked inactive after being used by existing expense records
- **THEN** lookup queries still return that category row
- **AND** create flows do not allow selecting it for new choices
- **AND** edit flows may render the persisted inactive category as visible but disabled

#### Scenario: Canonical selectable-options rule is reused by future lookup-backed forms
- **WHEN** a future entity form loads options from a lookup table
- **THEN** the lookup option query returns active and inactive rows
- **AND** inactive rows are rendered as disabled options
- **AND** the field component binds the selected option by lookup `value`
